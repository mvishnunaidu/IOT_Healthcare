from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class HealthReading(Base):
    __tablename__ = "health_readings"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    device_id = Column(String(50), default="VIRTUAL_NODE_01")
    heart_rate = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    respiratory_rate = Column(Float, nullable=True)
    status = Column(String(20), default="NORMAL", index=True)  # NORMAL, WARNING, CRITICAL
    analysis_reason = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    patient = relationship("Patient", back_populates="readings")
    alerts = relationship("Alert", back_populates="reading")
