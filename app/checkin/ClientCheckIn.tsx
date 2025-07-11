// app/checkin/ClientCheckIn.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Check,
  Smartphone,
  Wifi,
  QrCode,
  ArrowLeft,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import Loading from "../Components/Loading";
import { useToast } from "../Components/Toast";

// Datos simulados del usuario (esto vendría de la sesión/API)
const mockUserData = {
  userName: "Juan Carlos Pérez",
  userEmail: "juan.perez@email.com",
  ticketType: "General",
  seatSection: "Sector A",
  seatRow: "Fila 12",
  seatNumber: "Asiento 15",
};

interface CapacityInfo {
  maximum: number;
  current: number;
  available: number;
  occupancyPercentage: number;
  isFull: boolean;
}

interface CheckInValidation {
  eligible: boolean;
  reason: string;
}

export default function ClientCheckIn() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ticketData, setTicketData] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [capacityInfo, setCapacityInfo] = useState<CapacityInfo | null>(null);
  const [validation, setValidation] = useState<CheckInValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const addToast = useToast();

  // Actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar datos del ticket desde URL
  useEffect(() => {
    const ticketId = searchParams.get("ticketId");
    const eventName = searchParams.get("eventName");
    const eventDate = searchParams.get("eventDate");
    const price = searchParams.get("price");

    if (!ticketId || !eventName || !eventDate || !price) {
      router.push("/my-tickets");
      return;
    }

    const ticket = {
      id: ticketId,
      eventName: decodeURIComponent(eventName),
      eventDate,
      eventLocation: "Estadio Nacional, Santiago",
      price: parseInt(price, 10),
      ...mockUserData,
      checkInStatus: false,
    };

    setTicketData(ticket);
    setPageLoading(false);
    loadCapacityAndValidation(eventName, ticketId);
  }, [searchParams, router]);

  const loadCapacityAndValidation = async (
    eventName: string,
    ticketId: string
  ) => {
    setIsValidating(true);
    try {
      const capRes = await fetch(
        `/api/events/capacity?eventName=${encodeURIComponent(eventName)}`
      );
      if (capRes.ok) {
        const { capacity } = await capRes.json();
        setCapacityInfo(capacity);
      }
      const valRes = await fetch(`/api/checkin?ticketId=${ticketId}`);
      if (valRes.ok) {
        const valData = await valRes.json();
        setValidation(valData);
      }
    } catch (err) {
      console.error("Error cargando info:", err);
      addToast("Error al verificar la información del evento", "error");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckIn = async () => {
    if (!validation?.eligible) {
      addToast(validation?.reason || "No se puede realizar check-in", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticketData.id,
          verificationMethod: "qr_scan",
          notes: "Check-in desde aplicación web",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsCheckedIn(true);
        setCapacityInfo(data.checkIn.capacityInfo);
        addToast("¡Check-in realizado exitosamente!", "success");
      } else {
        addToast(data.message || "Error realizando check-in", "error");
        await loadCapacityAndValidation(ticketData.eventName, ticketData.id);
      }
    } catch (err) {
      console.error("Error en check-in:", err);
      addToast("Error de conexión. Intenta nuevamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getCapacityColor = (pct: number) => {
    if (pct >= 95) return "text-red-400 bg-red-500/20 border-red-500/50";
    if (pct >= 80)
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/50";
    if (pct >= 60)
      return "text-orange-400 bg-orange-500/20 border-orange-500/50";
    return "text-green-400 bg-green-500/20 border-green-500/50";
  };

  const getValidationColor = (eligible: boolean) =>
    eligible
      ? "text-green-400 bg-green-500/20 border-green-500/50"
      : "text-red-400 bg-red-500/20 border-red-500/50";

  if (pageLoading) return <Loading text="Cargando check-in..." />;
  if (!ticketData) {
    return (
      <div className="min-h-screen bg-[#111a22] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar ticket</h1>
          <p className="text-gray-400 mb-4">
            No se encontraron datos del ticket
          </p>
          <button
            onClick={() => router.push("/my-tickets")}
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
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/my-tickets")}
              className="p-2 hover:bg-[#233748] rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              🎫
            </div>
            <div>
              <h1 className="text-2xl font-bold">TicketZone Check-in</h1>
              <p className="text-sm text-gray-400">
                Verificación de entrada con control de aforo
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Hora actual</div>
            <div className="text-lg font-mono">
              {currentTime.toLocaleTimeString("es-CL")}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* Lado izquierdo */}
        <div className="space-y-6">
          {/* Tarjeta del Evento */}
          <div className="bg-[#192734] rounded-2xl p-6 border border-[#233748] shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                🎵
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">
                  {ticketData.eventName}
                </h2>
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

            {capacityInfo && (
              <div
                className={`p-4 rounded-lg border mb-4 ${getCapacityColor(
                  capacityInfo.occupancyPercentage
                )}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Aforo del Evento</span>
                  </div>
                  <span className="text-sm font-medium">
                    {capacityInfo.occupancyPercentage}% ocupado
                  </span>
                </div>
                <div className="text-sm">
                  {capacityInfo.current} / {capacityInfo.maximum} personas
                </div>
                <div className="text-xs mt-1">
                  {capacityInfo.available} espacios disponibles
                </div>
                {capacityInfo.isFull && (
                  <div className="flex items-center gap-2 mt-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Evento lleno</span>
                  </div>
                )}
              </div>
            )}

            {validation && (
              <div
                className={`p-4 rounded-lg border mb-4 ${getValidationColor(
                  validation.eligible
                )}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {validation.eligible ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {validation.eligible
                      ? "Apto para Check-in"
                      : "No Apto para Check-in"}
                  </span>
                </div>
                <div className="text-xs">{validation.reason}</div>
              </div>
            )}

            {isCheckedIn ? (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-400">
                      Check-in Completado
                    </div>
                    <div className="text-sm text-green-300">
                      {currentTime.toLocaleString("es-CL")}
                    </div>
                    {capacityInfo && (
                      <div className="text-xs text-green-300 mt-1">
                        Aforo actualizado: {capacityInfo.current}/
                        {capacityInfo.maximum}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={isLoading || isValidating || !validation?.eligible}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading || isValidating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : validation?.eligible ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                {isLoading
                  ? "Procesando Check-in..."
                  : isValidating
                  ? "Validando..."
                  : validation?.eligible
                  ? "Realizar Check-in"
                  : "Check-in No Disponible"}
              </button>
            )}
          </div>

          {/* ... (el resto de la UI del lado izquierdo como Información del Usuario y Asiento) ... */}
        </div>

        {/* Lado derecho: QR y panel */}
        <div className="space-y-6">
          {/* Código QR */}
          <div className="bg-[#192734] rounded-2xl p-8 border border-[#233748] shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2">
              Código QR de Verificación
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Presenta este código al personal de seguridad
            </p>
            <div className="bg-white p-6 rounded-2xl shadow-lg inline-block">
              <div className="w-[200px] h-[200px] bg-gray-900 rounded-lg overflow-hidden relative">
                {/* Simulación de QR */}
                <div className="absolute inset-2 grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }, (_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        Math.random() > 0.5 ? "bg-black" : "bg-white"
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <QrCode className="w-8 h-8 text-gray-900" />
                  </div>
                </div>
              </div>
            </div>
            {isCheckedIn && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
                <Check className="w-4 h-4" /> Código Verificado
              </div>
            )}
          </div>

          {/* ... (instrucciones, estado de conexión, etc.) ... */}
        </div>
      </div>
    </div>
  );
}
