from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/architecture", tags=["System Architecture"])

ARCHITECTURE_NODES: List[Dict[str, Any]] = [
    {
        "id": "node_patient",
        "step": 1,
        "title": "Patient",
        "category": "Source Entity",
        "short_desc": "Clinical subject with physiological vital metrics and health profile.",
        "purpose": "Represents the human subject being monitored in hospital or remote care.",
        "input": "Clinical diagnosis, demographic records, medication schedules.",
        "output": "Physiological vital signals (ECG waveform, pulse wave, body temperature).",
        "technology": "Clinical Demographics Data Model, Relational Schema.",
        "example_data": {
            "patient_code": "P-1001",
            "name": "Rahul Kumar",
            "age": 42,
            "room_number": "ICU-102"
        },
        "viva_talking_points": [
            "Patients have unique demographic IDs linked with assigned IoT device IDs.",
            "Profiles support continuous multi-vital historical tracking over extended hospitalization windows."
        ]
    },
    {
        "id": "node_virtual_sensors",
        "step": 2,
        "title": "Virtual Sensors",
        "category": "Simulation Layer",
        "short_desc": "Software synthesis of biometric sensors (PPG, Thermistor, NIBP).",
        "purpose": "Generates realistic physiological reading streams matching clinical scenarios (Normal, Warning, Critical).",
        "input": "Simulation mode, time delta, stochastic noise parameters.",
        "output": "Raw vital readings (Heart Rate BPM, SpO2 %, Temp °C, BP mmHg, Resp Rate).",
        "technology": "Python Mathematical Generator, Stochastic Gaussian Modeling, Sine Waveforms.",
        "example_data": {
            "heart_rate": 74.2,
            "spo2": 98.1,
            "temperature": 36.7
        },
        "viva_talking_points": [
            "Replaces physical hardware with high-fidelity software generation for reliable prototyping.",
            "Can simulate sudden acute deterioration (e.g. tachycardia or oxygen desaturation) on demand."
        ]
    },
    {
        "id": "node_virtual_iot_device",
        "step": 3,
        "title": "Virtual IoT Device",
        "category": "Simulation Layer",
        "short_desc": "Emulated microcontroller (ESP32/Raspberry Pi) assembling standard IoT telemetry frames.",
        "purpose": "Collects sensor readings, structures standardized JSON payloads, adds device ID and checksums.",
        "input": "Raw sensor values.",
        "output": "Standardized IoT JSON payload dispatched via REST/WebSocket.",
        "technology": "Python IoT Client, HTTP REST Client, Standard JSON Serializer.",
        "example_data": {
            "device_id": "VIRTUAL_NODE_01",
            "patient_id": 1,
            "timestamp": "2026-09-02T13:30:00Z"
        },
        "viva_talking_points": [
            "Payload schema is completely hardware-agnostic.",
            "A physical ESP32 running C++ / Arduino can replace this module without any backend code changes."
        ]
    },
    {
        "id": "node_edge_processing",
        "step": 4,
        "title": "Edge Processing",
        "category": "Edge Computing Layer",
        "short_desc": "Near-sensor data validation, physical boundary checks, and artifact smoothing.",
        "purpose": "Filters out invalid sensor readings, eliminates motion artifacts, and reduces cloud bandwidth.",
        "input": "Raw IoT JSON payload.",
        "output": "Sanitized, normalized payload with edge processing telemetry and latency metrics.",
        "technology": "EdgeProcessor module, Boundary Clamping, Exponential Moving Average (EMA).",
        "example_data": {
            "signal_quality_score": 100,
            "processing_latency_ms": 0.42,
            "validation_status": "PASSED"
        },
        "viva_talking_points": [
            "Prevents impossible noise (e.g., negative heart rates or SpO2 > 100%) from reaching clinical databases.",
            "Simulates local edge gateway intelligence."
        ]
    },
    {
        "id": "node_abnormality_detection",
        "step": 5,
        "title": "Abnormality Detection",
        "category": "Intelligence Layer",
        "short_desc": "Configurable multi-tier rule engine + Machine Learning risk classifier.",
        "purpose": "Classifies incoming readings into NORMAL, WARNING, or CRITICAL with detailed clinical rationales.",
        "input": "Sanitized physiological vitals.",
        "output": "Overall status, issue breakdown, risk severity, clinical recommendations.",
        "technology": "Multi-tier rule matrix, Configurable Thresholds, ML Anomaly Classifier Stub.",
        "example_data": {
            "overall_status": "CRITICAL",
            "issues": ["Severe Tachycardia: Heart rate 136 BPM > 130 BPM", "Low SpO2: 86.5% <= 89.9%"],
            "severity_score": 2
        },
        "viva_talking_points": [
            "Multi-tier boundaries avoid hardcoding and can be modified at runtime.",
            "Includes dedicated extension point to plug in scikit-learn / XGBoost models."
        ]
    },
    {
        "id": "node_database_cloud",
        "step": 6,
        "title": "Database / Cloud",
        "category": "Persistence Layer",
        "short_desc": "Relational storage engine for patient demographics, time-series vitals, and alert history.",
        "purpose": "Guarantees durable persistence, relational consistency, and fast indexing for historical analytics.",
        "input": "Processed readings, generated alerts, user credentials.",
        "output": "Indexed records, longitudinal trend datasets.",
        "technology": "SQLAlchemy ORM, PostgreSQL / SQLite, Foreign Key Cascades, Time Indexes.",
        "example_data": {
            "tables": ["users", "patients", "health_readings", "alerts", "system_configs"]
        },
        "viva_talking_points": [
            "Optimized indexing on (patient_id, timestamp) facilitates fast time-range queries.",
            "Decoupled persistence with SQLAlchemy makes switching between SQLite and PostgreSQL seamless."
        ]
    },
    {
        "id": "node_healthcare_dashboard",
        "step": 7,
        "title": "Healthcare Dashboard",
        "category": "Application Layer",
        "short_desc": "Real-time responsive web interface for clinical monitoring and patient triage.",
        "purpose": "Displays live vital cards, interactive waveform charts, telemetry grids, and patient records.",
        "input": "WebSocket live stream, REST API responses.",
        "output": "Visual charts, color-coded vital badges, audio-visual alert cues.",
        "technology": "React, TypeScript, Tailwind CSS, Recharts, HTML5 WebSockets.",
        "example_data": {
            "active_patients_count": 5,
            "connected_status": "CONNECTED",
            "real_time_fps": "30 FPS"
        },
        "viva_talking_points": [
            "Eliminates manual page refreshes using reactive WebSocket state management.",
            "Responsive layout designed for medical workstations and tablet triage."
        ]
    },
    {
        "id": "node_alert_system",
        "step": 8,
        "title": "Alert System",
        "category": "Notification Layer",
        "short_desc": "Real-time clinical alarm dispatcher with triage, acknowledgment, and resolution workflows.",
        "purpose": "Notifies healthcare staff immediately when dangerous abnormalities occur.",
        "input": "Abnormality detection triggers.",
        "output": "Broadcast alert payload, desktop notifications, triage audit trail.",
        "technology": "WebSocket Event Hub, Toast notification engine, Alert audit log.",
        "example_data": {
            "title": "CRITICAL SpO2 Desaturation Alert",
            "severity": "CRITICAL",
            "acknowledged": False
        },
        "viva_talking_points": [
            "Alerts feature full lifecycle management (Active → Acknowledged → Resolved).",
            "Severity-based visual styling ensures critical emergencies are immediately visible."
        ]
    }
]

@router.get("/nodes", response_model=List[Dict[str, Any]])
def get_architecture_nodes():
    return ARCHITECTURE_NODES
