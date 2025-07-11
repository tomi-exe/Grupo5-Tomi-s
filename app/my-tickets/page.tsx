// File: app/my-tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../Components/Loading";
import { QRCode } from "react-qrcode-logo";
import { X, LogIn, Calendar } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Interfaz de Ticket con el JWT en qrToken
interface Ticket {
  _id: string;
  eventName: string;
  eventDate: string;
  price: number;
  disp: number;
  userId: string;
  forSale: boolean;
  isUsed: boolean;
  transferDate?: string | null;
  qrToken: string; // ← nuevo campo
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTransferTicketId, setSelectedTransferTicketId] = useState<
    string | null
  >(null);
  const [transferTo, setTransferTo] = useState("");
  const router = useRouter();

  // Fetch tickets (asegúrate de que tu API devuelva qrCode renombrado a qrToken)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/tickets", {
          method: "GET",
          credentials: "include",
        });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const { tickets } = await res.json();
        setTickets(tickets);
      } catch (err) {
        console.error("Error inesperado:", err);
        toast.error("❌ Error al cargar los tickets.");
      } finally {
        timeoutId = setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchTickets();
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleSale = async (id: string, currentlyForSale: boolean) => {
    const ticket = tickets.find((t) => t._id === id);
    if (ticket?.isUsed) {
      toast.error("❌ Este ticket no puede ser puesto a la venta.");
      return;
    }
    const res = await fetch(`/api/resale/tickets/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forSale: !currentlyForSale }),
    });
    if (!res.ok) {
      toast.error("❌ No se pudo actualizar la venta");
      return;
    }
    const { ticket: updated } = await res.json();
    setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
    toast.success(
      `✅ Ticket ${
        !currentlyForSale ? "puesto a la venta" : "retirado del mercado"
      }`
    );
  };

  const handleTransfer = async () => {
    if (!selectedTransferTicketId || !transferTo) {
      toast.error("Debes ingresar un ID válido");
      return;
    }
    const res = await fetch("/api/tickets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ticketId: selectedTransferTicketId,
        newUserId: transferTo,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(`❌ Error al transferir: ${data.message}`);
      return;
    }
    toast.success("✅ Ticket transferido con éxito");
    setTickets((prev) =>
      prev.filter((t) => t._id !== selectedTransferTicketId)
    );
    setSelectedTransferTicketId(null);
    setTransferTo("");
  };

  const handleCheckIn = (ticket: Ticket) => {
    router.push(`/checkin?token=${encodeURIComponent(ticket.qrToken)}`);
  };

  const isEventToday = (eventDate: string) => {
    const today = new Date();
    const event = new Date(eventDate);
    return (
      today.getDate() === event.getDate() &&
      today.getMonth() === event.getMonth() &&
      today.getFullYear() === event.getFullYear()
    );
  };
  const isEventUpcoming = (eventDate: string) =>
    new Date(eventDate) > new Date();

  if (loading) return <Loading text="Cargando tus tickets..." />;

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Mis Tickets</h1>
        {tickets.length === 0 ? (
          <p className="text-center text-[#92b0c9]">
            No has comprado tickets aún.
          </p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-[#192833] p-4 rounded mb-4 group"
            >
              <div
                className="cursor-pointer hover:bg-[#223344] transition-colors p-3 rounded"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold">{ticket.eventName}</h2>
                  {isEventToday(ticket.eventDate) && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                      Hoy
                    </span>
                  )}
                  {ticket.isUsed && (
                    <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs font-medium">
                      Usado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(ticket.eventDate).toLocaleString("es-CL")}
                    </span>
                  </div>
                  <span className="text-white font-medium">
                    ${ticket.price}
                  </span>
                </div>
                {ticket.transferDate && (
                  <p className="text-xs text-purple-300 mt-1">
                    Transferido el:{" "}
                    {new Date(ticket.transferDate).toLocaleString("es-CL")}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                {(isEventToday(ticket.eventDate) ||
                  isEventUpcoming(ticket.eventDate)) &&
                  !ticket.isUsed && (
                    <button
                      onClick={() => handleCheckIn(ticket)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition w-full sm:w-auto font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      {isEventToday(ticket.eventDate)
                        ? "Check-in Hoy"
                        : "Pre Check-in"}
                    </button>
                  )}
                <button
                  onClick={() => toggleSale(ticket._id, ticket.forSale)}
                  disabled={ticket.isUsed}
                  className={`px-4 py-2 rounded transition w-full sm:w-auto ${
                    ticket.isUsed
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : ticket.forSale
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {ticket.isUsed
                    ? "Ticket Usado"
                    : ticket.forSale
                    ? "Retirar de venta"
                    : "Poner a la venta"}
                </button>
                <button
                  onClick={() => setSelectedTransferTicketId(ticket._id)}
                  disabled={ticket.isUsed}
                  className={`px-4 py-2 rounded w-full sm:w-auto transition ${
                    ticket.isUsed
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  Transferir
                </button>
              </div>
              {selectedTransferTicketId === ticket._id && (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    placeholder="ID del nuevo dueño"
                    className="text-black px-3 py-1 rounded w-full"
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleTransfer}
                      className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded flex-1"
                    >
                      Confirmar transferencia
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTransferTicketId(null);
                        setTransferTo("");
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl p-6 shadow-xl relative max-w-md w-full">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-2 right-2 text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              QR para {selectedTicket.eventName}
            </h2>
            <div className="flex justify-center mb-4">
              <QRCode
                value={selectedTicket.qrToken}
                size={200}
                qrStyle="dots"
                logoImage="https://example.com/logo.png"
              />
            </div>
            <p className="text-center text-sm">
              Escanea este código QR para validar tu entrada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
