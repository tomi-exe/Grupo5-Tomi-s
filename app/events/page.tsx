"use client";

import { useRouter } from "next/navigation";

export default function Events() {
  const router = useRouter();

  const events = [
    { id: 1, name: "Concierto Coldplay", price: 20000, icon: "🎤" },
    { id: 2, name: "Festival de Jazz", price: 15000, icon: "🎷" },
    { id: 3, name: "Stand-Up Comedy Show", price: 12000, icon: "🎭" },
    { id: 4, name: "Orquesta Sinfónica", price: 25000, icon: "🎻" },
    { id: 5, name: "Concierto Coldplay", price: 20000, icon: "🎤" },
    { id: 6, name: "Festival de Jazz", price: 15000, icon: "🎷" },
    { id: 7, name: "Stand-Up Comedy Show", price: 12000, icon: "🎭" },
    { id: 8, name: "Orquesta Sinfónica", price: 25000, icon: "🎻" },
  ];

  const handleBuy = (eventName: string, price: number) => {
    router.push(`/payment?event=${eventName}&price=${price}`);
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex flex-col items-center">
      <div className="p-6 max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-4">Eventos Disponibles</h1>
        <p className="text-center text-gray-400 mb-8">
          Encuentra tus próximos eventos y compra tus entradas fácilmente.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-2xl transition"
            >
              <h2 className="text-xl font-semibold flex items-center mb-2">
                <span className="mr-2">{event.icon}</span>
                {event.name}
              </h2>
              <p className="text-gray-400 mb-4">Precio: ${event.price.toLocaleString()}</p>
              <button
                onClick={() => handleBuy(event.name, event.price)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
              >
                Comprar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





