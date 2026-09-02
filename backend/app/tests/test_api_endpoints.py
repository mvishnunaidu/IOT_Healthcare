import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.init_db import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Software-Simulated IoT Pipeline" in data["architecture"]

def test_get_patients_endpoint(client):
    response = client.get("/api/patients")
    assert response.status_code == 200
    patients = response.json()
    assert len(patients) >= 1
    assert any(p["name"] == "Rahul Kumar" for p in patients)

def test_architecture_nodes_endpoint(client):
    response = client.get("/api/architecture/nodes")
    assert response.status_code == 200
    nodes = response.json()
    assert len(nodes) == 8
    node_titles = [n["title"] for n in nodes]
    assert "Virtual Sensors" in node_titles
    assert "Edge Processing" in node_titles
    assert "Abnormality Detection" in node_titles

def test_custom_simulation_analyze(client):
    payload = {
        "patient_id": 1,
        "heart_rate": 135.0,
        "spo2": 86.0,
        "temperature": 39.1,
        "device_id": "TEST_UNIT"
    }
    response = client.post("/api/simulation/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["detection"]["overall_status"] == "CRITICAL"
    assert len(data["detection"]["generated_alerts"]) >= 1
