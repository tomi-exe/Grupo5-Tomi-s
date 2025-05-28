"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Ticket {
  _id: string;
  eventName: string;
  eventDate: string;
  price: number;
  disp: number;
  userId: string;
  forSale?: boolean;
  transferDate?: string | null;
}

export default function ResaleMarketPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/resale/tickets");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar");
        setTickets(data.tickets);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, []);

  const handleBuy = (ticket: Ticket) => {
    window.location.href =
      `/payment?ticketId=${ticket._id}` +
      `&eventName=${encodeURIComponent(ticket.eventName)}` +
      `&eventDate=${encodeURIComponent(ticket.eventDate)}` +
      `&price=${ticket.price}` +
      `&disp=${ticket.disp}` +
      `&userId=${ticket.userId}`;
  };

  if (error) {
    return (
      <p className="text-center py-10 text-red-500">
        Error al cargar los datos de reventa.
      </p>
    );
  }
  if (!tickets) {
    return (
      <p className="text-center py-10 text-gray-400">
        Cargando entradas para reventa...
      </p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Mercado de Reventa</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <motion.div
            key={ticket._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
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
                <div className="flex justify-end gap-2">
                  <button
                    className="rounded-xl bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleBuy(ticket)}
                  >
                    Comprar
                  </button>
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
