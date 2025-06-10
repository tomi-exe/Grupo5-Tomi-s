import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Eye,
  BarChart3,
  Activity
} from 'lucide-react';

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
  };
  checkInStats: {
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
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<EventCapacity[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simular eventos de demostración
  const mockEvents = [
    'Concierto Coldplay',
    'Festival de Jazz', 
    'Stand-Up Comedy Show',
    'Orquesta Sinfónica',
    'Festival de Música Electrónica'
  ];

  // Función para obtener datos de capacidad
  const fetchCapacityData = async (eventNames: string[]) => {
    try {
      setLoading(true);
      
      // En una implementación real, esto haría una llamada a la API
      // const response = await fetch('/api/events/capacity', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ eventNames })
      // });
      // const data = await response.json();
      
      // Simulamos datos para demostración
      const simulatedData: EventCapacity[] = eventNames.map((eventName, index) => {
        const maxCapacity = 1000 + (index * 500);
        const current = Math.floor(Math.random() * maxCapacity * 0.8);
        const occupancyPercentage = Math.round((current / maxCapacity) * 100);
        
        return {
          eventName,
          capacity: {
            maximum: maxCapacity,
            current,
            available: maxCapacity - current,
            occupancyPercentage,
            isFull: occupancyPercentage >= 100
          },
          event: {
            date: new Date(Date.now() + (index * 24 * 60 * 60 * 1000)).toISOString(),
            status: occupancyPercentage >= 100 ? 'full' : 'ongoing'
          },
          checkInStats: {
            statusBreakdown: [
              { _id: 'successful', count: current, latestCheckIn: new Date().toISOString() },
              { _id: 'failed', count: Math.floor(current * 0.02), latestCheckIn: new Date().toISOString() }
            ],
            totalSuccessfulCheckIns: current,
            checkInsPerHour: Array.from({ length: 6 }, (_, i) => ({
              _id: { hour: 18 + i, date: new Date().toISOString().split('T')[0] },
              count: Math.floor(Math.random() * 50) + 10
            }))
          }
        };
      });
      
      setEvents(simulatedData);
      setLastUpdate(new Date());
      
      // Simular actualizaciones en tiempo real
      if (simulatedData.length > 0 && Math.random() > 0.7) {
        const randomEvent = simulatedData[Math.floor(Math.random() * simulatedData.length)];
        const newUpdate: RealtimeUpdate = {
          eventName: randomEvent.eventName,
          checkInsCount: randomEvent.capacity.current,
          timestamp: new Date().toISOString(),
          userName: 'Usuario Demo'
        };
        setRealtimeUpdates(prev => [newUpdate, ...prev].slice(0, 10));
      }
      
    } catch (error) {
      console.error('Error fetching capacity data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchCapacityData(mockEvents);
    if (mockEvents.length > 0) {
      setSelectedEvent(mockEvents[0]);
    }
  }, []);

  // Efecto para auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchCapacityData(mockEvents);
    }, 5000); // Actualizar cada 5 segundos
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-400 bg-red-500/20 border-red-500/50';
    if (percentage >= 80) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    if (percentage >= 60) return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
    return 'text-green-400 bg-green-500/20 border-green-500/50';
  };

  const selectedEventData = events.find(e => e.eventName === selectedEvent);

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              Dashboard del Organizador
            </h1>
            <p className="text-gray-400 mt-2">
              Control de aforo en tiempo real - Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                autoRefresh 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <Activity className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
              {autoRefresh ? 'Auto-actualización ON' : 'Auto-actualización OFF'}
            </button>
            
            <button
              onClick={() => fetchCapacityData(mockEvents)}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#192734] p-6 rounded-lg border border-[#233748]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Eventos</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#192734] p-6 rounded-lg border border-[#233748]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Check-ins Totales</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + e.capacity.current, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#192734] p-6 rounded-lg border border-[#233748]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Capacidad Total</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + e.capacity.maximum, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#192734] p-6 rounded-lg border border-[#233748]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Eventos Llenos</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => e.capacity.isFull).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Lista de Eventos */}
          <div className="lg:col-span-2">
            <div className="bg-[#192734] rounded-lg border border-[#233748] p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Aforo por Evento
              </h2>
              
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.eventName}
                    className={`p-4 rounded-lg border cursor-pointer transition ${
                      selectedEvent === event.eventName
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#233748] hover:border-[#2c3e50]'
                    }`}
                    onClick={() => setSelectedEvent(event.eventName)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{event.eventName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.event.date).toLocaleDateString('es-CL')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(event.event.date).toLocaleTimeString('es-CL', { 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(event.capacity.occupancyPercentage)
                      }`}>
                        {event.capacity.occupancyPercentage}%
                      </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span>{event.capacity.current.toLocaleString()} / {event.capacity.maximum.toLocaleString()}</span>
                        <span className="text-gray-400">
                          {event.capacity.available.toLocaleString()} disponibles
                        </span>
                      </div>
                      <div className="w-full bg-[#233748] rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getCapacityColor(event.capacity.occupancyPercentage)}`}
                          style={{ width: `${Math.min(event.capacity.occupancyPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Alertas */}
                    {event.capacity.isFull && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Evento lleno - No más ingresos
                      </div>
                    )}
                    
                    {event.capacity.occupancyPercentage >= 90 && !event.capacity.isFull && (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Cerca del límite - {event.capacity.available} espacios restantes
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Lateral - Detalles y Actualizaciones */}
          <div className="space-y-6">
            
            {/* Detalles del Evento Seleccionado */}
            {selectedEventData && (
              <div className="bg-[#192734] rounded-lg border border-[#233748] p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {selectedEventData.eventName}
                </h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {selectedEventData.capacity.occupancyPercentage}%
                    </div>
                    <div className="text-sm text-gray-400">Ocupación actual</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-[#233748] p-3 rounded-lg">
                      <div className="text-xl font-bold text-green-400">
                        {selectedEventData.capacity.current.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Ingresados</div>
                    </div>
                    <div className="bg-[#233748] p-3 rounded-lg">
                      <div className="text-xl font-bold text-blue-400">
                        {selectedEventData.capacity.available.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">Disponibles</div>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-400">
                    Capacidad máxima: {selectedEventData.capacity.maximum.toLocaleString()}
                  </div>
                  
                  {/* Gráfico de Check-ins por Hora */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3">Check-ins por Hora</h4>
                    <div className="space-y-2">
                      {selectedEventData.checkInStats.checkInsPerHour.slice(0, 4).map((hourData, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-8">
                            {hourData._id.hour}:00
                          </span>
                          <div className="flex-1 bg-[#233748] rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ 
                                width: `${(hourData.count / Math.max(...selectedEventData.checkInStats.checkInsPerHour.map(h => h.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8">
                            {hourData.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actualizaciones en Tiempo Real */}
            <div className="bg-[#192734] rounded-lg border border-[#233748] p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Actividad Reciente
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {realtimeUpdates.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Esperando actividad...
                  </p>
                ) : (
                  realtimeUpdates.map((update, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#233748] rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{update.eventName}</div>
                        <div className="text-xs text-gray-400">
                          Check-in #{update.checkInsCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(update.timestamp).toLocaleTimeString('es-CL')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}