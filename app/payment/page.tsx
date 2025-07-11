// File: app/payment/page.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Loading from "@/components/Loading";

export default function PaymentPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Determine if this is a resale purchase or new ticket purchase
  const ticketId = params.get("ticketId");
  const isResale = Boolean(ticketId);

  // Extraemos los parámetros que espera el backend
  const eventName = params.get("eventName") || "";
  const eventDate = params.get("eventDate") || "";
  const priceParam = params.get("price");
  const dispParam = params.get("disp");

  const price = priceParam ? Number(priceParam) : 0;
  const disp = dispParam ? Number(dispParam) : 0;

  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleConfirm = async () => {
    // Validación mínima antes de enviar
    if (!eventName || !eventDate || price <= 0) {
      alert("Faltan datos del evento o precio inválido");
      return;
    }

    setLoading(true);

    let res;
    if (isResale && ticketId) {
      // Comprar ticket de reventa
      res = await fetch(`/api/resale/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ buy: true }),
      });
    } else {
      // Compra normal de nuevo ticket
      res = await fetch("/api/tickets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, eventDate, price, disp }),
      });
    }

    setLoading(false);

    if (res.ok) {
      router.push("/my-tickets");
    } else {
      const payload = await res.json();
      alert("Error al procesar el pago: " + (payload.message || res.status));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex justify-center items-center p-6">
      <div className="bg-[#192734] p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">
          Pasarela de Pago Ficticia
        </h1>

        <p className="mb-4">Evento: {eventName}</p>
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
          placeholder="Número de tarjeta (16 dígitos)"
          maxLength={16}
          className="w-full p-3 mb-6 rounded bg-[#0d1117] border border-[#233748]"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
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
