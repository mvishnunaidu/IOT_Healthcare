import random

class TemperatureSensor:
    def __init__(self, baseline: float = 36.7):
        self.baseline = baseline

    def read(self, scenario: str = "NORMAL") -> float:
        if scenario == "NORMAL":
            return round(36.7 + random.uniform(-0.15, 0.15), 1)
        elif scenario == "WARNING":
            return round(37.9 + random.uniform(-0.2, 0.2), 1)
        elif scenario == "CRITICAL":
            return round(39.1 + random.uniform(-0.25, 0.25), 1)
        return round(self.baseline + random.uniform(-0.1, 0.1), 1)
