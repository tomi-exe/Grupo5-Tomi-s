"use client";

import { useEffect, useState } from "react";
import Loading from "../Components/Loading";

interface Ticket {
  _id: string;
  eventName: string; // Cambiado de 'event' a 'eventName'
  eventDate: string; // Puedes mostrar la fecha real del evento
  price: number;
  createdAt: string;
}

export default function PurchaseHistory() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchTickets = async () => {
      try {
        const start = Date.now();
        const res = await fetch("/api/tickets");

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        setTickets(data.tickets);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        timeoutId = setTimeout(() => setLoading(false), 1500);
      }
    };

    fetchTickets();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (loading) return <Loading text="Cargando historial de compras..." />;

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Historial de Compras
        </h1>

        {tickets.length === 0 ? (
          <p className="text-center text-[#92b0c9]">
            Aún no has realizado ninguna compra.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-[#192833] rounded shadow-md">
              <thead className="text-left bg-[#223344]">
                <tr>
                  <th className="p-3">Evento</th>
                  <th className="p-3">Precio</th>
                  <th className="p-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-t border-gray-600 hover:bg-[#2c3e50] transition-colors"
                  >
                    <td className="p-3">{ticket.eventName}</td>
                    <td className="p-3">${ticket.price}</td>
                    <td className="p-3">
                      {new Date(ticket.eventDate).toLocaleString("es-CL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
