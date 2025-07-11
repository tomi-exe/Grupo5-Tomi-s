import { useState, useEffect, useRef, useCallback } from 'react';

interface EventCapacity {
  eventName: string;
  capacity: {
    maximum: number;
    current: number;
    available: number;
    occupancyPercentage: number;
    isFull: boolean;
  };
  event: {
    date: string;
    status: string;
    lastUpdated?: string;
  };
  checkInStats?: {
    statusBreakdown: Array<{
      _id: string;
      count: number;
      latestCheckIn: string;
    }>;
    totalSuccessfulCheckIns: number;
    checkInsPerHour: Array<{
      _id: { hour: number; date: string };
      count: number;
    }>;
  };
}

interface RealtimeUpdate {
  eventName: string;
  checkInsCount: number;
  timestamp: string;
  userName?: string;
  type: 'checkin' | 'update' | 'alert';
}

interface DashboardSummary {
  totalEvents: number;
  totalCapacity: number;
  totalCheckedIn: number;
  fullEvents: number;
  averageOccupancy: number;
  utilizationRate: number;
}

interface Alert {
  eventName: string;
  type: 'full' | 'near_full' | 'error';
  occupancyPercentage?: number;
  available?: number;
  message?: string;
}

interface UseRealtimeCapacityOptions {
  eventNames: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeStats?: boolean;
  onUpdate?: (events: EventCapacity[]) => void;
  onAlert?: (alert: Alert) => void;
}

interface UseRealtimeCapacityReturn {
  events: EventCapacity[];
  summary: DashboardSummary | null;
  alerts: Alert[];
  realtimeUpdates: RealtimeUpdate[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isConnected: boolean;
  refreshData: () => Promise<void>;
  toggleAutoRefresh: () => void;
  autoRefresh: boolean;
}

export function useRealtimeCapacity(options: UseRealtimeCapacityOptions): UseRealtimeCapacityReturn {
  const {
    eventNames,
    autoRefresh = true,
    refreshInterval = 5000,
    includeStats = false,
    onUpdate,
    onAlert
  } = options;

  const [events, setEvents] = useState<EventCapacity[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);

  const eventSourceRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Función para obtener datos via API REST
  const fetchCapacityData = useCallback(async () => {
    if (eventNames.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          eventNames, 
          includeStats 
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setEvents(data.events);
      setSummary(data.summary);
      setAlerts(data.alerts || []);
      setLastUpdate(new Date());
      
      // Notificar actualizaciones
      if (onUpdate) {
        onUpdate(data.events);
      }

      // Notificar alertas
      if (onAlert && data.alerts?.length > 0) {
        data.alerts.forEach((alert: Alert) => onAlert(alert));
      }

      // Simular actualizaciones en tiempo real para demo
      if (data.events.length > 0 && Math.random() > 0.7) {
        const randomEvent = data.events[Math.floor(Math.random() * data.events.length)];
        const newUpdate: RealtimeUpdate = {
          eventName: randomEvent.eventName,
          checkInsCount: randomEvent.capacity.current,
          timestamp: new Date().toISOString(),
          userName: 'Usuario Demo',
          type: 'checkin'
        };
        setRealtimeUpdates(prev => [newUpdate, ...prev].slice(0, 20));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching capacity data:', err);
    } finally {
      setLoading(false);
    }
  }, [eventNames, includeStats, onUpdate, onAlert]);

  // Función para establecer conexión SSE
  const connectSSE = useCallback(() => {
    if (eventNames.length === 0) return;

    try {
      const eventNamesParam = eventNames.join(',');
      const url = `/api/events/realtime?events=${encodeURIComponent(eventNamesParam)}`;
      
      eventSourceRef.current = new EventSource(url);
      
      eventSourceRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log('SSE connection established');
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'initial':
            case 'update':
              setEvents(data.events);
              setLastUpdate(new Date());
              if (onUpdate) onUpdate(data.events);
              break;
              
            case 'checkin':
              const update: RealtimeUpdate = {
                eventName: data.eventName,
                checkInsCount: data.checkInsCount,
                timestamp: data.timestamp,
                userName: data.userName,
                type: 'checkin'
              };
              setRealtimeUpdates(prev => [update, ...prev].slice(0, 20));
              break;
              
            case 'alert':
              const alert: Alert = {
                eventName: data.eventName,
                type: data.alertType,
                occupancyPercentage: data.occupancyPercentage,
                available: data.available,
                message: data.message
              };
              setAlerts(prev => [alert, ...prev].slice(0, 10));
              if (onAlert) onAlert(alert);
              break;
              
            case 'heartbeat':
              // Mantener conexión activa
              break;
              
            case 'error':
              setError(data.message);
              break;
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSourceRef.current.onerror = () => {
        setIsConnected(false);
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect SSE (attempt ${reconnectAttempts.current})`);
            connectSSE();
          }, delay);
        } else {
          console.error('Max SSE reconnection attempts reached');
          setError('Conexión perdida. Cambiando a modo polling.');
          // Fallback a polling regular
          if (autoRefreshEnabled) {
            startPolling();
          }
        }
      };

    } catch (err) {
      console.error('Error establishing SSE connection:', err);
      setError('No se pudo establecer conexión en tiempo real');
      if (autoRefreshEnabled) {
        startPolling();
      }
    }
  }, [eventNames, onUpdate, onAlert, autoRefreshEnabled]);

  // Función para iniciar polling como fallback
  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      fetchCapacityData();
    }, refreshInterval);
  }, [fetchCapacityData, refreshInterval]);

  // Función para detener polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función para cerrar conexión SSE
  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Función para refrescar datos manualmente
  const refreshData = useCallback(async () => {
    await fetchCapacityData();
  }, [fetchCapacityData]);

  // Función para toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (eventNames.length > 0) {
      fetchCapacityData();
    }
  }, [eventNames, fetchCapacityData]);

  // Efecto para manejar auto-refresh
  useEffect(() => {
    if (!autoRefreshEnabled || eventNames.length === 0) {
      disconnectSSE();
      stopPolling();
      return;
    }

    // Intentar SSE primero, fallback a polling si falla
    if (typeof window !== 'undefined' && window.EventSource) {
      connectSSE();
    } else {
      startPolling();
    }

    return () => {
      disconnectSSE();
      stopPolling();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [autoRefreshEnabled, eventNames, connectSSE, startPolling, stopPolling, disconnectSSE]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      disconnectSSE();
      stopPolling();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [disconnectSSE, stopPolling]);

  return {
    events,
    summary,
    alerts,
    realtimeUpdates,
    loading,
    error,
    lastUpdate,
    isConnected,
    refreshData,
    toggleAutoRefresh,
    autoRefresh: autoRefreshEnabled
  };
}