/**
 * Abnormality Detection Engine
 * =============================
 * Centralized rule-based clinical threshold evaluation service.
 * Evaluates physiological vitals against configured multi-tier limits:
 * NORMAL -> WARNING -> CRITICAL
 * 
 * NOTE: Prototype demo rules for educational simulation. Not medical diagnosis.
 */

const AbnormalityDetector = {
  thresholds: {
    heartRate: { normalMin: 60, normalMax: 100, warningHigh: 120, warningLow: 50, criticalHigh: 130, criticalLow: 45, unit: 'BPM' },
    spo2: { normalMin: 95, normalMax: 100, warningLow: 90, criticalLow: 89.9, unit: '%' },
    temperature: { normalMin: 36.5, normalMax: 37.5, warningHigh: 38.3, warningLow: 35.5, criticalHigh: 38.8, criticalLow: 35.0, unit: '°C' }
  },

  detectAbnormality(vitals) {
    let highestSeverity = 0; // 0: NORMAL, 1: WARNING, 2: CRITICAL
    const issues = [];
    const parameterStatuses = {};
    const generatedAlerts = [];

    const hr = vitals.heartRate;
    const spo2 = vitals.spo2;
    const temp = vitals.temperature;

    // 1. Heart Rate
    let hrStatus = 'NORMAL';
    if (hr > this.thresholds.heartRate.criticalHigh) {
      hrStatus = 'CRITICAL';
      highestSeverity = Math.max(highestSeverity, 2);
      const msg = `Severe Tachycardia: Heart rate ${hr} BPM exceeds critical threshold (130 BPM)`;
      issues.push(msg);
      generatedAlerts.push({ parameter: 'heartRate', value: hr, severity: 'CRITICAL', title: 'Critical Tachycardia Alert', message: msg });
    } else if (hr < this.thresholds.heartRate.criticalLow) {
      hrStatus = 'CRITICAL';
      highestSeverity = Math.max(highestSeverity, 2);
      const msg = `Severe Bradycardia: Heart rate ${hr} BPM is dangerously low (< 45 BPM)`;
      issues.push(msg);
      generatedAlerts.push({ parameter: 'heartRate', value: hr, severity: 'CRITICAL', title: 'Critical Bradycardia Alert', message: msg });
    } else if (hr > this.thresholds.heartRate.warningHigh || hr < this.thresholds.heartRate.warningLow) {
      hrStatus = 'WARNING';
      highestSeverity = Math.max(highestSeverity, 1);
      issues.push(`Elevated/Abnormal Heart Rate: ${hr} BPM outside target range`);
    }
    parameterStatuses.heartRate = { value: hr, status: hrStatus };

    // 2. SpO2 Oxygen Saturation
    let spo2Status = 'NORMAL';
    if (spo2 <= this.thresholds.spo2.criticalLow) {
      spo2Status = 'CRITICAL';
      highestSeverity = Math.max(highestSeverity, 2);
      const msg = `Severe Hypoxemia: SpO2 oxygen saturation dropped to ${spo2}% (Critical <= 89.9%)`;
      issues.push(msg);
      generatedAlerts.push({ parameter: 'spo2', value: spo2, severity: 'CRITICAL', title: 'Critical Oxygen Desaturation Alert', message: msg });
    } else if (spo2 < this.thresholds.spo2.normalMin) {
      spo2Status = 'WARNING';
      highestSeverity = Math.max(highestSeverity, 1);
      issues.push(`Low Oxygen Saturation: SpO2 ${spo2}% is below normal target (95%)`);
    }
    parameterStatuses.spo2 = { value: spo2, status: spo2Status };

    // 3. Body Temperature
    let tempStatus = 'NORMAL';
    if (temp >= this.thresholds.temperature.criticalHigh) {
      tempStatus = 'CRITICAL';
      highestSeverity = Math.max(highestSeverity, 2);
      const msg = `Hyperpyrexia: Temperature ${temp}°C exceeds critical cutoff (38.8°C)`;
      issues.push(msg);
      generatedAlerts.push({ parameter: 'temperature', value: temp, severity: 'CRITICAL', title: 'Critical High Fever Alert', message: msg });
    } else if (temp <= this.thresholds.temperature.criticalLow) {
      tempStatus = 'CRITICAL';
      highestSeverity = Math.max(highestSeverity, 2);
      const msg = `Severe Hypothermia: Temperature ${temp}°C is below critical limit (35.0°C)`;
      issues.push(msg);
      generatedAlerts.push({ parameter: 'temperature', value: temp, severity: 'CRITICAL', title: 'Critical Hypothermia Alert', message: msg });
    } else if (temp > this.thresholds.temperature.normalMax || temp < this.thresholds.temperature.warningLow) {
      tempStatus = 'WARNING';
      highestSeverity = Math.max(highestSeverity, 1);
      issues.push(`Elevated/Abnormal Temperature: ${temp}°C`);
    }
    parameterStatuses.temperature = { value: temp, status: tempStatus };

    const statusMap = { 0: 'NORMAL', 1: 'WARNING', 2: 'CRITICAL' };
    const overallStatus = statusMap[highestSeverity];

    let recommendation = "Nominal vital signs. Patient physiological baseline stable.";
    if (overallStatus === 'CRITICAL') {
      recommendation = "Immediate attention recommended for this simulated case. Verify supplemental oxygen and bedside telemetry.";
    } else if (overallStatus === 'WARNING') {
      recommendation = "Observe vital trend velocity closely over next 15 minutes.";
    }

    return {
      overallStatus: overallStatus,
      parameterStatuses: parameterStatuses,
      severity: highestSeverity,
      reasons: issues,
      recommendation: recommendation,
      alerts: generatedAlerts,
      timestamp: new Date().toISOString()
    };
  }
};
