// File: app/resale-market/page.tsx
"use client";

import React, { useState, useEffect } from "react"; // React y hooks básicos
import { format } from "date-fns"; // Formateo de fechas
import { motion } from "framer-motion"; // Animaciones

// Define la interfaz para los tickets
interface Ticket {
  _id: string;
  eventName: string;
  eventDate: string;
  price: number;
}

export default function ResaleMarketPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch manual sin SWR
  useEffect(() => {
    fetch("/api/resale/tickets")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los datos");
        return res.json();
      })
      .then((data) => setTickets(data.tickets))
      .catch((err) => setError(err.message));
  }, []);

  // Mostrar error
  if (error) {
    return (
      <p className="text-center py-10 text-red-500">
        Error al cargar los datos de reventa.
      </p>
    );
  }

  // Indicador de carga
  if (!tickets) {
    return (
      <p className="text-center py-10 text-gray-400">
        Cargando entradas para reventa...
      </p>
    );
  }

  // Renderizado de tickets
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Mercado de Reventa</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <motion.div
            key={ticket._id} // Usa _id de Mongo
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tarjeta básica con Tailwind */}
            <div className="rounded-2xl bg-[#1f2937] p-4 shadow-sm hover:shadow-lg transition-shadow">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-white">
                  {ticket.eventName}
                </h2>
                <p className="text-sm text-gray-400">
                  {format(new Date(ticket.eventDate), "dd MMM yyyy")}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xl font-medium mb-4 text-white">
                  Precio: ${ticket.price}
                </p>
                <div className="flex justify-end">
                  <button className="rounded-xl bg-[#3b4856] px-3 py-1 text-sm font-medium text-white hover:bg-[#4f5b6a] focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
