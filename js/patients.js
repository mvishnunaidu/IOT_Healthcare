/**
 * HealthGuard IoT - Patients Directory & State Management
 * =======================================================
 * Manages 20 clinical patient profiles across specialized hospital wards:
 * ICU, CCU, Cardiac Wing, Emergency ER, General Medicine, Pulmonary Care, Post-Op.
 */

const PatientManager = {
  patients: [
    { id: 1, code: 'PT-1001', name: 'Rahul Kumar', age: 42, gender: 'Male', room: 'ICU-101', condition: 'Post-operative Cardiac Bypass Oversight', deviceId: 'ESP32_NODE_01', status: 'NORMAL', hr: 74, spo2: 98.4, temp: 36.7, systolicBP: 118, diastolicBP: 78, resp: 16, baselines: {} },
    { id: 2, code: 'PT-1002', name: 'Priya Sharma', age: 29, gender: 'Female', room: 'W-204', condition: 'Acute Bronchial Asthma & Wheezing', deviceId: 'ESP32_NODE_02', status: 'WARNING', hr: 104, spo2: 94.2, temp: 37.8, systolicBP: 126, diastolicBP: 82, resp: 22, baselines: {} },
    { id: 3, code: 'PT-1003', name: 'Arjun Reddy', age: 58, gender: 'Male', room: 'CCU-05', condition: 'Hypertensive Heart Failure & Arrhythmia', deviceId: 'ESP32_NODE_03', status: 'CRITICAL', hr: 138, spo2: 88.5, temp: 39.2, systolicBP: 154, diastolicBP: 96, resp: 28, baselines: {} },
    { id: 4, code: 'PT-1004', name: 'Sneha Rao', age: 34, gender: 'Female', room: 'W-108', condition: 'Sinus Bradycardia & Syncope Observation', deviceId: 'ESP32_NODE_04', status: 'NORMAL', hr: 44, spo2: 97.0, temp: 36.4, systolicBP: 102, diastolicBP: 66, resp: 14, baselines: { heartRate: { normalMin: 40, normalMax: 60, warningLow: 35, warningHigh: 80, criticalLow: 30, criticalHigh: 100 } } },
    { id: 5, code: 'PT-1005', name: 'Kiran Patel', age: 67, gender: 'Male', room: 'ICU-105', condition: 'Chronic Obstructive Pulmonary Disease (COPD)', deviceId: 'ESP32_NODE_05', status: 'NORMAL', hr: 92, spo2: 92.6, temp: 37.4, systolicBP: 132, diastolicBP: 84, resp: 24, baselines: { spo2: { normalMin: 88, normalMax: 94, warningLow: 85, criticalLow: 80 } } },
    { id: 6, code: 'PT-1006', name: 'Ananya Deshmukh', age: 45, gender: 'Female', room: 'ICU-103', condition: 'Severe Sepsis & Hyperthermia Protocol', deviceId: 'ESP32_NODE_06', status: 'CRITICAL', hr: 124, spo2: 89.8, temp: 39.6, systolicBP: 94, diastolicBP: 58, resp: 26, baselines: {} },
    { id: 7, code: 'PT-1007', name: 'Vikram Malhotra', age: 51, gender: 'Male', room: 'CCU-02', condition: 'Acute Myocardial Infarction Recovery', deviceId: 'ESP32_NODE_07', status: 'NORMAL', hr: 72, spo2: 98.8, temp: 36.6, systolicBP: 120, diastolicBP: 80, resp: 15, baselines: {} },
    { id: 8, code: 'PT-1008', name: 'Meera Nambiar', age: 38, gender: 'Female', room: 'ER-04', condition: 'Acute Respiratory Distress Syndrome (ARDS)', deviceId: 'ESP32_NODE_08', status: 'CRITICAL', hr: 132, spo2: 86.4, temp: 38.9, systolicBP: 140, diastolicBP: 90, resp: 30, baselines: {} },
    { id: 9, code: 'PT-1009', name: 'Sanjay Gupta', age: 63, gender: 'Male', room: 'W-312', condition: 'Type-2 Diabetic Ketoacidosis Oversight', deviceId: 'ESP32_NODE_09', status: 'NORMAL', hr: 78, spo2: 97.6, temp: 36.8, systolicBP: 124, diastolicBP: 82, resp: 17, baselines: {} },
    { id: 10, code: 'PT-1010', name: 'Pooja Hegde', age: 26, gender: 'Female', room: 'W-210', condition: 'Post-Trauma Orthopedic Telemetry', deviceId: 'ESP32_NODE_10', status: 'NORMAL', hr: 70, spo2: 99.1, temp: 36.5, systolicBP: 116, diastolicBP: 76, resp: 16, baselines: {} },
    { id: 11, code: 'PT-1011', name: 'Rohan Joshi', age: 54, gender: 'Male', room: 'ICU-107', condition: 'Bilateral Viral Pneumonia & Hypoxemia', deviceId: 'ESP32_NODE_11', status: 'CRITICAL', hr: 118, spo2: 87.2, temp: 39.1, systolicBP: 138, diastolicBP: 88, resp: 27, baselines: {} },
    { id: 12, code: 'PT-1012', name: 'Kavita Menon', age: 49, gender: 'Female', room: 'CCU-08', condition: 'Paroxysmal Supraventricular Tachycardia', deviceId: 'ESP32_NODE_12', status: 'WARNING', hr: 112, spo2: 95.0, temp: 37.0, systolicBP: 134, diastolicBP: 86, resp: 20, baselines: {} },
    { id: 13, code: 'PT-1013', name: 'Deepak Chopra', age: 71, gender: 'Male', room: 'ICU-108', condition: 'Congestive Heart Failure Stage-III', deviceId: 'ESP32_NODE_13', status: 'WARNING', hr: 98, spo2: 93.4, temp: 36.9, systolicBP: 142, diastolicBP: 92, resp: 21, baselines: {} },
    { id: 14, code: 'PT-1014', name: 'Sunita Roy', age: 60, gender: 'Female', room: 'W-115', condition: 'Hypertensive Crisis Under Anti-hypertensives', deviceId: 'ESP32_NODE_14', status: 'WARNING', hr: 102, spo2: 96.0, temp: 37.3, systolicBP: 168, diastolicBP: 102, resp: 19, baselines: {} },
    { id: 15, code: 'PT-1015', name: 'Amitabh Sen', age: 36, gender: 'Male', room: 'ER-09', condition: 'Anaphylactic Reaction Observation', deviceId: 'ESP32_NODE_15', status: 'NORMAL', hr: 80, spo2: 98.2, temp: 36.8, systolicBP: 122, diastolicBP: 78, resp: 18, baselines: {} },
    { id: 16, code: 'PT-1016', name: 'Geeta Nair', age: 52, gender: 'Female', room: 'W-305', condition: 'Post-Thyroidectomy Calcium Balance', deviceId: 'ESP32_NODE_16', status: 'NORMAL', hr: 76, spo2: 98.0, temp: 36.7, systolicBP: 118, diastolicBP: 76, resp: 15, baselines: {} },
    { id: 17, code: 'PT-1017', name: 'Farhan Ali', age: 41, gender: 'Male', room: 'ICU-106', condition: 'Acute Pulmonary Embolism Alert', deviceId: 'ESP32_NODE_17', status: 'CRITICAL', hr: 142, spo2: 85.0, temp: 38.6, systolicBP: 90, diastolicBP: 55, resp: 32, baselines: {} },
    { id: 18, code: 'PT-1018', name: 'Divya Iyer', age: 31, gender: 'Female', room: 'W-215', condition: 'Severe Anemia with Palpitations', deviceId: 'ESP32_NODE_18', status: 'WARNING', hr: 108, spo2: 94.8, temp: 37.2, systolicBP: 110, diastolicBP: 70, resp: 20, baselines: {} },
    { id: 19, code: 'PT-1019', name: 'Rajesh Khanna', age: 65, gender: 'Male', room: 'CCU-04', condition: 'Ischemic Stroke Telemetry Oversight', deviceId: 'ESP32_NODE_19', status: 'NORMAL', hr: 73, spo2: 97.8, temp: 36.6, systolicBP: 130, diastolicBP: 82, resp: 16, baselines: {} },
    { id: 20, code: 'PT-1020', name: 'Shalini Verma', age: 24, gender: 'Female', room: 'W-102', condition: 'Post-Appendectomy Vitals Telemetry', deviceId: 'ESP32_NODE_20', status: 'NORMAL', hr: 75, spo2: 99.0, temp: 36.7, systolicBP: 115, diastolicBP: 75, resp: 15, baselines: {} }
  ],

  getPatient(id) {
    const numId = Number(id);
    return this.patients.find(p => p.id === numId) || this.patients[0];
  },

  getPatientById(id) {
    return this.getPatient(id);
  },

  getAllPatients() {
    return this.patients;
  },

  updatePatientVitals(patientId, vitals, status) {
    const p = this.getPatient(patientId);
    if (p) {
      p.hr = vitals.heartRate;
      p.spo2 = vitals.spo2;
      p.temp = vitals.temperature;
      p.systolicBP = vitals.systolicBP || p.systolicBP;
      p.diastolicBP = vitals.diastolicBP || p.diastolicBP;
      p.status = status;
    }
  },

  getSummaryStats() {
    const total = this.patients.length;
    const normal = this.patients.filter(p => p.status === 'NORMAL').length;
    const warning = this.patients.filter(p => p.status === 'WARNING').length;
    const critical = this.patients.filter(p => p.status === 'CRITICAL').length;
    return { total, normal, warning, critical };
  },

  addPatient(patientData) {
    const newId = this.patients.length + 1;
    const newPatient = {
      id: newId,
      code: `PT-10${newId < 10 ? '0' + newId : newId}`,
      name: patientData.name,
      age: Number(patientData.age),
      gender: patientData.gender,
      room: patientData.room || 'General Ward',
      condition: patientData.condition || 'General Clinical Observation',
      deviceId: `ESP32_NODE_${newId < 10 ? '0' + newId : newId}`,
      status: 'NORMAL',
      hr: 75,
      spo2: 98.2,
      temp: 36.7,
      systolicBP: 120,
      diastolicBP: 80,
      resp: 16
    };
    this.patients.push(newPatient);
    return newPatient;
  }
};
