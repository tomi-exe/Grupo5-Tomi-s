"use client";

import React from "react"; // React es necesario para JSX.
import useSWR from "swr"; // SWR para obtener y cachear datos de manera eficiente.
import { format } from "date-fns"; // Función para formatear fechas.
import { motion } from "framer-motion"; // Para animaciones.

// Función fetcher que SWR usará para solicitar datos a la API.
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ResaleMarketPage() {
  // SWR realiza GET a /api/resale/tickets, maneja estado de carga y errores.
  const { data, error } = useSWR("/api/resale/tickets", fetcher);

  // Mostrar error si la petición falla.
  if (error) {
    return (
      <p className="text-center py-10 text-red-500">
        Error al cargar los datos de reventa.
      </p>
    );
  }

  // Mostrar indicador de carga mientras espera la respuesta.
  if (!data) {
    return (
      <p className="text-center py-10 text-gray-400">
        Cargando entradas para reventa...
      </p>
    );
  }

  // Al tener data, renderizamos la lista de tickets.
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Título principal */}
      <h1 className="text-3xl font-bold mb-6 text-white">Mercado de Reventa</h1>

      {/* Grid responsive: 1 columna móvil, 2 tablet, 3 desktop */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data.tickets.map((ticket: any) => (
          <motion.div
            key={ticket.id} // clave única por ticket
            initial={{ opacity: 0, y: 20 }} // estado inicial animación
            animate={{ opacity: 1, y: 0 }} // estado final
            transition={{ duration: 0.3 }} // duración animación
          >
            {/* Card usando divs y clases de Tailwind */}
            <div className="rounded-2xl bg-[#1f2937] p-4 shadow-sm hover:shadow-lg transition-shadow">
              {/* Encabezado de la tarjeta */}
              <div className="mb-2">
                {/* Nombre del evento */}
                <h2 className="text-lg font-semibold text-white">
                  {ticket.eventName}
                </h2>
                {/* Fecha formateada */}
                <p className="text-sm text-gray-400">
                  {format(new Date(ticket.eventDate), "dd MMM yyyy")}
                </p>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="mt-2">
                {/* Precio */}
                <p className="text-xl font-medium mb-4 text-white">
                  Precio: ${ticket.price}
                </p>
                {/* Botón de detalles */}
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
