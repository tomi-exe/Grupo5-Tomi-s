"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface EventItem {
  id: number;
  eventName: string;
  eventDate: string;
  price: number;
  disp: number;
  icon: string;
}

export default function Events() {
  const router = useRouter();

  // Lista de eventos con fecha incluida
  const allEvents: EventItem[] = [
    {
      id: 1,
      eventName: "Concierto Coldplay",
      eventDate: "2025-07-01T20:00:00.000Z",
      price: 20000,
      disp: 2000,
      icon: "🎤",
    },
    {
      id: 2,
      eventName: "Festival de Jazz",
      eventDate: "2025-08-15T18:00:00.000Z",
      price: 15000,
      disp: 2000,
      icon: "🎷",
    },
    {
      id: 3,
      eventName: "Stand-Up Comedy Show",
      eventDate: "2025-09-05T21:00:00.000Z",
      price: 12000,
      disp: 2000,
      icon: "🎭",
    },
    {
      id: 4,
      eventName: "Orquesta Sinfónica",
      eventDate: "2025-07-15T19:30:00.000Z",
      price: 25000,
      disp: 2000,
      icon: "🎻",
    },
    {
      id: 5,
      eventName: "Festival de Música Electrónica",
      eventDate: "2025-06-20T22:00:00.000Z",
      price: 30000,
      disp: 1500,
      icon: "🎧",
    },
    {
      id: 6,
      eventName: "Obra de Teatro Clásica",
      eventDate: "2025-10-01T18:00:00.000Z",
      price: 18000,
      disp: 800,
      icon: "🎭",
    },
    {
      id: 7,
      eventName: "Torneo de Videojuegos",
      eventDate: "2025-11-22T17:00:00.000Z",
      price: 10000,
      disp: 500,
      icon: "🎮",
    },
    {
      id: 8,
      eventName: "Charla Motivacional",
      eventDate: "2025-09-12T16:00:00.000Z",
      price: 8000,
      disp: 1000,
      icon: "🎤",
    },
    {
      id: 9,
      eventName: "Maratón de Cine",
      eventDate: "2025-12-05T14:00:00.000Z",
      price: 15000,
      disp: 700,
      icon: "🎬",
    },
    {
      id: 10,
      eventName: "Competencia de Baile",
      eventDate: "2025-07-20T20:00:00.000Z",
      price: 12000,
      disp: 900,
      icon: "💃",
    },
    {
      id: 11,
      eventName: "Exposición de Arte",
      eventDate: "2025-08-25T10:00:00.000Z",
      price: 7000,
      disp: 600,
      icon: "🖼️",
    },
    {
      id: 12,
      eventName: "Concierto de Rock",
      eventDate: "2025-09-30T21:30:00.000Z",
      price: 25000,
      disp: 2000,
      icon: "🎸",
    },
    {
      id: 13,
      eventName: "Conferencia de Tecnología",
      eventDate: "2025-10-10T09:00:00.000Z",
      price: 20000,
      disp: 1000,
      icon: "💻",
    },
    {
      id: 14,
      eventName: "Festival Gastronómico",
      eventDate: "2025-11-05T13:00:00.000Z",
      price: 10000,
      disp: 1200,
      icon: "🍴",
    },
    {
      id: 15,
      eventName: "Clase de Yoga en Vivo",
      eventDate: "2025-07-10T07:00:00.000Z",
      price: 5000,
      disp: 300,
      icon: "🧘",
    },
    {
      id: 16,
      eventName: "Taller de Fotografía",
      eventDate: "2025-08-18T11:00:00.000Z",
      price: 15000,
      disp: 400,
      icon: "📷",
    },
    {
      id: 17,
      eventName: "Fiesta Temática Retro",
      eventDate: "2025-09-21T22:00:00.000Z",
      price: 12000,
      disp: 800,
      icon: "📀",
    },
    {
      id: 18,
      eventName: "Recital de Poesía",
      eventDate: "2025-10-15T19:00:00.000Z",
      price: 6000,
      disp: 500,
      icon: "📖",
    },
    {
      id: 19,
      eventName: "Competencia de Canto",
      eventDate: "2025-11-30T17:30:00.000Z",
      price: 14000,
      disp: 700,
      icon: "🎤",
    },
    {
      id: 20,
      eventName: "Carrera de Autos RC",
      eventDate: "2025-12-20T15:00:00.000Z",
      price: 8000,
      disp: 400,
      icon: "🏎️",
    },
    {
      id: 21,
      eventName: "Concierto de Jazz Fusión",
      eventDate: "2025-08-22T20:30:00.000Z",
      price: 20000,
      disp: 1000,
      icon: "🎷",
    },
    {
      id: 22,
      eventName: "Torneo de Ajedrez",
      eventDate: "2025-07-25T12:00:00.000Z",
      price: 5000,
      disp: 300,
      icon: "♟️",
    },
    {
      id: 23,
      eventName: "Festival de Música Indie",
      eventDate: "2025-10-30T18:00:00.000Z",
      price: 22000,
      disp: 1500,
      icon: "🎶",
    },
    {
      id: 24,
      eventName: "Noche de Comedia",
      eventDate: "2025-09-19T21:00:00.000Z",
      price: 13000,
      disp: 600,
      icon: "😂",
    },
  ];

  const [search, setSearch] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(allEvents);

  const handleSearch = (query: string) => {
    setSearch(query);
    setFilteredEvents(
      allEvents.filter((evt) =>
        evt.eventName.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleBuy = (evt: EventItem) => {
    const { eventName, eventDate, price, disp } = evt;
    router.push(
      `/payment?eventName=${encodeURIComponent(eventName)}` +
        `&eventDate=${encodeURIComponent(eventDate)}` +
        `&price=${price}` +
        `&disp=${disp}`
    );
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex flex-col items-center">
      <div className="p-6 max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-center mb-4">
          Eventos Disponibles
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Encuentra tus próximos eventos y compra tus entradas fácilmente.
        </p>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105"
              >
                <h2 className="text-xl font-semibold flex items-center mb-2">
                  <span className="mr-2">{evt.icon}</span>
                  {evt.eventName}
                </h2>
                <p className="text-gray-400 mb-2">
                  Fecha: {new Date(evt.eventDate).toLocaleString()}
                </p>
                <p className="text-gray-400 mb-2">
                  Disponibilidad: {evt.disp.toLocaleString()}
                </p>
                <p className="text-gray-400 mb-4">
                  Precio: ${evt.price.toLocaleString()}
                </p>
                <button
                  onClick={() => handleBuy(evt)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
                >
                  Comprar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            No se encontraron eventos.
          </p>
        )}
      </div>
    </div>
  );
}
