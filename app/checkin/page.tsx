"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, MapPin, User, Clock, Check, Smartphone, Wifi, QrCode, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Loading from '../Components/Loading';

// Simulamos datos adicionales del usuario (esto vendría de la sesión/API)
const mockUserData = {
  userName: "Juan Carlos Pérez",
  userEmail: "juan.perez@email.com",
  ticketType: "General",
  seatSection: "Sector A",
  seatRow: "Fila 12",
  seatNumber: "Asiento 15",
};

export default function CheckInPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ticketData, setTicketData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar datos del ticket desde URL
  useEffect(() => {
    const ticketId = searchParams.get('ticketId');
    const eventName = searchParams.get('eventName');
    const eventDate = searchParams.get('eventDate');
    const price = searchParams.get('price');

    if (!ticketId || !eventName || !eventDate || !price) {
      // Si no hay parámetros, redirigir a mis tickets
      router.push('/my-tickets');
      return;
    }

    // Construir objeto de ticket con datos de URL + mock data
    const ticket = {
      id: ticketId,
      eventName: decodeURIComponent(eventName),
      eventDate: eventDate,
      eventLocation: "Estadio Nacional, Santiago", // Esto podría venir de una API
      price: parseInt(price),
      ...mockUserData,
      checkInStatus: false
    };

    setTicketData(ticket);
    setPageLoading(false);
  }, [searchParams, router]);

  // Generar datos para el QR
  const qrData = ticketData ? JSON.stringify({
    ticketId: ticketData.id,
    eventName: ticketData.eventName,
    userName: ticketData.userName,
    eventDate: ticketData.eventDate,
    location: ticketData.eventLocation,
    checkInTime: currentTime.toISOString(),
    signature: "TZ_VERIFIED_" + ticketData.id
  }) : "";

  const handleCheckIn = async () => {
    setIsLoading(true);
    
    try {
      // Aquí podrías hacer una llamada a tu API de check-in
      // const response = await fetch('/api/checkin', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ticketId: ticketData.id })
      // });
      
      // Simular proceso de check-in
      setTimeout(() => {
        setIsCheckedIn(true);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error en check-in:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (pageLoading) {
    return <Loading text="Cargando check-in..." />;
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-[#111a22] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar ticket</h1>
          <p className="text-gray-400 mb-4">No se encontraron datos del ticket</p>
          <button
            onClick={() => router.push('/my-tickets')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Volver a Mis Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111a22] via-[#1a2332] to-[#0f1419] text-white">
      {/* Header */}
      <div className="bg-[#192734]/80 backdrop-blur-md border-b border-[#233748]">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/my-tickets')}
                className="p-2 hover:bg-[#233748] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">🎫</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">TicketZone Check-in</h1>
                <p className="text-sm text-gray-400">Verificación de entrada</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Hora actual</div>
              <div className="text-lg font-mono">
                {currentTime.toLocaleTimeString('es-CL')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Información del Evento y Usuario */}
          <div className="space-y-6">
            
            {/* Tarjeta del Evento */}
            <div className="bg-[#192734] rounded-2xl p-6 border border-[#233748] shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                  🎵
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{ticketData.eventName}</h2>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(ticketData.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(ticketData.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{ticketData.eventLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Estado del Check-in */}
              {isCheckedIn ? (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-400">Check-in Completado</div>
                      <div className="text-sm text-green-300">
                        {currentTime.toLocaleString('es-CL')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando Check-in...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Realizar Check-in
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Información del Usuario */}
            <div className="bg-[#192734] rounded-2xl p-6 border border-[#233748] shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Usuario
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#233748] last:border-b-0">
                  <span className="text-gray-400">Nombre:</span>
                  <span className="font-medium">{ticketData.userName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#233748] last:border-b-0">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-medium text-sm">{ticketData.userEmail}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#233748] last:border-b-0">
                  <span className="text-gray-400">Tipo de Ticket:</span>
                  <span className="font-medium text-purple-400">{ticketData.ticketType}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">ID del Ticket:</span>
                  <span className="font-mono text-sm">{ticketData.id}</span>
                </div>
              </div>
            </div>

            {/* Información del Asiento */}
            <div className="bg-[#192734] rounded-2xl p-6 border border-[#233748] shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Detalles del Asiento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-[#233748] rounded-lg">
                  <div className="text-sm text-gray-400">Sector</div>
                  <div className="text-lg font-bold">{ticketData.seatSection}</div>
                </div>
                <div className="text-center p-3 bg-[#233748] rounded-lg">
                  <div className="text-sm text-gray-400">Precio</div>
                  <div className="text-lg font-bold">${ticketData.price.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Código QR y Panel de Verificación */}
          <div className="space-y-6">
            
            {/* Código QR Principal */}
            <div className="bg-[#192734] rounded-2xl p-8 border border-[#233748] shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Código QR de Verificación</h3>
                <p className="text-sm text-gray-400">
                  Presenta este código al personal de seguridad
                </p>
              </div>
              
              <div className="flex justify-center mb-6">
                {/* QR Code Placeholder */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="w-[200px] h-[200px] bg-gray-900 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Patrón de QR simulado */}
                    <div className="absolute inset-2 grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }, (_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Logo central */}
                    <div className="bg-white rounded-full p-2 z-10 shadow-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    {/* Esquinas características del QR */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-4 border-black bg-white"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-4 border-black bg-white"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-4 border-black bg-white"></div>
                  </div>
                </div>
              </div>

              {isCheckedIn && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
                    <Check className="w-4 h-4" />
                    Código Verificado
                  </div>
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div className="bg-[#192734] rounded-2xl p-6 border border-[#233748] shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Instrucciones de Check-in
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <p>Asegúrate de tener el brillo de tu pantalla al máximo</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <p>Presenta este código QR al personal de seguridad en la entrada</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <p>Ten tu identificación personal lista para verificar tu identidad</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                  <p>Sigue las indicaciones del personal para dirigirte a tu sector</p>
                </div>
              </div>
            </div>

            {/* Estado de Conexión */}
            <div className="bg-[#192734] rounded-2xl p-4 border border-[#233748] shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Estado de Conexión</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Conectado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-8 bg-[#192734] rounded-2xl p-6 border border-[#233748] shadow-lg">
          <div className="text-center text-sm text-gray-400">
            <p className="mb-2">
              ⚠️ <strong>Importante:</strong> Este código QR es único y personal. No lo compartas con terceros.
            </p>
            <p>
              Para soporte técnico, contacta al personal de TicketZone en el evento o envía un email a soporte@ticketzone.cl
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}