/**
 * Edge Processing Module
 * =======================
 * Simulates processing that occurs on the local IoT Gateway near the patient:
 * 1. Payload validation & missing value checks
 * 2. Physiological boundary limits enforcement
 * 3. Outlier / motion artifact smoothing (Exponential Moving Average)
 * 4. Blood pressure sanity check (Sys > Dia)
 * 5. Telemetry latency & quality scoring
 */

const EdgeProcessor = {
  // Biological boundary constraints
  bounds: {
    heartRate: [25, 260],
    spo2: [40, 100],
    temperature: [28, 45],
    systolicBP: [40, 260],
    diastolicBP: [25, 180],
    respiratoryRate: [4, 60]
  },

  previousReadings: {},

  processAtEdge(rawPayload) {
    const startTime = performance.now();
    const warnings = [];

    if (!rawPayload || typeof rawPayload !== 'object') {
      throw new Error("Edge Validation Failed: Payload must be a valid JSON object");
    }

    const patientId = Number(rawPayload.patientId || rawPayload.patient_id) || 1;
    let hr = Number(rawPayload.heartRate || rawPayload.heart_rate);
    let spo2 = Number(rawPayload.spo2);
    let temp = Number(rawPayload.temperature);
    let sysBP = Number(rawPayload.systolicBP || rawPayload.systolic_bp) || 120;
    let diaBP = Number(rawPayload.diastolicBP || rawPayload.diastolic_bp) || 80;
    let respRate = Number(rawPayload.respiratoryRate || rawPayload.respiratory_rate) || 16;

    // Missing checks
    if (isNaN(hr) || isNaN(spo2) || isNaN(temp)) {
      throw new Error("Edge Validation Failed: Required vitals (HR, SpO2, Temp) cannot be missing or NaN");
    }

    // Boundary constraints check
    if (hr < this.bounds.heartRate[0] || hr > this.bounds.heartRate[1]) {
      throw new Error(`Sensor Fault: Heart rate ${hr} BPM is outside biological human limits [25, 260]`);
    }
    if (spo2 < this.bounds.spo2[0] || spo2 > this.bounds.spo2[1]) {
      throw new Error(`Sensor Fault: SpO2 ${spo2}% is outside physical saturation bounds [40, 100]`);
    }
    if (temp < this.bounds.temperature[0] || temp > this.bounds.temperature[1]) {
      throw new Error(`Sensor Fault: Body temperature ${temp}°C is outside biological bounds [28, 45]`);
    }

    // Blood pressure consistency check
    if (sysBP <= diaBP) {
      warnings.push("Systolic BP is less than or equal to Diastolic BP. Edge clamp applied.");
      sysBP = diaBP + 15;
    }

    // Artifact noise smoothing (EMA)
    const prev = this.previousReadings[patientId];
    if (prev) {
      const delta = Math.abs(hr - prev.heartRate);
      if (delta > 60) {
        warnings.push(`Transient artifact spike of ${delta.toFixed(1)} BPM smoothed at edge.`);
        hr = 0.7 * prev.heartRate + 0.3 * hr;
      }
    }

    this.previousReadings[patientId] = { heartRate: hr, spo2: spo2, temperature: temp };

    const latencyMs = Number((performance.now() - startTime).toFixed(2));
    const qualityScore = Math.max(20, 100 - (warnings.length * 15));

    return {
      processedData: {
        patientId: patientId,
        deviceId: rawPayload.deviceId || rawPayload.device_id || `ESP32_NODE_0${patientId}`,
        heartRate: Number(hr.toFixed(1)),
        spo2: Number(Math.min(100, spo2).toFixed(1)),
        temperature: Number(temp.toFixed(1)),
        systolicBP: Math.round(sysBP),
        diastolicBP: Math.round(diaBP),
        respiratoryRate: Math.round(respRate),
        timestamp: new Date().toISOString()
      },
      edgeMetadata: {
        gatewayNode: "EDGE_GW_01",
        latencyMs: Math.max(0.35, latencyMs),
        qualityScore: qualityScore,
        warnings: warnings
      }
    };
  }
};
