from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    reading_id = Column(Integer, ForeignKey("health_readings.id", ondelete="SET NULL"), nullable=True)
    parameter = Column(String(50), nullable=False)  # heart_rate, spo2, temperature, overall, etc.
    value = Column(Float, nullable=True)
    threshold_violated = Column(String(100), nullable=True)
    severity = Column(String(20), nullable=False, index=True)  # WARNING, CRITICAL
    title = Column(String(150), nullable=False)
    message = Column(String(255), nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    patient = relationship("Patient", back_populates="alerts")
    reading = relationship("HealthReading", back_populates="alerts")
