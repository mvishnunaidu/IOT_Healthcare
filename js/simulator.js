/**
 * HealthGuard IoT - Virtual IoT Sensor Simulator Engine
 * =======================================================
 * Simulates an embedded microcontroller (ESP32 / Cortex-M4) reading virtual sensors,
 * packaging frames, and passing them through Edge Processing -> Abnormality Engine.
 */

class VirtualIoTSimulator {
  constructor() {
    this.status = 'STOPPED'; // 'RUNNING', 'PAUSED', 'STOPPED'
    this.mode = 'NORMAL';    // 'NORMAL', 'WARNING', 'CRITICAL', 'WAVE', 'TACHYCARDIA', 'BRADYCARDIA', 'HYPOXIA', 'FEVER', 'MULTI_DISTRESS'
    this.intervalSeconds = 3.0;
    this.activePatientId = 1;
    this.packetsTransmitted = 1240;
    this.lastTransmission = new Date().toLocaleTimeString();
    this.timer = null;
    this.lastRawPayload = null;
    this.lastProcessedBundle = null;

    this.onTelemetryCallback = null;
    this.onEventLogCallback = null;
  }

  start(patientId = 1, mode = 'NORMAL', interval = 3.0) {
    this.activePatientId = patientId;
    this.mode = mode;
    this.intervalSeconds = interval;
    this.status = 'RUNNING';

    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.step();
    }, this.intervalSeconds * 1000);

    this.step(); // Immediate transmission
    this.logEvent(`IoT Telemetry Transmitter started [Interval: ${interval}s, Patient: PT-100${patientId}]`, 'INFO');
  }

  pause() {
    this.status = 'PAUSED';
    if (this.timer) clearInterval(this.timer);
    this.logEvent(`Simulation paused by clinician`, 'INFO');
  }

  stop() {
    this.status = 'STOPPED';
    if (this.timer) clearInterval(this.timer);
    this.logEvent(`Simulation stopped by clinician`, 'INFO');
  }

  setMode(mode) {
    this.mode = mode;
    this.logEvent(`Simulation scenario switched to ${mode}`, 'INFO');
    if (this.status === 'RUNNING') {
      this.step();
    }
  }

  /**
   * Inject specific manual vitals directly (e.g. from live sliders)
   */
  injectManualVitals(hr, spo2, temp) {
    const rawPayload = {
      patientId: this.activePatientId,
      deviceId: `ESP32_NODE_0${this.activePatientId}`,
      heartRate: Number(hr),
      spo2: Number(spo2),
      temperature: Number(temp),
      systolicBP: Math.round(120 + (hr - 75) * 0.4),
      diastolicBP: Math.round(80 + (hr - 75) * 0.2),
      respiratoryRate: Math.round(16 + (hr > 100 ? 6 : 0))
    };
    this.processRawPayload(rawPayload, 'MANUAL');
  }

  step() {
    if (this.status !== 'RUNNING') return;

    // 1. Virtual Sensors Layer
    const rawVitals = VirtualSensors.generateSensorReading(this.mode);
    const rawPayload = {
      patientId: this.activePatientId,
      deviceId: `ESP32_NODE_0${this.activePatientId}`,
      ...rawVitals
    };

    this.processRawPayload(rawPayload, this.mode);
  }

  processRawPayload(rawPayload, triggerMode = 'AUTO') {
    this.lastRawPayload = rawPayload;

    try {
      // 2. Edge Processing Layer (Validation, EMA Smoothing, Quality Index)
      const { processedData, edgeMetadata } = EdgeProcessor.processAtEdge(rawPayload);

      // 3. Abnormality Detection Layer
      const detectionResult = AbnormalityDetector.detectAbnormality(processedData);

      this.packetsTransmitted++;
      this.lastTransmission = new Date().toLocaleTimeString();

      const telemetryBundle = {
        reading: processedData,
        rawReading: rawPayload,
        detection: detectionResult,
        edge: edgeMetadata
      };

      this.lastProcessedBundle = telemetryBundle;

      // Audio Telemetry Feedback
      if (window.telemetryAudio) {
        if (detectionResult.overallStatus === 'CRITICAL') {
          window.telemetryAudio.playCriticalAlarm();
        } else {
          window.telemetryAudio.playHeartbeatBeep(processedData.spo2);
        }
      }

      if (this.onTelemetryCallback) {
        this.onTelemetryCallback(telemetryBundle);
      }

      const statusTag = detectionResult.overallStatus;
      this.logEvent(
        `IoT Frame #${this.packetsTransmitted} [HR: ${processedData.heartRate} BPM, SpO2: ${processedData.spo2}%, Temp: ${processedData.temperature}°C] -> ${statusTag}`,
        statusTag === 'CRITICAL' ? 'ANOMALY' : (statusTag === 'WARNING' ? 'WARN' : 'TX')
      );
    } catch (err) {
      console.error("Simulation pipeline error:", err);
      this.logEvent(`Edge Fault: ${err.message}`, 'ANOMALY');
    }
  }

  injectAbnormalEvent() {
    this.setMode('CRITICAL');
    this.logEvent(`🚨 CRITICAL EMERGENCY SCENARIO TRIGGERED (Severe Hypoxia & Tachycardia)`, 'ANOMALY');
  }

  logEvent(msg, type = 'TX') {
    if (this.onEventLogCallback) {
      this.onEventLogCallback({
        time: new Date().toLocaleTimeString(),
        type: type,
        message: msg
      });
    }
  }
}

const iotSimulator = new VirtualIoTSimulator();
