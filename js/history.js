/**
 * Health History & Data Persistence Module
 * =========================================
 * Records telemetry time-series logs and supports CSV export.
 */

const HistoryManager = {
  logs: [],

  record(reading, detection) {
    this.logs.unshift({
      timestamp: reading.timestamp,
      patientId: reading.patientId,
      heartRate: reading.heartRate,
      spo2: reading.spo2,
      temperature: reading.temperature,
      systolicBP: reading.systolicBP,
      diastolicBP: reading.diastolicBP,
      status: detection.overallStatus
    });

    if (this.logs.length > 500) {
      this.logs.pop();
    }
  },

  exportToCSV(patientList) {
    const headers = "Timestamp,Patient Code,Patient Name,Heart Rate (BPM),SpO2 (%),Temperature (°C),Blood Pressure (mmHg),Status\n";
    
    const rows = patientList.map(p => {
      const now = new Date().toISOString();
      return `"${now}","${p.code}","${p.name}",${p.hr},${p.spo2},${p.temp},"${p.hr > 100 ? '130/85' : '118/78'}","${p.status}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `healthguard_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
