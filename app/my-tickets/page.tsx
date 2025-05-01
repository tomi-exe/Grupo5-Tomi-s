"use client";

import { useEffect, useState } from "react";
import Loading from "../Components/Loading";
import { QRCode } from "react-qrcode-logo";
import { X } from "lucide-react";

interface Ticket {
  _id: string;
  event: string;
  price: number;
  disp: number;
  userId: string;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchTickets = async () => {
      try {
        const start = Date.now();
        const res = await fetch("/api/tickets", { method: "GET" });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          console.error("Error al obtener tickets:", text);
          timeoutId = setTimeout(
            () => setLoading(false),
            Math.max(0, 2000 - (Date.now() - start))
          );
          return;
        }

        const data = await res.json();
        setTickets(data.tickets);
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
              className="bg-[#192833] p-4 rounded mb-4 cursor-pointer hover:bg-[#223344] transition-colors"
              onClick={() => setSelectedTicket(ticket)}
            >
              <h2 className="text-lg font-semibold">{ticket.event}</h2>
              <p>Precio: ${ticket.price}</p>
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
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center">
              QR para {selectedTicket.event}
            </h2>
            <div className="flex justify-center mb-4">
              <QRCode
                value={JSON.stringify(selectedTicket)}
                size={200}
                qrStyle="dots"
                logoImage="https://example.com/logo.png" // Cambia por tu logo real si quieres
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
