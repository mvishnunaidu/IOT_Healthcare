/**
 * Patients Module
 * ================
 * Manages clinical profiles for demo patients, search/filters, and detail views.
 */

const PatientManager = {
  patients: [
    { id: 1, code: 'PT-1001', name: 'Rahul Kumar', age: 42, gender: 'Male', room: 'ICU-102', condition: 'Post-operative Cardiac Monitoring', deviceId: 'ESP32_NODE_01', status: 'NORMAL', hr: 74, spo2: 98, temp: 36.7 },
    { id: 2, code: 'PT-1002', name: 'Priya Sharma', age: 29, gender: 'Female', room: 'W-204', condition: 'Mild Bronchial Asthma', deviceId: 'ESP32_NODE_02', status: 'WARNING', hr: 82, spo2: 93, temp: 36.8 },
    { id: 3, code: 'PT-1003', name: 'Arjun Reddy', age: 58, gender: 'Male', room: 'CCU-05', condition: 'Hypertensive Heart Disease', deviceId: 'ESP32_NODE_03', status: 'WARNING', hr: 106, spo2: 96, temp: 37.1 },
    { id: 4, code: 'PT-1004', name: 'Sneha Rao', age: 34, gender: 'Female', room: 'W-108', condition: 'Pyrexia of Unknown Origin (PUO)', deviceId: 'ESP32_NODE_04', status: 'NORMAL', hr: 78, spo2: 98, temp: 37.2 },
    { id: 5, code: 'PT-1005', name: 'Kiran Patel', age: 67, gender: 'Male', room: 'ICU-105', condition: 'Chronic Obstructive Pulmonary Disease', deviceId: 'ESP32_NODE_05', status: 'WARNING', hr: 88, spo2: 92, temp: 36.6 }
  ],

  getPatient(id) {
    return this.patients.find(p => p.id === Number(id)) || this.patients[0];
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
      p.status = status;
    }
  },

  addPatient(patientData) {
    const newId = this.patients.length + 1;
    const newPatient = {
      id: newId,
      code: `PT-100${newId}`,
      name: patientData.name,
      age: Number(patientData.age),
      gender: patientData.gender,
      room: patientData.room || 'General Ward',
      condition: patientData.condition || 'General Observation',
      deviceId: `ESP32_NODE_0${newId}`,
      status: 'NORMAL',
      hr: 75,
      spo2: 98,
      temp: 36.7
    };
    this.patients.push(newPatient);
    return newPatient;
  }
};
