from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.patient import Patient
from app.models.reading import HealthReading
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse

router = APIRouter(prefix="/patients", tags=["Patients"])

def enrich_patient_response(p: Patient, db: Session) -> dict:
    latest = db.query(HealthReading).filter(HealthReading.patient_id == p.id).order_by(HealthReading.timestamp.desc()).first()
    latest_dict = None
    status = "NORMAL"
    if latest:
        status = latest.status
        latest_dict = {
            "heart_rate": latest.heart_rate,
            "spo2": latest.spo2,
            "temperature": latest.temperature,
            "systolic_bp": latest.systolic_bp,
            "diastolic_bp": latest.diastolic_bp,
            "respiratory_rate": latest.respiratory_rate,
            "status": latest.status,
            "timestamp": latest.timestamp.isoformat()
        }
    
    return {
        "id": p.id,
        "patient_code": p.patient_code,
        "name": p.name,
        "age": p.age,
        "gender": p.gender,
        "phone": p.phone,
        "email": p.email,
        "address": p.address,
        "emergency_contact": p.emergency_contact,
        "medical_conditions": p.medical_conditions,
        "room_number": p.room_number,
        "device_id": p.device_id,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
        "latest_reading": latest_dict,
        "current_status": status
    }

@router.get("", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    return [enrich_patient_response(p, db) for p in patients]

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter(Patient.patient_code == patient_in.patient_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient with code '{patient_in.patient_code}' already exists"
        )
    
    patient = Patient(**patient_in.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return enrich_patient_response(patient, db)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return enrich_patient_response(patient, db)

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, patient_update: PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = patient_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    db.commit()
    db.refresh(patient)
    return enrich_patient_response(patient, db)

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return None
