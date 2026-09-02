import pytest
from app.services.edge_processor import EdgeProcessor, EdgeValidationError

def test_edge_processor_valid_payload():
    processor = EdgeProcessor()
    payload = {
        "patient_id": 1,
        "device_id": "TEST_NODE",
        "heart_rate": 75.456,
        "spo2": 98.23,
        "temperature": 36.67
    }
    clean, telemetry = processor.process(payload)
    assert clean["patient_id"] == 1
    assert clean["heart_rate"] == 75.5
    assert clean["spo2"] == 98.2
    assert clean["temperature"] == 36.7
    assert telemetry["signal_quality_score"] == 100
    assert "processing_latency_ms" in telemetry

def test_edge_processor_missing_patient():
    processor = EdgeProcessor()
    payload = {
        "heart_rate": 75.0,
        "spo2": 98.0,
        "temperature": 36.7
    }
    with pytest.raises(EdgeValidationError, match="Missing 'patient_id'"):
        processor.process(payload)

def test_edge_processor_out_of_bounds_sensor_fault():
    processor = EdgeProcessor()
    payload = {
        "patient_id": 1,
        "heart_rate": 350.0,  # Physically impossible for humans
        "spo2": 98.0,
        "temperature": 36.7
    }
    with pytest.raises(EdgeValidationError, match="outside physical physiological range"):
        processor.process(payload)
