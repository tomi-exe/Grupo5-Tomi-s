"use client";

import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { QRCode } from "react-qrcode-logo";
import { X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Interfaz de Ticket
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
  qrCode: string;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTransferTicketId, setSelectedTransferTicketId] = useState<
    string | null
  >(null);
  const [transferTo, setTransferTo] = useState("");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchTickets = async () => {
      try {
        const start = Date.now();
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
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const toggleSale = async (id: string, currentlyForSale: boolean) => {
    const ticket = tickets.find((t) => t._id === id);
    if (ticket?.isUsed) {
      toast.error("❌ Este ticket no puede ser puesto a la venta.");
      return;
    }

    const url = `/api/resale/tickets/${id}`;
    const body = { forSale: !currentlyForSale };

    const res = await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
                <h2 className="text-lg font-semibold">{ticket.eventName}</h2>
                <p className="text-sm text-gray-400">
                  Precio: ${ticket.price} — Fecha:{" "}
                  {ticket.eventDate
                    ? new Date(ticket.eventDate).toLocaleString("es-CL")
                    : "Fecha inválida"}
                </p>
                {/* Mostrar fecha de transferencia si existe */}
                {ticket.transferDate && (
                  <p className="text-xs text-purple-300 mt-1">
                    Transferido el:{" "}
                    {new Date(ticket.transferDate).toLocaleString("es-CL")}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={() => toggleSale(ticket._id, ticket.forSale)}
                  className={`px-4 py-2 rounded ${
                    ticket.forSale
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white transition w-full sm:w-auto`}
                >
                  {ticket.forSale ? "Retirar de venta" : "Poner a la venta"}
                </button>

                <button
                  onClick={() => setSelectedTransferTicketId(ticket._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
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
                  <button
                    onClick={handleTransfer}
                    className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded w-full"
                  >
                    Confirmar transferencia
                  </button>
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
                value={selectedTicket.qrCode}
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
