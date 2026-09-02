from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# Standard payload from IoT device / Virtual sensor
class SensorPayload(BaseModel):
    patient_id: int
    device_id: Optional[str] = "VIRTUAL_NODE_01"
    heart_rate: float = Field(..., description="Heart Rate in BPM (30-240)")
    spo2: float = Field(..., description="Oxygen Saturation in % (50-100)")
    temperature: float = Field(..., description="Body Temperature in °C (30-45)")
    systolic_bp: Optional[float] = Field(None, description="Systolic Blood Pressure in mmHg")
    diastolic_bp: Optional[float] = Field(None, description="Diastolic Blood Pressure in mmHg")
    respiratory_rate: Optional[float] = Field(None, description="Breaths per minute")
    timestamp: Optional[datetime] = None
    checksum: Optional[str] = None

class DetectionResult(BaseModel):
    overall_status: str  # NORMAL, WARNING, CRITICAL
    severity_score: int  # 0: Normal, 1: Warning, 2: Critical
    issues_detected: List[str]
    parameters_status: Dict[str, Dict[str, Any]]
    recommendation: Optional[str] = None
    timestamp: datetime

class ProcessedReadingResponse(BaseModel):
    id: int
    patient_id: int
    device_id: str
    heart_rate: float
    spo2: float
    temperature: float
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    respiratory_rate: Optional[float] = None
    status: str
    analysis_reason: Optional[str] = None
    timestamp: datetime
    detection_details: Optional[DetectionResult] = None

    model_config = {"from_attributes": True}

class ReadingFilterParams(BaseModel):
    patient_id: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: Optional[int] = 100
