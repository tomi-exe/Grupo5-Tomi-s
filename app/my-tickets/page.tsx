"use client";

import { useEffect, useState } from "react";
import Loading from "../Components/Loading"; // Make sure this path is correct

export default function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          // Wait for 2 seconds before hiding loading
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
        // Ensure loading lasts at least 2 seconds
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
            <div key={ticket._id} className="bg-[#192833] p-4 rounded mb-4">
              <h2 className="text-lg font-semibold">{ticket.event}</h2>
              <p>Precio: ${ticket.price}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
