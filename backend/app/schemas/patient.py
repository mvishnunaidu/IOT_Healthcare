from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PatientBase(BaseModel):
    patient_code: str
    name: str
    age: int
    gender: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_conditions: Optional[str] = None
    room_number: Optional[str] = None
    device_id: Optional[str] = "VIRTUAL_NODE_01"

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_conditions: Optional[str] = None
    room_number: Optional[str] = None
    device_id: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    latest_reading: Optional[dict] = None
    current_status: Optional[str] = "NORMAL"

    model_config = {"from_attributes": True}
