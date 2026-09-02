from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.database.session import get_db
from app.models.reading import HealthReading
from app.models.patient import Patient
from app.schemas.reading import SensorPayload, ProcessedReadingResponse
from app.services.simulator_service import simulator_service

router = APIRouter(prefix="/readings", tags=["Health Readings"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def ingest_sensor_reading(payload: SensorPayload):
    """
    Standard ingestion endpoint for IoT devices or virtual sensor transmitters.
    Passes payload through Edge Processor -> Abnormality Detector -> Database -> WebSocket.
    """
    try:
        raw_dict = payload.model_dump()
        result = await simulator_service.ingest_single_reading(raw_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/patient/{patient_id}", response_model=List[ProcessedReadingResponse])
def get_patient_readings(
    patient_id: int,
    limit: int = Query(50, ge=1, le=500),
    time_range: Optional[str] = Query(None, description="1h, 24h, 7d, all"),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    query = db.query(HealthReading).filter(HealthReading.patient_id == patient_id)
    query = query.order_by(HealthReading.timestamp.desc()).limit(limit)
    readings = query.all()
    return list(reversed(readings))  # Chronological order for charts

@router.get("/latest", response_model=List[ProcessedReadingResponse])
def get_all_latest_readings(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    latest_readings = []
    for p in patients:
        reading = db.query(HealthReading).filter(HealthReading.patient_id == p.id).order_by(HealthReading.timestamp.desc()).first()
        if reading:
            latest_readings.append(reading)
    return latest_readings
