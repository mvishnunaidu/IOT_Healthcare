import random

class HeartRateSensor:
    def __init__(self, baseline: float = 72.0):
        self.baseline = baseline

    def read(self, scenario: str = "NORMAL") -> float:
        noise = random.uniform(-2.0, 2.0)
        if scenario == "NORMAL":
            return round(72.0 + noise, 1)
        elif scenario == "WARNING":
            return round(108.0 + random.uniform(-3.0, 3.0), 1)
        elif scenario == "CRITICAL":
            return round(135.0 + random.uniform(-4.0, 4.0), 1)
        return round(self.baseline + noise, 1)
