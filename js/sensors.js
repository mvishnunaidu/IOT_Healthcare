/**
 * HealthGuard IoT - Virtual Sensors Module
 * =========================================
 * Simulates biomedical sensors:
 * - Photoplethysmogram (PPG) Optical Sensor (Heart Rate BPM)
 * - Dual-Wavelength Pulse Oximeter (SpO2 %)
 * - NTC Medical Thermistor (Core Body Temperature °C)
 * - Non-Invasive Hemodynamic Estimator (Blood Pressure mmHg, Respiration Rate rpm)
 * 
 * Generates natural physiological waveforms with stochastic micro-variations.
 */

const VirtualSensors = {
  tick: 0,

  /**
   * Generates a single vital reading set based on the selected mode.
   * @param {string} mode - 'NORMAL' | 'WARNING' | 'CRITICAL' | 'WAVE' | 'TACHYCARDIA' | 'BRADYCARDIA' | 'HYPOXIA' | 'FEVER' | 'MULTI_DISTRESS'
   */
  generateSensorReading(mode = 'NORMAL') {
    this.tick++;
    const noise = (amplitude) => (Math.random() * 2 - 1) * amplitude;

    switch (mode) {
      case 'NORMAL':
        return {
          heartRate: Number((74 + noise(2.5)).toFixed(1)),
          spo2: Number(Math.min(100, 98.4 + noise(0.6)).toFixed(1)),
          temperature: Number((36.7 + noise(0.12)).toFixed(1)),
          systolicBP: Math.round(118 + noise(3)),
          diastolicBP: Math.round(78 + noise(2)),
          respiratoryRate: Math.round(16 + noise(1))
        };

      case 'TACHYCARDIA':
        return {
          heartRate: Number((146 + noise(4)).toFixed(1)),
          spo2: Number((95.5 + noise(0.8)).toFixed(1)),
          temperature: Number((37.2 + noise(0.15)).toFixed(1)),
          systolicBP: Math.round(142 + noise(5)),
          diastolicBP: Math.round(92 + noise(4)),
          respiratoryRate: Math.round(24 + noise(2))
        };

      case 'BRADYCARDIA':
        return {
          heartRate: Number((42 + noise(2)).toFixed(1)),
          spo2: Number((97.2 + noise(0.5)).toFixed(1)),
          temperature: Number((36.4 + noise(0.1)).toFixed(1)),
          systolicBP: Math.round(102 + noise(4)),
          diastolicBP: Math.round(64 + noise(3)),
          respiratoryRate: Math.round(12 + noise(1))
        };

      case 'HYPOXIA':
        return {
          heartRate: Number((105 + noise(4)).toFixed(1)),
          spo2: Number((84.2 + noise(1.1)).toFixed(1)),
          temperature: Number((36.6 + noise(0.15)).toFixed(1)),
          systolicBP: Math.round(135 + noise(5)),
          diastolicBP: Math.round(88 + noise(3)),
          respiratoryRate: Math.round(28 + noise(2))
        };

      case 'FEVER':
        return {
          heartRate: Number((118 + noise(4)).toFixed(1)),
          spo2: Number((93.5 + noise(0.8)).toFixed(1)),
          temperature: Number((39.5 + noise(0.2)).toFixed(1)),
          systolicBP: Math.round(130 + noise(4)),
          diastolicBP: Math.round(84 + noise(3)),
          respiratoryRate: Math.round(24 + noise(2))
        };

      case 'MULTI_DISTRESS':
      case 'CRITICAL':
        return {
          heartRate: Number((142 + noise(5)).toFixed(1)),
          spo2: Number((82.4 + noise(1.2)).toFixed(1)),
          temperature: Number((39.8 + noise(0.25)).toFixed(1)),
          systolicBP: Math.round(155 + noise(6)),
          diastolicBP: Math.round(98 + noise(4)),
          respiratoryRate: Math.round(30 + noise(2))
        };

      case 'WARNING':
        return {
          heartRate: Number((108 + noise(3)).toFixed(1)),
          spo2: Number((92.8 + noise(0.8)).toFixed(1)),
          temperature: Number((37.9 + noise(0.2)).toFixed(1)),
          systolicBP: Math.round(132 + noise(4)),
          diastolicBP: Math.round(86 + noise(3)),
          respiratoryRate: Math.round(22 + noise(2))
        };

      case 'WAVE':
      default: {
        const phase = Math.sin(this.tick * 0.28);
        return {
          heartRate: Number((85 + 35 * phase + noise(2)).toFixed(1)),
          spo2: Number((96 - 6 * Math.max(0, phase) + noise(0.5)).toFixed(1)),
          temperature: Number((37.0 + 1.2 * Math.max(0, phase) + noise(0.1)).toFixed(1)),
          systolicBP: Math.round(120 + 20 * phase),
          diastolicBP: Math.round(80 + 10 * phase),
          respiratoryRate: Math.round(16 + 8 * Math.max(0, phase))
        };
      }
    }
  }
};
