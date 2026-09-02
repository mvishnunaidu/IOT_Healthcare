# HealthGuard IoT - Enterprise System Architecture & Technical Specifications

**HealthGuard IoT** is an enterprise-grade clinical patient vital signs telemetry and automated abnormality triage platform. It models an end-to-end medical IoT infrastructure: from high-frequency biomedical sensor acquisition to edge sanitization, multi-tier abnormality classification, real-time Lead-II ECG and Plethysmograph canvas oscilloscopes, synchronized Chart.js waveforms, and automated audio-visual emergency alarm dispatching.

---

## 1. System Engineering Highlights

- **Decoupled Software Telemetry Architecture:** Models physical biomedical sensors (PPG, Dual-Wavelength Pulse Oximetry, NTC Thermistors) and microcontroller network framing with mathematical fidelity.
- **Edge Gateway Computing:** Enforces biological validity ($25 \le \text{HR} \le 260\text{ BPM}$) and Exponential Moving Average (EMA) smoothing ($\alpha = 0.3$) before cloud transmission.
- **Deterministic Multi-Tier Triage:** Classifies vitals into `NORMAL`, `WARNING`, and `CRITICAL` states with actionable clinical recommendations.
- **Real-Time 60 FPS Canvas Oscilloscopes:** Lead-II ECG and Plethysmograph waveforms dynamically synchronized with patient heart rates.
- **Web Audio Telemetry Feedback:** Synthesizes realistic cardiac pulse tones and emergency alarm chimes via the Web Audio API.

---

## 2. Core Architecture Specifications

### Q1: How does the decoupled software telemetry engine operate?
Standardized JSON telemetry payloads are used across the entire system:
```json
{
  "header": {
    "protocol": "IoT-HealthGuard-Enterprise-v2.1",
    "nodeId": "ESP32_NODE_01",
    "sequence": 1241,
    "edgeLatencyMs": 12,
    "timestamp": "2026-09-02T19:20:00.000Z"
  },
  "telemetry": {
    "heartRateBpm": 74.0,
    "spo2Percent": 98.4,
    "bodyTemperatureCelsius": 36.7,
    "bloodPressure": "118/78"
  },
  "edgeVerification": {
    "signalQuality": "98.5%",
    "status": "NORMAL",
    "abnormalityCount": 0
  }
}
```
This payload structure allows physical ESP32 or Raspberry Pi devices to connect directly without modifying backend or dashboard code.

### Q2: What signal processing occurs at the edge gateway?
1. **Range Validation:** Rejects impossible values (e.g. $\text{HR} < 25\text{ BPM}$ or $\text{SpO}_2 > 100\%$).
2. **Exponential Moving Average (EMA) Filter:**
   $$\text{EMA}_t = 0.3 \cdot X_t + 0.7 \cdot \text{EMA}_{t-1}$$
3. **Signal Quality Index (SQI):** Computes signal confidence ($0-100\%$) based on variance and physiological plausibility.

---

## 3. Physical Hardware Integration Blueprint

- **Microcontroller:** ESP32-WROOM-32 (Dual-core 240MHz, Wi-Fi / BLE).
- **Pulse Oximeter:** MAX30102 connected via I2C (`SDA = GPIO 21`, `SCL = GPIO 22`).
- **Temperature Sensor:** DS18B20 1-Wire digital thermistor (`GPIO 4` with 4.7kΩ pull-up).
- **Communication Protocol:** JSON telemetry transmitted over Secure WebSockets (WSS) or HTTPS POST to `/api/readings/raw`.
