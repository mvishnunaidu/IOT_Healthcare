export type VitalStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Patient {
  id: number;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_conditions?: string;
  room_number?: string;
  device_id: string;
  created_at: string;
  updated_at?: string;
  latest_reading?: HealthReadingSummary;
  current_status?: VitalStatus;
}

export interface HealthReadingSummary {
  heart_rate: number;
  spo2: number;
  temperature: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  respiratory_rate?: number;
  status: VitalStatus;
  timestamp: string;
}

export interface HealthReading {
  id: number;
  patient_id: number;
  device_id: string;
  heart_rate: number;
  spo2: number;
  temperature: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  respiratory_rate?: number;
  status: VitalStatus;
  analysis_reason?: string;
  timestamp: string;
  edge_telemetry?: {
    edge_node_id: string;
    processing_latency_ms: number;
    signal_quality_score: number;
    warnings: string[];
    validated_at: string;
  };
}

export interface Alert {
  id: number;
  patient_id: number;
  reading_id?: number;
  parameter: string;
  value?: number;
  threshold_violated?: string;
  severity: 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved: boolean;
  resolved_at?: string;
  timestamp: string;
  patient_name?: string;
  patient_code?: string;
}

export interface SimulatorStatus {
  is_running: boolean;
  active_patient_id: number | null;
  active_patient_name: string | null;
  mode: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'WAVE' | 'RANDOM';
  interval_seconds: number;
  packets_transmitted: number;
  last_transmission: string | null;
  latest_reading: HealthReading | null;
  device_id?: string;
}

export interface ArchitectureNode {
  id: string;
  step: number;
  title: string;
  category: string;
  short_desc: string;
  purpose: string;
  input: string;
  output: string;
  technology: string;
  example_data: Record<string, any>;
  viva_talking_points: string[];
}

export interface DetectionResult {
  overall_status: VitalStatus;
  severity_score: number;
  issues_detected: string[];
  parameters_status: Record<string, {
    value: number;
    unit: string;
    status: VitalStatus;
    message?: string;
  }>;
  recommendation: string;
  ml_insights?: {
    ml_model_version: string;
    anomaly_risk_score: number;
    predicted_risk_level: string;
    contributing_features: string[];
    confidence: number;
  };
  generated_alerts?: any[];
  timestamp: string;
}
