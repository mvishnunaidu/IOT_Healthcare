import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { HealthReading, Alert, DetectionResult } from '../types';

interface ReadingEventData {
  reading: HealthReading;
  detection: DetectionResult;
}

interface WebSocketContextType {
  isConnected: boolean;
  latestReading: HealthReading | null;
  latestDetection: DetectionResult | null;
  latestAlert: Alert | null;
  readingsHistory: HealthReading[];
  alertsHistory: Alert[];
  subscribeToPatient: (patientId: number, callback: (reading: HealthReading) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestReading, setLatestReading] = useState<HealthReading | null>(null);
  const [latestDetection, setLatestDetection] = useState<DetectionResult | null>(null);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [readingsHistory, setReadingsHistory] = useState<HealthReading[]>([]);
  const [alertsHistory, setAlertsHistory] = useState<Alert[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<number, Set<(r: HealthReading) => void>>>(new Map());

  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/live';
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[WebSocket] Connected to live healthcare stream.');
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
        setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.warn('[WebSocket] Error:', err);
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { event: evtType, data } = payload;

          if (evtType === 'NEW_READING') {
            const rData = data as ReadingEventData;
            setLatestReading(rData.reading);
            setLatestDetection(rData.detection);
            setReadingsHistory((prev) => [rData.reading, ...prev.slice(0, 49)]);

            // Notify specific patient subscribers
            const pSubs = subscribersRef.current.get(rData.reading.patient_id);
            if (pSubs) {
              pSubs.forEach((cb) => cb(rData.reading));
            }
          } else if (evtType === 'NEW_ALERT') {
            const alertData = data as Alert;
            setLatestAlert(alertData);
            setAlertsHistory((prev) => [alertData, ...prev.slice(0, 29)]);
          }
        } catch (e) {
          console.error('[WebSocket] Message parsing error:', e);
        }
      };
    } catch (e) {
      console.warn('[WebSocket] Connection failure:', e);
      setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribeToPatient = useCallback((patientId: number, callback: (reading: HealthReading) => void) => {
    if (!subscribersRef.current.has(patientId)) {
      subscribersRef.current.set(patientId, new Set());
    }
    subscribersRef.current.get(patientId)!.add(callback);

    return () => {
      const subs = subscribersRef.current.get(patientId);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          subscribersRef.current.delete(patientId);
        }
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        latestReading,
        latestDetection,
        latestAlert,
        readingsHistory,
        alertsHistory,
        subscribeToPatient,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useLiveVitals = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useLiveVitals must be used within WebSocketProvider');
  return ctx;
};
