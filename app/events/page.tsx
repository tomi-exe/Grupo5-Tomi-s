"use client";

import { useRouter } from "next/navigation";

export default function Events() {
  const router = useRouter();

  const handleBuy = () => {
    router.push("/payment?event=Concierto Coldplay&price=20000");
  };

  return (
    <div className="p-4 max-w-screen-md mx-auto text-white">
      <h1 className="text-2xl font-semibold text-center sm:text-left">Eventos Disponibles</h1>
      <p className="mt-2 text-center sm:text-left">Lista de eventos ficticia:</p>

      <div className="mt-8 border border-gray-600 p-4 rounded">
        <h2 className="text-xl font-bold">🎤 Concierto Coldplay</h2>
        <p className="mb-4">Precio: $20.000</p>
        <button
          onClick={handleBuy}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Comprar
        </button>
      </div>
    </div>
  );
}




