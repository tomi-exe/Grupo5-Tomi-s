"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Events() {
  const router = useRouter();

  const allEvents = [
    {
      id: 1,
      eventName: "Concierto Coldplay",
      price: 20000,
      disp: 2000,
      icon: "🎤",
    },
    {
      id: 2,
      eventName: "Festival de Jazz",
      price: 15000,
      disp: 2000,
      icon: "🎷",
    },
    {
      id: 3,
      eventName: "Stand-Up Comedy Show",
      price: 12000,
      disp: 2000,
      icon: "🎭",
    },
    {
      id: 4,
      eventName: "Orquesta Sinfónica",
      price: 25000,
      disp: 2000,
      icon: "🎻",
    },
    {
      id: 5,
      eventName: "Festival de Música Electrónica",
      price: 30000,
      disp: 1500,
      icon: "🎧",
    },
    {
      id: 6,
      eventName: "Obra de Teatro Clásica",
      price: 18000,
      disp: 800,
      icon: "🎭",
    },
    {
      id: 7,
      eventName: "Torneo de Videojuegos",
      price: 10000,
      disp: 500,
      icon: "🎮",
    },
    {
      id: 8,
      eventName: "Charla Motivacional",
      price: 8000,
      disp: 1000,
      icon: "🎤",
    },
    {
      id: 9,
      eventName: "Maratón de Cine",
      price: 15000,
      disp: 700,
      icon: "🎬",
    },
    {
      id: 10,
      eventName: "Competencia de Baile",
      price: 12000,
      disp: 900,
      icon: "💃",
    },
    {
      id: 11,
      eventName: "Exposición de Arte",
      price: 7000,
      disp: 600,
      icon: "🖼️",
    },
    {
      id: 12,
      eventName: "Concierto de Rock",
      price: 25000,
      disp: 2000,
      icon: "🎸",
    },
    {
      id: 13,
      eventName: "Conferencia de Tecnología",
      price: 20000,
      disp: 1000,
      icon: "💻",
    },
    {
      id: 14,
      eventName: "Festival Gastronómico",
      price: 10000,
      disp: 1200,
      icon: "🍴",
    },
    {
      id: 15,
      eventName: "Clase de Yoga en Vivo",
      price: 5000,
      disp: 300,
      icon: "🧘",
    },
    {
      id: 16,
      eventName: "Taller de Fotografía",
      price: 15000,
      disp: 400,
      icon: "📷",
    },
    {
      id: 17,
      eventName: "Fiesta Temática Retro",
      price: 12000,
      disp: 800,
      icon: "📀",
    },
    {
      id: 18,
      eventName: "Recital de Poesía",
      price: 6000,
      disp: 500,
      icon: "📖",
    },
    {
      id: 19,
      eventName: "Competencia de Canto",
      price: 14000,
      disp: 700,
      icon: "🎤",
    },
    {
      id: 20,
      eventName: "Carrera de Autos RC",
      price: 8000,
      disp: 400,
      icon: "🏎️",
    },
    {
      id: 21,
      eventName: "Concierto de Jazz Fusión",
      price: 20000,
      disp: 1000,
      icon: "🎷",
    },
    {
      id: 22,
      eventName: "Torneo de Ajedrez",
      price: 5000,
      disp: 300,
      icon: "♟️",
    },
    {
      id: 23,
      eventName: "Festival de Música Indie",
      price: 22000,
      disp: 1500,
      icon: "🎶",
    },
    {
      id: 24,
      eventName: "Noche de Comedia",
      price: 13000,
      disp: 600,
      icon: "😂",
    },
    // Agrega más eventos aquí
  ];

  const [search, setSearch] = useState("");
  const [filteredEvents, setFilteredEvents] = useState(allEvents);

  const handleSearch = (query: string) => {
    setSearch(query);
    setFilteredEvents(
      allEvents.filter((event) =>
        event.eventName.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleBuy = (eventName: string, price: number, disp: number) => {
    router.push(
      `/payment?eventName=${encodeURIComponent(
        eventName
      )}&price=${price}&disp=${disp}`
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
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-2xl transition transform hover:scale-105"
              >
                <h2 className="text-xl font-semibold flex items-center mb-2">
                  <span className="mr-2">{event.icon}</span>
                  {event.eventName}
                </h2>
                <p className="text-gray-400 mb-4">
                  Disponibilidad: {event.disp.toLocaleString()}
                </p>
                <p className="text-gray-400 mb-4">
                  Precio: ${event.price.toLocaleString()}
                </p>
                <button
                  onClick={() =>
                    handleBuy(event.eventName, event.price, event.disp)
                  }
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
