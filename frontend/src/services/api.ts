import axios from 'axios';
import { Patient, HealthReading, Alert, SimulatorStatus, ArchitectureNode, DetectionResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach Token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name: string, email: string, password: string, role: string = 'doctor') => {
    const res = await apiClient.post('/auth/register', { name, email, password, role });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Patients
  getPatients: async (): Promise<Patient[]> => {
    const res = await apiClient.get('/patients');
    return res.data;
  },
  getPatient: async (id: number): Promise<Patient> => {
    const res = await apiClient.get(`/patients/${id}`);
    return res.data;
  },
  createPatient: async (data: Partial<Patient>): Promise<Patient> => {
    const res = await apiClient.post('/patients', data);
    return res.data;
  },
  updatePatient: async (id: number, data: Partial<Patient>): Promise<Patient> => {
    const res = await apiClient.put(`/patients/${id}`, data);
    return res.data;
  },
  deletePatient: async (id: number): Promise<void> => {
    await apiClient.delete(`/patients/${id}`);
  },

  // Readings
  getPatientReadings: async (patientId: number, limit: number = 40): Promise<HealthReading[]> => {
    const res = await apiClient.get(`/readings/patient/${patientId}?limit=${limit}`);
    return res.data;
  },
  getLatestReadings: async (): Promise<HealthReading[]> => {
    const res = await apiClient.get('/readings/latest');
    return res.data;
  },
  ingestReading: async (payload: any) => {
    const res = await apiClient.post('/readings', payload);
    return res.data;
  },

  // Alerts
  getAlerts: async (params?: { severity?: string; resolved?: boolean; patient_id?: number; limit?: number }): Promise<Alert[]> => {
    const res = await apiClient.get('/alerts', { params });
    return res.data;
  },
  updateAlert: async (id: number, data: { acknowledged?: boolean; resolved?: boolean; acknowledged_by?: string }): Promise<Alert> => {
    const res = await apiClient.patch(`/alerts/${id}`, data);
    return res.data;
  },

  // Simulation
  getSimulationStatus: async (): Promise<SimulatorStatus> => {
    const res = await apiClient.get('/simulation/status');
    return res.data;
  },
  startSimulation: async (patientId: number, mode: string = 'NORMAL', intervalSeconds: number = 3.0) => {
    const res = await apiClient.post('/simulation/start', {
      patient_id: patientId,
      mode,
      interval_seconds: intervalSeconds,
    });
    return res.data;
  },
  stopSimulation: async () => {
    const res = await apiClient.post('/simulation/stop');
    return res.data;
  },
  setSimulationScenario: async (mode: string) => {
    const res = await apiClient.post('/simulation/scenario', { mode });
    return res.data;
  },
  analyzeCustomVitals: async (payload: {
    patient_id: number;
    heart_rate: number;
    spo2: number;
    temperature: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    respiratory_rate?: number;
  }): Promise<{ reading: HealthReading; detection: DetectionResult; edge_telemetry: any; alerts: Alert[] }> => {
    const res = await apiClient.post('/simulation/analyze', payload);
    return res.data;
  },
  triggerAbnormalEvent: async (patientId: number) => {
    const res = await apiClient.post('/simulation/trigger-abnormal', { patient_id: patientId });
    return res.data;
  },

  // Architecture Nodes
  getArchitectureNodes: async (): Promise<ArchitectureNode[]> => {
    const res = await apiClient.get('/architecture/nodes');
    return res.data;
  },

  // Threshold Settings
  getThresholds: async () => {
    const res = await apiClient.get('/settings/thresholds');
    return res.data;
  },
  updateThresholds: async (thresholds: any) => {
    const res = await apiClient.put('/settings/thresholds', thresholds);
    return res.data;
  },
};
