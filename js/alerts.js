/**
 * HealthGuard IoT - Clinical Alert & Emergency Triage Engine
 * ==========================================================
 * Manages clinical abnormality alert lifecycle: ACTIVE -> ACKNOWLEDGED -> RESOLVED
 */

const AlertManager = {
  alerts: [
    {
      id: 'ALT-9041',
      patientId: 3,
      severity: 'CRITICAL',
      status: 'ACTIVE',
      title: 'Acute Desaturation & Hypoxia Emergency',
      message: 'Arjun Reddy (PT-1003): SpO2 dropped to 84.2% with secondary tachycardia (138 BPM). Immediate oxygenation required.',
      time: '2 mins ago',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      vitalValues: { hr: 138, spo2: 84.2, temp: 39.2 }
    },
    {
      id: 'ALT-9038',
      patientId: 2,
      severity: 'WARNING',
      status: 'ACTIVE',
      title: 'Observation: Borderline Tachycardia Alert',
      message: 'Priya Sharma (PT-1002): Heart rate elevated to 108 BPM with mild temperature rise (37.8°C).',
      time: '8 mins ago',
      timestamp: new Date(Date.now() - 480000).toISOString(),
      vitalValues: { hr: 108, spo2: 94.5, temp: 37.8 }
    },
    {
      id: 'ALT-9022',
      patientId: 4,
      severity: 'CRITICAL',
      status: 'ACKNOWLEDGED',
      title: 'Bradycardia Event Acknowledged',
      message: 'Sneha Rao (PT-1004): Heart rate dropped to 42 BPM. Bedside nurse alerted for atropine protocol review.',
      time: '25 mins ago',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      vitalValues: { hr: 42, spo2: 97.2, temp: 36.4 }
    }
  ],

  createAlert(alertData) {
    const newAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: alertData.patientId || 1,
      severity: alertData.severity || 'CRITICAL',
      status: 'ACTIVE',
      title: alertData.title || `${alertData.severity} Clinical Alert`,
      message: alertData.message || 'Abnormal vital parameters detected on bedside telemetry feed.',
      time: 'Just now',
      timestamp: new Date().toISOString(),
      vitalValues: alertData.vitalValues || { hr: 74, spo2: 98, temp: 36.7 }
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  },

  acknowledgeAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
    }
  },

  resolveAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'RESOLVED';
    }
  },

  getActiveCount() {
    return this.alerts.filter(a => a.status === 'ACTIVE').length;
  }
};
