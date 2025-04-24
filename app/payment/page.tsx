"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const event = searchParams.get("event");
  const price = searchParams.get("price");
  const disp = searchParams.get("disp");

  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");

  const handleConfirm = async () => {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, price: Number(price) , disp: Number(disp)}),
    });

    if (res.ok) {
      router.push("/my-tickets");
    } else {
      alert("Error al procesar el pago");
    }
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex justify-center items-center p-6">
      <div className="bg-[#192734] p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Pasarela de Pago Ficticia</h1>
        <p className="mb-4">Evento: {event}</p>
        <p className="mb-4">Precio: ${price}</p>
        <p className="mb-4">Disponibilidad: {disp}</p>
        <input
          type="text"
          placeholder="Nombre del titular"
          className="w-full p-3 mb-4 rounded bg-[#0d1117] border border-[#233748]"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Número de tarjeta (ficticio)"
          className="w-full p-3 mb-6 rounded bg-[#0d1117] border border-[#233748]"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        <button
          onClick={handleConfirm}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  );
}
