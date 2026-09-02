from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    patient_id: int
    reading_id: Optional[int] = None
    parameter: str
    value: Optional[float] = None
    threshold_violated: Optional[str] = None
    severity: str  # WARNING, CRITICAL
    title: str
    message: str

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    acknowledged: Optional[bool] = None
    acknowledged_by: Optional[str] = None
    resolved: Optional[bool] = None

class AlertResponse(AlertBase):
    id: int
    acknowledged: bool
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved: bool
    resolved_at: Optional[datetime] = None
    timestamp: datetime
    patient_name: Optional[str] = None
    patient_code: Optional[str] = None

    model_config = {"from_attributes": True}
