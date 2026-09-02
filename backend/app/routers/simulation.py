from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.patient import Patient
from app.services.simulator_service import simulator_service
from app.schemas.simulator import SimulationStartRequest, SimulationCustomAnalyzeRequest, SimulatorStatusResponse

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])

@router.get("/status", response_model=SimulatorStatusResponse)
def get_simulation_status():
    return simulator_service.get_status()

@router.post("/start", response_model=SimulatorStatusResponse)
def start_simulation(request: SimulationStartRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    simulator_service.start(
        patient_id=request.patient_id,
        mode=request.mode,
        interval_seconds=request.interval_seconds,
        device_id=request.device_id or patient.device_id,
        patient_name=patient.name
    )
    return simulator_service.get_status()

@router.post("/stop", response_model=SimulatorStatusResponse)
def stop_simulation():
    simulator_service.stop()
    return simulator_service.get_status()

@router.post("/scenario")
def set_simulation_scenario(mode: str = Body(..., embed=True)):
    valid_modes = ["NORMAL", "WARNING", "CRITICAL", "WAVE", "RANDOM"]
    mode_upper = mode.upper()
    if mode_upper not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Choose from {valid_modes}")
    
    simulator_service.set_mode(mode_upper)
    return {"message": f"Simulation scenario changed to {mode_upper}", "mode": mode_upper}

@router.post("/analyze")
async def analyze_custom_vitals(request: SimulationCustomAnalyzeRequest, db: Session = Depends(get_db)):
    """
    Custom simulation endpoint:
    Allows user to manually enter simulated values (e.g. Heart Rate = 135, SpO2 = 86, Temp = 39.1)
    and execute the full edge & abnormality pipeline.
    """
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    raw_payload = {
        "patient_id": request.patient_id,
        "device_id": request.device_id or "VIRTUAL_MANUAL_01",
        "heart_rate": request.heart_rate,
        "spo2": request.spo2,
        "temperature": request.temperature,
        "systolic_bp": request.systolic_bp,
        "diastolic_bp": request.diastolic_bp,
        "respiratory_rate": request.respiratory_rate
    }

    result = await simulator_service.ingest_single_reading(raw_payload, create_alert=request.create_alert or True)
    return result

@router.post("/trigger-abnormal")
async def trigger_abnormal_event(patient_id: int = Body(..., embed=True)):
    """Triggers an instantaneous critical arrhythmia/hypoxia event for demo presentation."""
    raw_payload = {
        "patient_id": patient_id,
        "device_id": "VIRTUAL_NODE_ANOMALY",
        "heart_rate": 138.0,
        "spo2": 85.5,
        "temperature": 39.3,
        "systolic_bp": 155.0,
        "diastolic_bp": 98.0,
        "respiratory_rate": 30.0
    }
    result = await simulator_service.ingest_single_reading(raw_payload, create_alert=True)
    return result
