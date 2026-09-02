import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AlertsPage } from './pages/AlertsPage';
import { HealthHistoryPage } from './pages/HealthHistoryPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="patients" element={<PatientsPage />} />
                  <Route path="patients/:id" element={<PatientDetailPage />} />
                  <Route path="live" element={<LiveMonitoringPage />} />
                  <Route path="simulator" element={<SimulatorPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="history" element={<HealthHistoryPage />} />
                  <Route path="architecture" element={<ArchitecturePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
