"""
Edge Processing Module
======================
Simulates near-sensor edge computing preprocessing that occurs on the IoT Gateway/Microcontroller
prior to transmission to the cloud.

Responsibilities:
1. Payload schema and integrity validation
2. Missing or NaN value rejection
3. Boundary & impossible physiological reading rejection
4. Noise reduction and data normalization (rounding, unit consistency)
5. Timestamping & edge metadata enrichment
"""

from typing import Dict, Any, Tuple, Optional
from datetime import datetime, timezone
import math
import time

class EdgeValidationError(Exception):
    """Raised when incoming sensor data fails edge validation checks."""
    pass

class EdgeProcessor:
    # Absolute physical boundary constraints (anything outside is considered sensor failure or noise)
    PHYSIOLOGICAL_BOUNDS = {
        "heart_rate": (25.0, 260.0),      # BPM
        "spo2": (40.0, 100.0),            # %
        "temperature": (28.0, 45.0),      # °C
        "systolic_bp": (40.0, 260.0),     # mmHg
        "diastolic_bp": (25.0, 180.0),    # mmHg
        "respiratory_rate": (4.0, 60.0),  # Breaths/min
    }

    def __init__(self, node_id: str = "EDGE_NODE_PRIMARY"):
        self.node_id = node_id
        self._previous_readings: Dict[int, Dict[str, float]] = {}

    def process(self, raw_payload: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Processes a raw sensor payload at the edge.
        Returns:
            clean_payload: sanitized, validated, normalized payload
            edge_telemetry: processing stats, quality score, validation notes
        """
        start_time = time.perf_counter()
        
        # 1. Structural Validation
        if not isinstance(raw_payload, dict):
            raise EdgeValidationError("Invalid payload format: Expected JSON object")

        if "patient_id" not in raw_payload:
            raise EdgeValidationError("Edge Validation Error: Missing 'patient_id' in sensor payload")

        patient_id = int(raw_payload["patient_id"])
        device_id = str(raw_payload.get("device_id", "VIRTUAL_NODE_01"))

        # 2. Check required core vitals
        for field in ["heart_rate", "spo2", "temperature"]:
            if field not in raw_payload or raw_payload[field] is None:
                raise EdgeValidationError(f"Edge Validation Error: Required metric '{field}' is missing")

        # 3. Type Conversion & Numerical Sanitization
        try:
            hr = float(raw_payload["heart_rate"])
            spo2 = float(raw_payload["spo2"])
            temp = float(raw_payload["temperature"])
            sys_bp = float(raw_payload["systolic_bp"]) if raw_payload.get("systolic_bp") is not None else 120.0
            dia_bp = float(raw_payload["diastolic_bp"]) if raw_payload.get("diastolic_bp") is not None else 80.0
            rr = float(raw_payload["respiratory_rate"]) if raw_payload.get("respiratory_rate") is not None else 16.0
        except (ValueError, TypeError) as e:
            raise EdgeValidationError(f"Edge Validation Error: Non-numeric reading detected: {str(e)}")

        for val_name, val in [("heart_rate", hr), ("spo2", spo2), ("temperature", temp)]:
            if math.isnan(val) or math.isinf(val):
                raise EdgeValidationError(f"Edge Validation Error: '{val_name}' is NaN or Infinity")

        # 4. Range & Impossible Sensor Bound Checks
        validation_warnings = []
        for metric, val in [
            ("heart_rate", hr), ("spo2", spo2), ("temperature", temp),
            ("systolic_bp", sys_bp), ("diastolic_bp", dia_bp), ("respiratory_rate", rr)
        ]:
            min_b, max_b = self.PHYSIOLOGICAL_BOUNDS[metric]
            if val < min_b or val > max_b:
                raise EdgeValidationError(
                    f"Sensor Hardware Fault: {metric}={val} is outside physical physiological range [{min_b}, {max_b}]"
                )

        # 5. Blood Pressure Consistency Check
        if sys_bp <= dia_bp:
            validation_warnings.append("Systolic BP is less than or equal to Diastolic BP. Clamping pulse pressure.")
            sys_bp = dia_bp + 15.0

        # 6. Edge Smoothing / Noise Filter (EMA with Previous Reading)
        prev = self._previous_readings.get(patient_id)
        if prev:
            # Check for excessive instantaneous artifact jump (>60 BPM sudden delta in 1s)
            hr_delta = abs(hr - prev["heart_rate"])
            if hr_delta > 70:
                # Smooth single-sample artifact
                validation_warnings.append(f"Instantaneous artifact jump of {hr_delta:.1f} BPM detected; smoothed at edge.")
                hr = 0.7 * prev["heart_rate"] + 0.3 * hr

        # Cache reading for temporal filtering
        self._previous_readings[patient_id] = {
            "heart_rate": hr,
            "spo2": spo2,
            "temperature": temp
        }

        # 7. Normalization (rounding to standard decimal resolutions)
        clean_hr = round(hr, 1)
        clean_spo2 = round(min(100.0, spo2), 1)
        clean_temp = round(temp, 1)
        clean_sys = round(sys_bp, 1)
        clean_dia = round(dia_bp, 1)
        clean_rr = round(rr, 1)

        # 8. Edge Telemetry Calculation
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 3)
        quality_score = 100 - (len(validation_warnings) * 15)

        clean_payload = {
            "patient_id": patient_id,
            "device_id": device_id,
            "heart_rate": clean_hr,
            "spo2": clean_spo2,
            "temperature": clean_temp,
            "systolic_bp": clean_sys,
            "diastolic_bp": clean_dia,
            "respiratory_rate": clean_rr,
            "timestamp": datetime.now(timezone.utc)
        }

        edge_telemetry = {
            "edge_node_id": self.node_id,
            "processing_latency_ms": elapsed_ms,
            "signal_quality_score": max(20, quality_score),
            "warnings": validation_warnings,
            "validated_at": datetime.now(timezone.utc).isoformat()
        }

        return clean_payload, edge_telemetry

# Singleton instance for easy import
edge_processor = EdgeProcessor()
