# REST API & WebSocket Reference

## Authentication
All protected endpoints accept a standard Bearer token in the `Authorization` header:
`Authorization: Bearer <access_token>`

### 1. `POST /api/auth/login`
Authenticates a healthcare practitioner and issues a JWT token.
- **Request:**
  ```json
  {
    "email": "doctor@hospital.org",
    "password": "doctor123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Dr. Sameer Verma, MD",
      "email": "doctor@hospital.org",
      "role": "doctor"
    }
  }
  ```

---

## Sensor Telemetry & Ingestion

### 2. `POST /api/readings`
Ingests a single sensor telemetry frame through the Edge Processing & Abnormality Detection Pipeline.
- **Request Body:**
  ```json
  {
    "patient_id": 1,
    "device_id": "VIRTUAL_NODE_01",
    "heart_rate": 135.0,
    "spo2": 86.0,
    "temperature": 39.1,
    "systolic_bp": 140.0,
    "diastolic_bp": 90.0,
    "respiratory_rate": 26.0
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "reading": {
      "id": 128,
      "patient_id": 1,
      "device_id": "VIRTUAL_NODE_01",
      "heart_rate": 135.0,
      "spo2": 86.0,
      "temperature": 39.1,
      "status": "CRITICAL",
      "timestamp": "2026-09-02T13:45:00.000Z"
    },
    "detection": {
      "overall_status": "CRITICAL",
      "issues_detected": [
        "Severe Tachycardia: Heart rate 135.0 BPM exceeds critical threshold (130.0)",
        "Severe Hypoxemia: SpO2 dropped to 86.0%"
      ],
      "recommendation": "IMMEDIATE ATTENTION REQUIRED"
    },
    "edge_telemetry": {
      "processing_latency_ms": 0.42,
      "signal_quality_score": 100
    }
  }
  ```

---

## Simulation Engine

### 3. `POST /api/simulation/start`
Starts continuous background streaming.
- **Request:**
  ```json
  {
    "patient_id": 1,
    "mode": "NORMAL",
    "interval_seconds": 3.0
  }
  ```

### 4. `POST /api/simulation/stop`
Stops background streaming.

### 5. `POST /api/simulation/analyze`
Custom parameter sandbox execution.
