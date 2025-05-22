"use client";

import { useEffect, useState } from "react";
import Loading from "../Components/Loading";
import { QRCode } from "react-qrcode-logo";
import { X } from "lucide-react";

// Incluimos forSale en la interfaz
interface Ticket {
  _id: string;
  eventName: string;
  eventDate: string;
  price: number;
  disp: number;
  userId: string;
  forSale: boolean;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Carga tus tickets (incluye forSale)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchTickets = async () => {
      try {
        const start = Date.now();
        const res = await fetch("/api/tickets", {
          method: "GET",
          credentials: "include", // envía cookies de sesión
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          console.error("Error al obtener tickets:", await res.text());
          timeoutId = setTimeout(
            () => setLoading(false),
            Math.max(0, 2000 - (Date.now() - start))
          );
          return;
        }

        const { tickets } = await res.json();
        setTickets(tickets);
      } catch (err) {
        console.error("Error inesperado:", err);
      } finally {
        timeoutId = setTimeout(() => setLoading(false), 2000);
      }
    };

    fetchTickets();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Función para alternar forSale con logging para depurar
  const toggleSale = async (id: string, currentlyForSale: boolean) => {
    const url = `/api/tickets/${id}`;
    const body = { forSale: !currentlyForSale };
    console.log("📡 PUT a:", url, "con body:", body);

    const res = await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      alert("No se pudo actualizar la venta");
      return;
    }
    const { ticket: updated } = await res.json();
    setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  if (loading) {
    return <Loading text="Cargando tus tickets..." />;
  }

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
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
                  {new Date(ticket.eventDate).toLocaleString("es-CL")}
                </p>
              </div>

              {/* Botón para poner/retirar de venta */}
              <button
                onClick={() => toggleSale(ticket._id, ticket.forSale)}
                className={`mt-2 px-4 py-2 rounded ${
                  ticket.forSale
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white transition`}
              >
                {ticket.forSale ? "Retirar de venta" : "Poner a la venta"}
              </button>
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
                value={JSON.stringify(selectedTicket)}
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
