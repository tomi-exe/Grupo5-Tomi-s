"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Loading from "@/app/Components/Loading";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ahora capturamos exactamente lo que espera el backend
  const eventName = searchParams.get("eventName") || "";
  const eventDate = searchParams.get("eventDate") || "";
  const price = Number(searchParams.get("price") || 0);
  const disp = Number(searchParams.get("disp") || 1);

  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!eventName || !eventDate || price <= 0) {
      alert("Faltan datos del evento o precio inválido");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, eventDate, price, disp }),
    });

    setIsLoading(false);

    if (res.ok) {
      router.push("/my-tickets");
    } else {
      const data = await res.json();
      alert("Error al procesar el pago: " + (data.message || res.status));
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex justify-center items-center p-6">
      <div className="bg-[#192734] p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          Pasarela de Pago Ficticia
        </h1>
        <p className="mb-4">Evento: {eventName}</p>
        <p className="mb-4">Fecha: {new Date(eventDate).toLocaleString()}</p>
        <p className="mb-4">Precio: ${price}</p>
        <p className="mb-6">Disponibilidad: {disp}</p>
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
