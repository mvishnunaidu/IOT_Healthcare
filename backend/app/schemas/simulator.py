from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SimulationStartRequest(BaseModel):
    patient_id: int
    mode: str = Field(default="NORMAL", description="NORMAL, WARNING, CRITICAL, RANDOM, WAVE")
    interval_seconds: float = Field(default=3.0, ge=1.0, le=60.0)
    device_id: Optional[str] = "VIRTUAL_NODE_01"

class SimulationCustomAnalyzeRequest(BaseModel):
    patient_id: int
    heart_rate: float
    spo2: float
    temperature: float
    systolic_bp: Optional[float] = 120.0
    diastolic_bp: Optional[float] = 80.0
    respiratory_rate: Optional[float] = 16.0
    device_id: Optional[str] = "VIRTUAL_MANUAL_01"
    create_alert: Optional[bool] = True

class SimulatorStatusResponse(BaseModel):
    is_running: bool
    active_patient_id: Optional[int] = None
    active_patient_name: Optional[str] = None
    mode: str
    interval_seconds: float
    packets_transmitted: int
    last_transmission: Optional[str] = None
    latest_reading: Optional[Dict[str, Any]] = None
