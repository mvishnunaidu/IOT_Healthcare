from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database.session import get_db
from app.models.alert import Alert
from app.models.patient import Patient
from app.schemas.alert import AlertResponse, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["Alerts"])

def enrich_alert_response(alert: Alert, db: Session) -> dict:
    patient = db.query(Patient).filter(Patient.id == alert.patient_id).first()
    return {
        "id": alert.id,
        "patient_id": alert.patient_id,
        "reading_id": alert.reading_id,
        "parameter": alert.parameter,
        "value": alert.value,
        "threshold_violated": alert.threshold_violated,
        "severity": alert.severity,
        "title": alert.title,
        "message": alert.message,
        "acknowledged": alert.acknowledged,
        "acknowledged_by": alert.acknowledged_by,
        "acknowledged_at": alert.acknowledged_at,
        "resolved": alert.resolved,
        "resolved_at": alert.resolved_at,
        "timestamp": alert.timestamp,
        "patient_name": patient.name if patient else "Unknown Patient",
        "patient_code": patient.patient_code if patient else "N/A"
    }

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[str] = Query(None, description="WARNING, CRITICAL"),
    resolved: Optional[bool] = Query(None),
    patient_id: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)
    if patient_id:
        query = query.filter(Alert.patient_id == patient_id)
        
    query = query.order_by(Alert.timestamp.desc()).limit(limit)
    alerts = query.all()
    return [enrich_alert_response(a, db) for a in alerts]

@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert(alert_id: int, alert_update: AlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    now = datetime.now(timezone.utc)
    if alert_update.acknowledged is not None:
        alert.acknowledged = alert_update.acknowledged
        if alert_update.acknowledged:
            alert.acknowledged_by = alert_update.acknowledged_by or "Dr. Sameer Verma"
            alert.acknowledged_at = now
            
    if alert_update.resolved is not None:
        alert.resolved = alert_update.resolved
        if alert_update.resolved:
            alert.resolved_at = now

    db.commit()
    db.refresh(alert)
    return enrich_alert_response(alert, db)
