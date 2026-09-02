import requests
import random
import time
from datetime import datetime, timezone

class VirtualIoTDevice:
    def __init__(self, device_id: str = "ESP32_VIRTUAL_01", backend_url: str = "http://127.0.0.1:8000/api/readings"):
        self.device_id = device_id
        self.backend_url = backend_url

    def _generate_vitals(self, scenario: str = "NORMAL"):
        noise = random.uniform(-1.5, 1.5)
        if scenario == "NORMAL":
            hr = round(72.0 + noise, 1)
            spo2 = round(min(100.0, 98.2 + random.uniform(-0.5, 0.5)), 1)
            temp = round(36.7 + random.uniform(-0.15, 0.15), 1)
            sys_bp, dia_bp, rr = 120.0, 80.0, 16.0
        elif scenario == "WARNING":
            hr = round(108.0 + random.uniform(-3.0, 3.0), 1)
            spo2 = round(93.0 + random.uniform(-0.8, 0.8), 1)
            temp = round(37.9 + random.uniform(-0.2, 0.2), 1)
            sys_bp, dia_bp, rr = 132.0, 86.0, 22.0
        elif scenario == "CRITICAL":
            hr = round(136.0 + random.uniform(-4.0, 4.0), 1)
            spo2 = round(86.0 + random.uniform(-1.0, 1.0), 1)
            temp = round(39.1 + random.uniform(-0.25, 0.25), 1)
            sys_bp, dia_bp, rr = 148.0, 94.0, 28.0
        else:
            hr, spo2, temp = 72.0, 98.0, 36.7
            sys_bp, dia_bp, rr = 120.0, 80.0, 16.0

        return hr, spo2, temp, sys_bp, dia_bp, rr

    def sample_and_transmit(self, patient_id: int = 1, scenario: str = "NORMAL") -> dict:
        hr, spo2, temp, sys_bp, dia_bp, rr = self._generate_vitals(scenario)
        payload = {
            "patient_id": patient_id,
            "device_id": self.device_id,
            "heart_rate": hr,
            "spo2": spo2,
            "temperature": temp,
            "systolic_bp": sys_bp,
            "diastolic_bp": dia_bp,
            "respiratory_rate": rr
        }
        try:
            response = requests.post(self.backend_url, json=payload, timeout=5)
            return {"status": response.status_code, "data": response.json()}
        except Exception as e:
            return {"status": "error", "error": str(e)}
