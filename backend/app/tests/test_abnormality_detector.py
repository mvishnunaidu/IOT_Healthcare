import pytest
from app.services.abnormality_detector import AbnormalityDetector

def test_abnormality_detector_normal_scenario():
    detector = AbnormalityDetector()
    reading = {
        "heart_rate": 72.0,
        "spo2": 98.0,
        "temperature": 36.7
    }
    result = detector.evaluate(reading)
    assert result["overall_status"] == "NORMAL"
    assert result["severity_score"] == 0
    assert len(result["issues_detected"]) == 0
    assert len(result["generated_alerts"]) == 0

def test_abnormality_detector_warning_scenario():
    detector = AbnormalityDetector()
    reading = {
        "heart_rate": 108.0,
        "spo2": 93.0,
        "temperature": 37.9
    }
    result = detector.evaluate(reading)
    assert result["overall_status"] == "WARNING"
    assert result["severity_score"] == 1
    assert len(result["issues_detected"]) >= 1

def test_abnormality_detector_critical_scenario():
    detector = AbnormalityDetector()
    reading = {
        "heart_rate": 135.0,
        "spo2": 86.0,
        "temperature": 39.1
    }
    result = detector.evaluate(reading)
    assert result["overall_status"] == "CRITICAL"
    assert result["severity_score"] == 2
    assert len(result["generated_alerts"]) >= 2
    # Ensure SpO2 and HR issues are listed
    issues_str = " ".join(result["issues_detected"])
    assert "Heart rate" in issues_str or "Tachycardia" in issues_str
    assert "SpO2" in issues_str or "Hypoxemia" in issues_str
