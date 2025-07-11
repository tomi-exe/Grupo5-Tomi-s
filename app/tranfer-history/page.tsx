"use client";

import { useEffect, useState } from "react";
import { ArrowRightLeft, Calendar, User, TrendingUp, Download } from "lucide-react";
import Loading from "../Components/Loading";

interface Transfer {
  _id: string;
  ticketId: {
    _id: string;
    eventName: string;
    eventDate: string;
  };
  previousOwnerId: {
    _id: string;
    name: string;
    email: string;
  };
  newOwnerId: {
    _id: string;
    name: string;
    email: string;
  };
  transferType: string;
  transferPrice?: number;
  transferDate: string;
  notes?: string;
  status: string;
}

export default function TransferHistoryPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await fetch("/api/transfers");
      const data = await response.json();

      if (response.ok) {
        setTransfers(data.transfers);
      } else {
        console.error("Error fetching transfers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTransferType = (type: string) => {
    const types: { [key: string]: string } = {
      direct_transfer: "Transferencia Directa",
      resale_purchase: "Compra de Reventa",
      admin_transfer: "Transferencia Admin",
    };
    return types[type] || type;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  const getCurrentUserId = () => {
    // En una implementación real, esto vendría del contexto de usuario o sesión
    // Por ahora, lo extraemos del primer transfer disponible
    return transfers.length > 0 ? transfers[0].newOwnerId._id : "";
  };

  const filteredTransfers = transfers.filter((transfer) => {
    const currentUserId = getCurrentUserId();
    
    if (filter === "sent") {
      return transfer.previousOwnerId._id === currentUserId;
    } else if (filter === "received") {
      return transfer.newOwnerId._id === currentUserId;
    }
    return true; // "all"
  });

  const getTransferDirection = (transfer: Transfer) => {
    const currentUserId = getCurrentUserId();
    return transfer.newOwnerId._id === currentUserId ? "received" : "sent";
  };

  if (loading) return <Loading text="Cargando historial de transferencias..." />;

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8" />
            Historial de Transferencias
          </h1>
          <p className="text-gray-400 mt-2">
            Registro completo de todas las transferencias de tus tickets
          </p>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#192734] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-400">Total Transferencias</span>
            </div>
            <p className="text-2xl font-bold">{transfers.length}</p>
          </div>
          <div className="bg-[#192734] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-400">Recibidas</span>
            </div>
            <p className="text-2xl font-bold">
              {transfers.filter(t => getTransferDirection(t) === "received").length}
            </p>
          </div>
          <div className="bg-[#192734] p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-400">Enviadas</span>
            </div>
            <p className="text-2xl font-bold">
              {transfers.filter(t => getTransferDirection(t) === "sent").length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-[#192734] p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Filtrar transferencias</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-[#233748] text-gray-300 hover:bg-[#2c3e50]"
              }`}
            >
              Todas ({transfers.length})
            </button>
            <button
              onClick={() => setFilter("received")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "received"
                  ? "bg-green-600 text-white"
                  : "bg-[#233748] text-gray-300 hover:bg-[#2c3e50]"
              }`}
            >
              Recibidas ({transfers.filter(t => getTransferDirection(t) === "received").length})
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-4 py-2 rounded-lg transition ${
                filter === "sent"
                  ? "bg-red-600 text-white"
                  : "bg-[#233748] text-gray-300 hover:bg-[#2c3e50]"
              }`}
            >
              Enviadas ({transfers.filter(t => getTransferDirection(t) === "sent").length})
            </button>
          </div>
        </div>

        {/* Lista de Transferencias */}
        <div className="space-y-4">
          {filteredTransfers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ArrowRightLeft className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No hay transferencias que mostrar</p>
              <p className="text-sm">
                {filter === "all" 
                  ? "Aún no has realizado ninguna transferencia"
                  : filter === "sent"
                  ? "No has enviado ninguna transferencia"
                  : "No has recibido ninguna transferencia"
                }
              </p>
            </div>
          ) : (
            filteredTransfers.map((transfer) => {
              const direction = getTransferDirection(transfer);
              const isReceived = direction === "received";
              
              return (
                <div
                  key={transfer._id}
                  className={`bg-[#192734] p-6 rounded-lg border-l-4 ${
                    isReceived ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        isReceived ? "bg-green-500/20" : "bg-red-500/20"
                      }`}>
                        <ArrowRightLeft className={`w-5 h-5 ${
                          isReceived ? "text-green-400" : "text-red-400"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {transfer.ticketId.eventName}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(transfer.ticketId.eventDate).toLocaleDateString("es-CL")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transfer.transferType === "direct_transfer"
                          ? "bg-blue-500/20 text-blue-400"
                          : transfer.transferType === "resale_purchase"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {formatTransferType(transfer.transferType)}
                      </span>
                      {transfer.transferPrice && (
                        <p className="text-lg font-bold mt-1">
                          {formatPrice(transfer.transferPrice)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        {isReceived ? "Recibido de:" : "Enviado a:"}
                      </p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {isReceived 
                              ? transfer.previousOwnerId.name 
                              : transfer.newOwnerId.name
                            }
                          </p>
                          <p className="text-xs text-gray-400">
                            {isReceived 
                              ? transfer.previousOwnerId.email 
                              : transfer.newOwnerId.email
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Fecha de transferencia:</p>
                      <p className="font-medium">
                        {new Date(transfer.transferDate).toLocaleString("es-CL")}
                      </p>
                    </div>
                  </div>

                  {transfer.notes && (
                    <div className="bg-[#233748] p-3 rounded">
                      <p className="text-sm text-gray-300">{transfer.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      transfer.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : transfer.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {transfer.status.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-400">
                      ID: {transfer._id.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}