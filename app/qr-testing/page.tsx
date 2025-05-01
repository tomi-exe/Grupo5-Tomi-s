"use client";
import React, { useState } from "react";
import { QRCode } from "react-qrcode-logo";

const QRTest = () => {
  // Puedes dejar este ticket de ejemplo para generar un QR de prueba
  const ticketData = {
    event: "Concierto de Rock",
    ticketNumber: "123456789",
    date: "2025-04-25",
    location: "Estadio Nacional",
    organizer: "Producciones X",
    time: "20:00",
    _id: "ID_DE_EJEMPLO", // Puedes pegar aquí un _id real para probar
  };

  const ticketDataString = JSON.stringify(ticketData);

  // Estado para probar la verificación
  const [qrInput, setQrInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Función para verificar el QR
  async function verificarQR() {
    try {
      const ticketData = JSON.parse(qrInput);
      const res = await fetch("/api/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: ticketData._id }),
      });
      const data = await res.json();
      if (data.valid) {
        setResult("✅ Ticket válido");
      } else {
        setResult("❌ Ticket inválido: " + data.message);
      }
    } catch (e) {
      setResult("❌ QR inválido");
    }
  }

  return (
    <div className="qr-container">
      <h2>Generando Código QR para Ticket</h2>
      <QRCode
        value={ticketDataString}
        logoImage="https://example.com/logo.png"
      />
      <p>Escanea el código QR para más detalles sobre el ticket.</p>

      <hr className="my-6" />

      <h3>Verificar QR manualmente</h3>
      <textarea
        rows={3}
        value={qrInput}
        onChange={(e) => setQrInput(e.target.value)}
        placeholder="Pega aquí el string del QR escaneado"
        className="w-full p-2 border rounded mb-2 text-black"
      />
      <button
        onClick={verificarQR}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Verificar QR
      </button>
      {result && <div className="mt-2">{result}</div>}
    </div>
  );
};

export default QRTest;
