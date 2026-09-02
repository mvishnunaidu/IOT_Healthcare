/**
 * HealthGuard IoT - Health History & Data Persistence Module
 * ==========================================================
 * Manages time-series physiological telemetry logs with rich initial records
 * and seamless CSV dataset export for clinical audits.
 */

const HistoryStore = {
  records: [
    { timestamp: new Date(Date.now() - 30000).toISOString(), patientId: 1, heartRate: 74, spo2: 98.4, temperature: 36.7, systolicBP: 118, diastolicBP: 78, status: 'NORMAL' },
    { timestamp: new Date(Date.now() - 65000).toISOString(), patientId: 2, heartRate: 104, spo2: 94.2, temperature: 37.8, systolicBP: 126, diastolicBP: 82, status: 'WARNING' },
    { timestamp: new Date(Date.now() - 110000).toISOString(), patientId: 3, heartRate: 138, spo2: 88.5, temperature: 39.2, systolicBP: 145, diastolicBP: 92, status: 'CRITICAL' },
    { timestamp: new Date(Date.now() - 160000).toISOString(), patientId: 4, heartRate: 44, spo2: 97.0, temperature: 36.4, systolicBP: 105, diastolicBP: 68, status: 'CRITICAL' },
    { timestamp: new Date(Date.now() - 210000).toISOString(), patientId: 5, heartRate: 82, spo2: 98.0, temperature: 36.8, systolicBP: 122, diastolicBP: 80, status: 'NORMAL' },
    { timestamp: new Date(Date.now() - 260000).toISOString(), patientId: 1, heartRate: 75, spo2: 98.2, temperature: 36.7, systolicBP: 119, diastolicBP: 78, status: 'NORMAL' },
    { timestamp: new Date(Date.now() - 310000).toISOString(), patientId: 2, heartRate: 106, spo2: 93.8, temperature: 37.9, systolicBP: 128, diastolicBP: 84, status: 'WARNING' },
    { timestamp: new Date(Date.now() - 370000).toISOString(), patientId: 3, heartRate: 142, spo2: 87.0, temperature: 39.4, systolicBP: 148, diastolicBP: 94, status: 'CRITICAL' },
    { timestamp: new Date(Date.now() - 430000).toISOString(), patientId: 1, heartRate: 72, spo2: 98.6, temperature: 36.6, systolicBP: 117, diastolicBP: 77, status: 'NORMAL' }
  ],

  addRecord(reading, detection) {
    const record = {
      timestamp: reading.timestamp || new Date().toISOString(),
      patientId: reading.patientId || 1,
      heartRate: reading.heartRate,
      spo2: reading.spo2,
      temperature: reading.temperature,
      systolicBP: reading.systolicBP || 120,
      diastolicBP: reading.diastolicBP || 80,
      status: detection?.overallStatus || 'NORMAL'
    };

    this.records.unshift(record);
    if (this.records.length > 250) {
      this.records.pop();
    }
    return record;
  },

  getAllRecords() {
    return this.records;
  },

  getRecordsByPatient(patientId) {
    return this.records.filter(r => r.patientId === Number(patientId));
  },

  exportCSV() {
    const headers = "Timestamp,Patient Code,Heart Rate (BPM),SpO2 (%),Temperature (C),Blood Pressure (mmHg),Triage Status\n";
    const rows = this.records.map(r => {
      return `"${r.timestamp}","PT-100${r.patientId}",${r.heartRate},${r.spo2},${r.temperature},"${r.systolicBP}/${r.diastolicBP}","${r.status}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `healthguard_telemetry_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Backwards compatibility alias
const HistoryManager = HistoryStore;
