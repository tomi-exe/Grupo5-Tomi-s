"use client";

import { useEffect, useState } from "react";
import { Search, Download, Calendar, Filter, Users, TrendingUp } from "lucide-react";
import Loading from "@/app/Components/Loading";

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
  ipAddress?: string;
  notes?: string;
  status: string;
}

interface TransferStats {
  totalTransfers: number;
  directTransfers: number;
  resaleTransfers: number;
  adminTransfers: number;
  totalResaleValue: number;
  averageResalePrice: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function AdminTransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<TransferStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    transferType: "",
    startDate: "",
    endDate: "",
    userId: "",
  });

  useEffect(() => {
    fetchTransfers();
    fetchStats();
  }, [currentPage, filters]);

  const fetchTransfers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...filters,
      });

      const response = await fetch(`/api/admin/transfers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransfers(data.transfers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const exportTransfers = async () => {
    try {
      // Implementar exportación a CSV/Excel
      alert("Función de exportación en desarrollo");
    } catch (error) {
      console.error("Error exporting transfers:", error);
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

  if (loading) return <Loading text="Cargando historial de transferencias..." />;

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Historial de Transferencias</h1>
            <p className="text-gray-400 mt-2">
              Auditoría completa de todas las transferencias de tickets
            </p>
          </div>
          <button
            onClick={exportTransfers}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTransfers}</p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-400">Directas</span>
              </div>
              <p className="text-2xl font-bold">{stats.directTransfers}</p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-400">Reventas</span>
              </div>
              <p className="text-2xl font-bold">{stats.resaleTransfers}</p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-400">Admin</span>
              </div>
              <p className="text-2xl font-bold">{stats.adminTransfers}</p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-400">Valor Total</span>
              </div>
              <p className="text-lg font-bold">
                {formatPrice(stats.totalResaleValue)}
              </p>
            </div>
            <div className="bg-[#192734] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-400">Precio Prom.</span>
              </div>
              <p className="text-lg font-bold">
                {formatPrice(stats.averageResalePrice || 0)}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-[#192734] p-6 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Tipo de Transferencia
              </label>
              <select
                value={filters.transferType}
                onChange={(e) =>
                  setFilters({ ...filters, transferType: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white"
              >
                <option value="">Todos</option>
                <option value="direct_transfer">Transferencia Directa</option>
                <option value="resale_purchase">Compra de Reventa</option>
                <option value="admin_transfer">Transferencia Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                ID de Usuario
              </label>
              <input
                type="text"
                placeholder="Buscar por ID..."
                value={filters.userId}
                onChange={(e) =>
                  setFilters({ ...filters, userId: e.target.value })
                }
                className="w-full bg-[#0d1117] border border-[#233748] rounded px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Transferencias */}
        <div className="bg-[#192734] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#233748]">
                <tr>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Evento</th>
                  <th className="p-4 text-left">Propietario Anterior</th>
                  <th className="p-4 text-left">Nuevo Propietario</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Precio</th>
                  <th className="p-4 text-left">IP</th>
                  <th className="p-4 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <tr
                    key={transfer._id}
                    className="border-t border-[#233748] hover:bg-[#233748] transition"
                  >
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(transfer.transferDate).toLocaleString("es-CL")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        {transfer.ticketId.eventName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transfer.ticketId.eventDate).toLocaleDateString("es-CL")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        {transfer.previousOwnerId.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {transfer.previousOwnerId.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        {transfer.newOwnerId.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {transfer.newOwnerId.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transfer.transferType === "direct_transfer"
                          ? "bg-green-500/20 text-green-400"
                          : transfer.transferType === "resale_purchase"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}>
                        {formatTransferType(transfer.transferType)}
                      </span>
                    </td>
                    <td className="p-4">
                      {transfer.transferPrice
                        ? formatPrice(transfer.transferPrice)
                        : "-"}
                    </td>
                    <td className="p-4 text-xs text-gray-400">
                      {transfer.ipAddress || "-"}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transfer.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : transfer.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {transfer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination && (
            <div className="p-4 border-t border-[#233748] flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{" "}
                {pagination.totalItems} transferencias
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 bg-[#233748] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2c3e50] transition"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 bg-blue-600 rounded">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 bg-[#233748] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2c3e50] transition"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje cuando no hay transferencias */}
        {transfers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No se encontraron transferencias</p>
            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}