import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../config';

export interface ProgressData {
  page: number;
  total: number;
  progress: number;
  message: string;
}

export const useWebSocketProgress = () => {
  const [progressData, setProgressData] = useState<ProgressData>({
    page: 0,
    total: 0,
    progress: 0,
    message: '',
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string>('');
  
  if (!clientIdRef.current) {
    clientIdRef.current = `client_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Use generic progress endpoint
    // Use generic progress endpoint
    const ws = new WebSocket(`${WS_BASE_URL}/ws/progress/${clientIdRef.current}`);

    ws.onopen = () => {
      console.log(`WebSocket connected [${clientIdRef.current}]`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          setProgressData({
            page: data.page,
            total: data.total,
            progress: data.progress,
            message: data.message,
          });
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected [${clientIdRef.current}]`);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgressData({
      page: 0,
      total: 0,
      progress: 0,
      message: '',
    });
  }, []);

  return {
    clientId: clientIdRef.current,
    progressData,
    connect,
    disconnect,
    resetProgress,
  };
};
