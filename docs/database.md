# HealthGuard IoT - Database & Telemetry Data Schema

This document outlines the database tables, JSON framing schemas, and entity relationships used across HealthGuard IoT.

---

## 1. Relational Entities

### Patients (`patients`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Auto-increment primary key |
| `patient_code` | String (Unique) | Clinical identifier (e.g. `PT-1001`) |
| `name` | String | Full name of patient |
| `age` | Integer | Age in years |
| `gender` | String | Biological sex (`Male`, `Female`, `Other`) |
| `room_number` | String | Inpatient ward location (e.g. `ICU-102`) |
| `device_id` | String | Assigned IoT hardware beacon ID |
| `current_status` | String | Latest condition (`NORMAL`, `WARNING`, `CRITICAL`) |

### Health Readings (`health_readings`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Auto-increment primary key |
| `patient_id` | Integer (FK) | Reference to `patients.id` |
| `heart_rate` | Float | Heart Rate in Beats Per Minute (BPM) |
| `spo2` | Float | Blood oxygen saturation percentage ($\text{SpO}_2$) |
| `temperature` | Float | Body temperature in Celsius (°C) |
| `systolic_bp` | Integer | Systolic blood pressure (mmHg) |
| `diastolic_bp` | Integer | Diastolic blood pressure (mmHg) |
| `status` | String | Evaluated status (`NORMAL`, `WARNING`, `CRITICAL`) |
| `timestamp` | DateTime | UTC recording timestamp |

### Alerts (`alerts`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Auto-increment primary key |
| `patient_id` | Integer (FK) | Reference to `patients.id` |
| `parameter` | String | Vital sign name (e.g. `spo2`, `heart_rate`) |
| `value` | Float | Triggering physiological value |
| `severity` | String | Alert tier (`WARNING`, `CRITICAL`) |
| `title` | String | Human-readable title |
| `message` | String | Detailed clinical rationale |
| `acknowledged` | Boolean | Whether clinician has acknowledged alarm |
| `resolved` | Boolean | Whether emergency is resolved |
| `timestamp` | DateTime | Alarm creation timestamp |

---

## 2. Standardized IoT Telemetry JSON Packet
Both simulated software nodes and physical ESP32 microcontrollers communicate using this payload:

```json
{
  "patientId": 1,
  "deviceId": "ESP32_NODE_01",
  "heartRate": 136.2,
  "spo2": 86.4,
  "temperature": 39.2,
  "systolicBP": 148,
  "diastolicBP": 94,
  "respiratoryRate": 28,
  "timestamp": "2026-09-02T19:00:00Z"
}
```
