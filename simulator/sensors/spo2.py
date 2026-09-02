import random

class SpO2Sensor:
    def __init__(self, baseline: float = 98.0):
        self.baseline = baseline

    def read(self, scenario: str = "NORMAL") -> float:
        if scenario == "NORMAL":
            return round(min(100.0, 98.0 + random.uniform(-0.5, 0.5)), 1)
        elif scenario == "WARNING":
            return round(93.0 + random.uniform(-0.8, 0.8), 1)
        elif scenario == "CRITICAL":
            return round(86.0 + random.uniform(-1.0, 1.0), 1)
        return round(self.baseline + random.uniform(-0.5, 0.5), 1)
