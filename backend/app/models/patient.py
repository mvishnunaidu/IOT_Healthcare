from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    address = Column(String(255), nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    medical_conditions = Column(String(255), nullable=True)
    room_number = Column(String(20), nullable=True)
    device_id = Column(String(50), default="VIRTUAL_NODE_01")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    readings = relationship("HealthReading", back_populates="patient", cascade="all, delete-orphan", order_by="HealthReading.timestamp.desc()")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan", order_by="Alert.timestamp.desc()")
