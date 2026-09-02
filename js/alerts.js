/**
 * Alerts Module
 * ==============
 * Manages clinical abnormality alerts triage lifecycle:
 * - Generation from Abnormality Engine
 * - Acknowledgment by Clinician
 * - Resolution with clinical notes
 */

const AlertManager = {
  alerts: [
    { id: 101, patientId: 2, patientName: 'Priya Sharma', parameter: 'spo2', value: 93, severity: 'WARNING', title: 'SpO2 Desaturation Warning', message: 'SpO2 dropped to 93% (Below normal 95% threshold)', timestamp: new Date(Date.now() - 120000).toISOString(), timeFormatted: '2 mins ago', acknowledged: false, resolved: false },
    { id: 102, patientId: 3, patientName: 'Arjun Reddy', parameter: 'heartRate', value: 106, severity: 'WARNING', title: 'Elevated Heart Rate', message: 'Heart rate exceeds 100 BPM target limit', timestamp: new Date(Date.now() - 840000).toISOString(), timeFormatted: '14 mins ago', acknowledged: true, resolved: false }
  ],

  createAlert(alertData) {
    const newAlert = {
      id: Date.now(),
      patientId: alertData.patientId,
      patientName: alertData.patientName,
      parameter: alertData.parameter,
      value: alertData.value,
      severity: alertData.severity || 'WARNING',
      title: alertData.title,
      message: alertData.message,
      timestamp: new Date().toISOString(),
      timeFormatted: 'Just now',
      acknowledged: false,
      resolved: false
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  },

  acknowledge(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = 'Dr. Sameer Verma';
    }
  },

  resolve(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
    }
  },

  getActiveAlerts() {
    return this.alerts.filter(a => !a.resolved);
  },

  getAllAlerts() {
    return this.alerts;
  }
};
