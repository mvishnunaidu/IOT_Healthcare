# IoT-Enabled Clinical Healthcare Telemetry & Abnormality Detection Platform

**HealthGuard IoT** is an enterprise-grade patient vital signs telemetry and automated abnormality triage platform. It integrates biomedical sensor signal acquisition, low-latency edge computing sanitization, multi-tier deterministic clinical triage, 60 FPS real-time hospital oscilloscopes, and automated audio-visual emergency dispatch.

---

## 📋 Table of Contents
1. [Overview](#1-overview)
2. [Problem Statement & Solution](#2-problem-statement--solution)
3. [Key Architecture Capabilities](#3-key-architecture-capabilities)
4. [System Architecture Dataflow](#4-system-architecture-dataflow)
5. [Biomedical Sensor Acquisition & Simulation Layer](#5-biomedical-sensor-acquisition--simulation-layer)
6. [Edge Gateway Sanitization & Noise Filtering](#6-edge-gateway-sanitization--noise-filtering)
7. [Deterministic Abnormality Detection Rules Matrix](#7-deterministic-abnormality-detection-rules-matrix)
8. [Bedside Oscilloscopes & Multi-Parameter Waveforms](#8-bedside-oscilloscopes--multi-parameter-waveforms)
9. [Web Audio Telemetry Sound Synthesizer](#9-web-audio-telemetry-sound-synthesizer)
10. [Clinical Workstation Dashboard & Multi-Bed Oversight](#10-clinical-workstation-dashboard--multi-bed-oversight)
11. [Clinical Alert Triage & Emergency Response](#11-clinical-alert-triage--emergency-response)
12. [Technology Stack](#12-technology-stack)
13. [Repository Structure](#13-repository-structure)
14. [Installation & Running Locally](#14-installation--running-locally)
15. [Physical Microcontroller Hardware Bridge Blueprint](#15-physical-microcontroller-hardware-bridge-blueprint)
16. [License & Medical Disclaimer](#16-license--medical-disclaimer)

---

## 1. Overview
In intensive care units (ICU) and acute care wards, continuous multi-parameter vital signs monitoring is critical for early detection of clinical deterioration. **HealthGuard IoT** models the end-to-end telemetry pipeline: from biomedical sensor acquisition to edge-gateway sanitization, multi-tier abnormality classification, real-time Lead-II ECG and Plethysmograph canvas oscilloscopes, synchronized Chart.js waveforms, and automated audio-visual emergency dispatching.

---

## 2. Problem Statement & Solution
Traditional hospital telemetry monitors are expensive, closed-source, and isolated from modern cloud analytics pipelines. Furthermore, validating acute emergency scenarios (such as severe hypoxia with $\text{SpO}_2 < 85\%$ or acute ventricular arrhythmias) requires safe, deterministic, high-fidelity testing infrastructure.

**HealthGuard IoT** bridges this gap with an autonomous, decoupled IoT telemetry engine that models realistic physiological stochastic micro-variations, edge EMA smoothing, and multi-tier clinical boundary enforcement, while remaining 100% data contract compatible with physical microcontrollers.

---

## 3. Key Architecture Capabilities
- **High-Fidelity Telemetry Engine:** Emulate PPG, dual-wavelength pulse oximetry, and clinical thermistors with stochastic micro-variations.
- **Autonomous Edge Gateway Computing:** Near-sensor physiological boundary enforcement ($25 \le \text{HR} \le 260\text{ BPM}$) and Exponential Moving Average (EMA) smoothing ($\alpha = 0.3$).
- **Multi-Tier Deterministic Triage:** Classify vitals hierarchically into `NORMAL`, `WARNING`, and `CRITICAL` states with contextual clinical recommendations.
- **60 FPS Sweeping Canvas Oscilloscopes:** Lead-II ECG and SpO2 Plethysmograph waveforms dynamically synchronized with current heart rates.
- **Web Audio Telemetry Feedback:** Synthesizes realistic cardiac pulse tones (frequency modulated by $\text{SpO}_2$) and two-tone emergency alarm chimes.
- **Zero-Dependency Standalone Web App:** Pure HTML5/CSS3/Vanilla JS web app ready for instant deployment on Netlify or any static web host.

---

## 4. System Architecture Dataflow

$$\text{Patient} \longrightarrow \text{Biomedical Sensors} \longrightarrow \text{IoT Gateway (ESP32)} \longrightarrow \text{Edge Sanitization} \longrightarrow \text{Rule Engine} \longrightarrow \text{Cloud DB} \longrightarrow \text{Workstation} \longrightarrow \text{Emergency Triage}$$

1. **Patient Profile:** Clinical subject demographic records, vital baseline, and active admission profile.
2. **Biomedical Sensors:** Mathematical generators producing heart rate, $\text{SpO}_2$, temperature, blood pressure, and respiration rate.
3. **IoT Gateway (ESP32):** Packages data into standardized JSON packets with sequence ID and hardware node IDs (e.g. `ESP32_NODE_01`).
4. **Edge Processing:** Validates payload structure, enforces biological bounds, applies EMA smoothing, and measures gateway latency.
5. **Abnormality Detection:** Multi-tier deterministic rule matrix classifying telemetry into Normal, Warning, and Critical states.
6. **Persistence Layer:** Time-series storage for historical telemetry logs and audit trails.
7. **Healthcare Dashboard:** Real-time Chart.js multi-axis waveforms and bedside canvas oscilloscopes.
8. **Clinical Alert Hub:** Emergency notification dispatch, audio alarm chimes, and triage audit workflows.

---

## 5. Biomedical Sensor Acquisition & Simulation Layer
Located in [`js/sensors.js`](file:///c:/Users/VISHNU/Desktop/IOT_Healthcare/js/sensors.js):
- **NORMAL Rest:** Heart Rate $74 \pm 2.5\text{ BPM}$, $\text{SpO}_2\ 98.4 \pm 0.6\%$, Temp $36.7 \pm 0.12^\circ\text{C}$.
- **TACHYCARDIA:** Heart Rate $146 \pm 4\text{ BPM}$, $\text{SpO}_2\ 95.5 \pm 0.8\%$, Temp $37.2 \pm 0.15^\circ\text{C}$.
- **HYPOXIA:** Heart Rate $105 \pm 4\text{ BPM}$, $\text{SpO}_2\ 84.2 \pm 1.1\%$, Temp $36.6 \pm 0.15^\circ\text{C}$.
- **HIGH FEVER:** Heart Rate $118 \pm 4\text{ BPM}$, $\text{SpO}_2\ 93.5 \pm 0.8\%$, Temp $39.5 \pm 0.2^\circ\text{C}$.
- **BRADYCARDIA:** Heart Rate $42 \pm 2\text{ BPM}$, $\text{SpO}_2\ 97.2 \pm 0.5\%$, Temp $36.4 \pm 0.1^\circ\text{C}$.
- **WAVE Mode:** Continuous harmonic sinusoidal oscillation $f(t) = A \sin(\omega t) + \text{noise}$.
- **MULTI-ORGAN DISTRESS:** Combined tachycardia, desaturation ($82\%$), and hyperthermia ($39.8^\circ\text{C}$).

---

## 6. Edge Gateway Sanitization & Noise Filtering
Located in [`js/edge-processing.js`](file:///c:/Users/VISHNU/Desktop/IOT_Healthcare/js/edge-processing.js):
- Enforces strict human biological boundaries ($25 \le \text{HR} \le 260\text{ BPM}$, $40 \le \text{SpO}_2 \le 100\%$, $28 \le \text{Temp} \le 45^\circ\text{C}$).
- Mitigates optical motion artifacts using an Exponential Moving Average (EMA) filter:
  $$\text{EMA}_t = \alpha \cdot X_t + (1 - \alpha) \cdot \text{EMA}_{t-1} \quad (\alpha = 0.3)$$
- Computes gateway latency ($\text{ms}$) and signal quality index ($0 - 100\%$).

---

## 7. Deterministic Abnormality Detection Rules Matrix
Located in [`js/abnormality-detection.js`](file:///c:/Users/VISHNU/Desktop/IOT_Healthcare/js/abnormality-detection.js):

| Vital Parameter | Nominal (NORMAL) | Observation (WARNING) | Emergency (CRITICAL) |
| :--- | :--- | :--- | :--- |
| **Heart Rate** | $60 - 100\text{ BPM}$ | $101 - 130\text{ BPM}$ | $> 130\text{ or } < 45\text{ BPM}$ |
| **Oxygen Saturation ($\text{SpO}_2$)** | $95 - 100\%$ | $90 - 94.9\%$ | $\le 89.9\%$ |
| **Body Temperature** | $36.5 - 37.5^\circ\text{C}$ | $37.6 - 38.7^\circ\text{C}$ | $\ge 38.8^\circ\text{C}$ |

---

## 8. Bedside Oscilloscopes & Multi-Parameter Waveforms
Located in [`js/oscilloscope.js`](file:///c:/Users/VISHNU/Desktop/IOT_Healthcare/js/oscilloscope.js):
- **Lead-II ECG Oscilloscope:** Real-time 60 FPS HTML5 Canvas animation generating mathematical P-Q-R-S-T vectors dynamically synchronized with the patient's heart rate.
- **Plethysmograph Waveform:** Generates real-time optical dicrotic notch pulse wave simulating a clinical pulse oximeter.
- **Chart.js Multi-Axis Waveform:** Synchronized time-series chart with time-range window filters (15s, 30s, 60s).

---

## 9. Web Audio Telemetry Sound Synthesizer
Located in [`js/audio.js`](file:///c:/Users/VISHNU/Desktop/IOT_Healthcare/js/audio.js):
- Generates realistic acoustic cardiac pulse tones (frequency modulated by $\text{SpO}_2$ level) and two-tone critical alarm chimes without external audio dependencies.
- Toggleable audio mute/unmute control in the top navigation bar.

---

## 10. Clinical Workstation Dashboard & Multi-Bed Oversight
Located in [`index.html`](file:///c:/Users/VISHNU/Desktop/IOT_Healthcare/index.html):
- **Status Bar:** Real-time system beacon, edge gateway latency badge ($\approx 12\text{ ms}$), audio toggle, system protocols modal, and theme switcher.
- **5 Metric Summary Cards:** Total Monitored, Normal, Warning, Critical, and Active Alerts.
- **Live Vitals Matrix:** Multi-bed ward status grid with instant patient switcher.

---

## 11. Clinical Alert Triage & Emergency Response
Located in [`js/alerts.js`](file:///c:/Users/VISHNU/Desktop/IOT_Healthcare/js/alerts.js):
- Full alert lifecycle: `ACTIVE` $\longrightarrow$ `ACKNOWLEDGED` $\longrightarrow$ `RESOLVED`.
- Audio alarm chime and emergency banner on critical triggers.
- Time-stamped clinical triage audit log with one-click resolution.

---

## 12. Technology Stack
- **Standalone Web App:** HTML5 Canvas, Vanilla JavaScript (ES6+), CSS3 (Cyber-Medical Glassmorphic Design System), Bootstrap 5.3, Chart.js 4.4, Web Audio API.
- **Backend API (Optional):** Python 3.10+, FastAPI, Pydantic v2, SQLite, Pytest, WebSockets.
- **React Frontend (Optional):** React 18, TypeScript, Vite, TailwindCSS, Lucide Icons.

---

## 13. Repository Structure
```
IOT_Healthcare/
├── index.html               # Standalone Zero-Dependency Web App (Netlify & GitHub Ready)
├── css/
│   ├── style.css            # Cyber-Medical Glassmorphism Design System
│   └── responsive.css       # Mobile & Tablet Layout Adaptations
├── js/
│   ├── app.js               # Master Application Controller
│   ├── audio.js             # Web Audio Telemetry Synthesizer
│   ├── sensors.js           # Virtual Sensors & Stochastic Engine
│   ├── edge-processing.js   # Edge Boundary & EMA Smoothing
│   ├── abnormality-detection.js # Multi-Tier Clinical Classifier
│   ├── oscilloscope.js      # 60 FPS Lead-II ECG & PPG Canvas Oscilloscope
│   ├── charts.js            # Chart.js Waveform Telemetry
│   ├── simulator.js         # Virtual IoT Hardware Transmitter
│   ├── patients.js          # Patient Data Model & Baselines
│   ├── alerts.js            # Emergency Alarm Triage Engine
│   ├── history.js           # Time-Series Store & CSV Exporter
│   ├── auth.js              # Authentication State Manager
│   └── firebase-config.js   # Cloud Integration Stub
├── backend/                 # Python FastAPI REST & WebSocket Backend
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tests/
│   └── requirements.txt
├── frontend/                # React + Vite + TypeScript Frontend
├── docs/                    # Architectural & API Documentation
├── netlify.toml             # Netlify Deployment Configuration
├── .gitignore               # Comprehensive Git Ignore Rules
├── .env.example             # Configuration Template
└── README.md                # Project Documentation
```

---

## 14. Installation & Running Locally

### Option A: Standalone Web Application (Instant, Zero Setup)
1. Open `index.html` directly in any web browser, or start a lightweight local server:
   ```bash
   npx serve .
   # or
   python -m http.server 8080
   ```
2. Navigate to `http://localhost:8080`.

### Option B: Python FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
python -m pytest app/tests
uvicorn app.main:app --reload --port 8000
```

### Option C: React + Vite Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 15. Physical Microcontroller Hardware Bridge Blueprint

To bridge the software platform with physical microcontroller hardware:

1. **Microcontroller:** ESP32-WROOM-32 (Dual-core 240MHz, Wi-Fi enabled).
2. **Pulse/SpO2 Sensor:** MAX30102 connected via I2C (`SDA = GPIO 21`, `SCL = GPIO 22`).
3. **Temperature Sensor:** DS18B20 digital thermistor via 1-Wire (`GPIO 4` with $4.7\text{k}\Omega$ pull-up).
4. **Firmware:** Package JSON frames using the `ArduinoJson` library and transmit via HTTP POST or WebSockets to `/api/readings/raw`.

---

## 16. License & Medical Disclaimer
This software is designed for educational, research, and technical simulation of clinical IoT telemetry pipelines. For deployment in live clinical care environments, appropriate regulatory medical clearance and hardware calibration must be conducted.
