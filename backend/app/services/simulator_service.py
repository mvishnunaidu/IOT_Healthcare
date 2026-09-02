"""
Virtual IoT Sensor Simulator Service
====================================
Simulates physiological vital signs data acquisition from wearable/bedside medical sensors,
packages them as standard IoT payloads, and feeds them into the edge computing and detection pipeline.
"""

import asyncio
import random
import math
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import logging
from app.services.edge_processor import edge_processor
from app.services.abnormality_detector import abnormality_detector
from app.websocket.connection_manager import manager
from app.database.session import SessionLocal
from app.models.reading import HealthReading
from app.models.alert import Alert
from app.models.patient import Patient

logger = logging.getLogger("healthcare_iot.simulator")

class VirtualSensorSimulator:
    def __init__(self):
        self.is_running = False
        self.patient_id: Optional[int] = 1
        self.patient_name: Optional[str] = "Rahul Kumar"
        self.mode: str = "NORMAL"  # NORMAL, WARNING, CRITICAL, RANDOM, WAVE
        self.interval_seconds: float = 3.0
        self.device_id: str = "VIRTUAL_NODE_01"
        self.packets_transmitted: int = 0
        self.last_transmission: Optional[str] = None
        self.latest_reading: Optional[Dict[str, Any]] = None
        
        self._task: Optional[asyncio.Task] = None
        self._tick_count: int = 0

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "active_patient_id": self.patient_id,
            "active_patient_name": self.patient_name,
            "mode": self.mode,
            "interval_seconds": self.interval_seconds,
            "packets_transmitted": self.packets_transmitted,
            "last_transmission": self.last_transmission,
            "latest_reading": self.latest_reading,
            "device_id": self.device_id
        }

    def _generate_vitals_for_mode(self, mode: str) -> Dict[str, float]:
        """
        Generates realistic physiological readings with micro-variations.
        """
        self._tick_count += 1
        noise = lambda amplitude: random.uniform(-amplitude, amplitude)

        if mode == "NORMAL":
            # Scenario 1: Stable Patient Baseline
            hr = 74.0 + noise(3.0)
            spo2 = 98.2 + noise(0.8)
            temp = 36.7 + noise(0.15)
            sys_bp = 118.0 + noise(4.0)
            dia_bp = 78.0 + noise(3.0)
            rr = 16.0 + noise(1.0)
        elif mode == "WARNING":
            # Scenario 2: Moderate Tachycardia / Pre-shock / Low Fever
            hr = 108.0 + noise(4.0)
            spo2 = 93.0 + noise(0.8)
            temp = 37.9 + noise(0.2)
            sys_bp = 132.0 + noise(5.0)
            dia_bp = 86.0 + noise(4.0)
            rr = 22.0 + noise(2.0)
        elif mode == "CRITICAL":
            # Scenario 3: Severe Hypoxia & High Fever / Shock
            hr = 136.0 + noise(5.0)
            spo2 = 86.5 + noise(1.2)
            temp = 39.2 + noise(0.25)
            sys_bp = 148.0 + noise(6.0)
            dia_bp = 94.0 + noise(4.0)
            rr = 28.0 + noise(2.0)
        elif mode == "WAVE":
            # Sine oscillation to demonstrate dynamic threshold transitions
            phase = math.sin(self._tick_count * 0.25)
            hr = 85.0 + 35.0 * phase + noise(2.0)
            spo2 = 96.0 - 6.0 * max(0.0, phase) + noise(0.5)
            temp = 37.0 + 1.2 * max(0.0, phase) + noise(0.1)
            sys_bp = 120.0 + 20.0 * phase
            dia_bp = 80.0 + 10.0 * phase
            rr = 16.0 + 8.0 * max(0.0, phase)
        else: # RANDOM
            modes = ["NORMAL", "WARNING", "CRITICAL"]
            chosen = random.choice(modes)
            return self._generate_vitals_for_mode(chosen)

        return {
            "heart_rate": round(hr, 1),
            "spo2": round(min(100.0, max(50.0, spo2)), 1),
            "temperature": round(temp, 1),
            "systolic_bp": round(sys_bp, 1),
            "diastolic_bp": round(dia_bp, 1),
            "respiratory_rate": round(rr, 1)
        }

    async def ingest_single_reading(self, raw_payload: Dict[str, Any], create_alert: bool = True) -> Dict[str, Any]:
        """
        Executes the full IoT Pipeline for a single reading:
        Raw Sensor -> Edge Processing -> Abnormality Detection -> DB Store -> Broadcast.
        """
        # 1. Edge Processing
        clean_payload, edge_meta = edge_processor.process(raw_payload)

        # 2. Abnormality Detection
        # We need to retrieve patient baselines if they exist
        db = SessionLocal()
        patient_baselines = None
        try:
            p_id = clean_payload["patient_id"]
            patient = db.query(Patient).filter(Patient.id == p_id).first()
            if patient and patient.baselines:
                patient_baselines = patient.baselines
        except Exception:
            pass # fallback to default if db error early on

        detection = abnormality_detector.evaluate(clean_payload, patient_baselines)
        status = detection["overall_status"]
        issues_summary = "; ".join(detection["issues_detected"]) if detection["issues_detected"] else "Vitals nominal"

        # 3. Database Persistence
        db = SessionLocal()
        created_reading_id = None
        new_alerts_created = []
        try:
            # Check if patient exists
            p_id = clean_payload["patient_id"]
            patient = db.query(Patient).filter(Patient.id == p_id).first()
            if not patient:
                # If patient does not exist, lookup first patient or create fallback
                first_p = db.query(Patient).first()
                if first_p:
                    clean_payload["patient_id"] = first_p.id
                    p_id = first_p.id
                    patient = first_p

            db_reading = HealthReading(
                patient_id=p_id,
                device_id=clean_payload["device_id"],
                heart_rate=clean_payload["heart_rate"],
                spo2=clean_payload["spo2"],
                temperature=clean_payload["temperature"],
                systolic_bp=clean_payload.get("systolic_bp"),
                diastolic_bp=clean_payload.get("diastolic_bp"),
                respiratory_rate=clean_payload.get("respiratory_rate"),
                status=status,
                analysis_reason=issues_summary,
                timestamp=clean_payload["timestamp"]
            )
            db.add(db_reading)
            db.commit()
            db.refresh(db_reading)
            created_reading_id = db_reading.id

            # Create DB alerts if abnormal and requested
            if create_alert and detection["generated_alerts"]:
                for alert_def in detection["generated_alerts"]:
                    # Prevent alert spam: check if similar unacknowledged alert exists within 15 seconds
                    db_alert = Alert(
                        patient_id=p_id,
                        reading_id=created_reading_id,
                        parameter=alert_def["parameter"],
                        value=alert_def["value"],
                        threshold_violated=alert_def["threshold_violated"],
                        severity=alert_def["severity"],
                        title=alert_def["title"],
                        message=alert_def["message"],
                        timestamp=clean_payload["timestamp"]
                    )
                    db.add(db_alert)
                    db.commit()
                    db.refresh(db_alert)
                    
                    alert_dict = {
                        "id": db_alert.id,
                        "patient_id": db_alert.patient_id,
                        "reading_id": db_alert.reading_id,
                        "parameter": db_alert.parameter,
                        "value": db_alert.value,
                        "severity": db_alert.severity,
                        "title": db_alert.title,
                        "message": db_alert.message,
                        "timestamp": db_alert.timestamp.isoformat(),
                        "acknowledged": db_alert.acknowledged,
                        "resolved": db_alert.resolved,
                        "patient_name": patient.name if patient else "Patient"
                    }
                    new_alerts_created.append(alert_dict)
                    # Broadcast alert immediately via WebSocket
                    await manager.broadcast_alert(alert_dict)

        except Exception as e:
            db.rollback()
            logger.error(f"Error persisting reading/alerts: {e}")
        finally:
            db.close()

        # 4. Form reading dictionary
        reading_dict = {
            "id": created_reading_id or 0,
            "patient_id": clean_payload["patient_id"],
            "device_id": clean_payload["device_id"],
            "heart_rate": clean_payload["heart_rate"],
            "spo2": clean_payload["spo2"],
            "temperature": clean_payload["temperature"],
            "systolic_bp": clean_payload.get("systolic_bp"),
            "diastolic_bp": clean_payload.get("diastolic_bp"),
            "respiratory_rate": clean_payload.get("respiratory_rate"),
            "status": status,
            "analysis_reason": issues_summary,
            "timestamp": clean_payload["timestamp"].isoformat(),
            "edge_telemetry": edge_meta
        }

        # 5. Broadcast new reading to live WebSocket clients
        await manager.broadcast_reading(reading_dict, detection)

        self.latest_reading = reading_dict
        self.packets_transmitted += 1
        self.last_transmission = datetime.now(timezone.utc).strftime("%H:%M:%S")

        return {
            "reading": reading_dict,
            "detection": detection,
            "edge_telemetry": edge_meta,
            "alerts": new_alerts_created
        }

    async def _simulation_loop(self):
        """Background continuous streaming loop."""
        logger.info(f"Simulator streaming started for Patient ID {self.patient_id} in mode {self.mode}")
        while self.is_running:
            try:
                # Generate vitals
                vitals = self._generate_vitals_for_mode(self.mode)
                raw_payload = {
                    "patient_id": self.patient_id or 1,
                    "device_id": self.device_id,
                    "heart_rate": vitals["heart_rate"],
                    "spo2": vitals["spo2"],
                    "temperature": vitals["temperature"],
                    "systolic_bp": vitals["systolic_bp"],
                    "diastolic_bp": vitals["diastolic_bp"],
                    "respiratory_rate": vitals["respiratory_rate"]
                }
                
                await self.ingest_single_reading(raw_payload)
            except Exception as e:
                logger.error(f"Exception inside simulation loop: {e}", exc_info=True)

            await asyncio.sleep(self.interval_seconds)

    def start(self, patient_id: int, mode: str = "NORMAL", interval_seconds: float = 3.0, device_id: str = "VIRTUAL_NODE_01", patient_name: Optional[str] = None):
        self.patient_id = patient_id
        self.mode = mode.upper()
        self.interval_seconds = max(1.0, interval_seconds)
        self.device_id = device_id
        if patient_name:
            self.patient_name = patient_name
        self.is_running = True

        if self._task and not self._task.done():
            self._task.cancel()
        
        self._task = asyncio.create_task(self._simulation_loop())
        logger.info(f"Simulation started. Mode={self.mode}, Interval={self.interval_seconds}s")

    def stop(self):
        self.is_running = False
        if self._task and not self._task.done():
            self._task.cancel()
        logger.info("Simulation stopped.")

    def set_mode(self, mode: str):
        self.mode = mode.upper()
        logger.info(f"Simulation mode set to {self.mode}")

    def set_interval(self, seconds: float):
        self.interval_seconds = max(1.0, seconds)

simulator_service = VirtualSensorSimulator()
