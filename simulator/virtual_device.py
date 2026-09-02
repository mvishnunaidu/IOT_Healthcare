import requests
import json
import time
from datetime import datetime, timezone
from simulator.sensors.heart_rate import HeartRateSensor
from simulator.sensors.spo2 import SpO2Sensor
from simulator.sensors.temperature import TemperatureSensor

class VirtualIoTDevice:
    def __init__(self, device_id: str = "ESP32_VIRTUAL_01", backend_url: str = "http://127.0.0.1:8000/api/readings"):
        self.device_id = device_id
        self.backend_url = backend_url
        self.hr_sensor = HeartRateSensor()
        self.spo2_sensor = SpO2Sensor()
        self.temp_sensor = TemperatureSensor()

    def sample_and_transmit(self, patient_id: int = 1, scenario: str = "NORMAL") -> dict:
        payload = {
            "patient_id": patient_id,
            "device_id": self.device_id,
            "heart_rate": self.hr_sensor.read(scenario),
            "spo2": self.spo2_sensor.read(scenario),
            "temperature": self.temp_sensor.read(scenario),
            "systolic_bp": 120.0,
            "diastolic_bp": 80.0,
            "respiratory_rate": 16.0
        }
        try:
            response = requests.post(self.backend_url, json=payload, timeout=5)
            return {"status": response.status_code, "data": response.json()}
        except Exception as e:
            return {"status": "error", "error": str(e)}
