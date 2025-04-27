"use client";
import React from "react";
import { QRCode } from "react-qrcode-logo";

const QRTest = () => {
  const ticketData = {
    eventName: "Concierto de Rock",
    ticketNumber: "123456789",
    date: "2025-04-25",
    location: "Estadio Nacional",
  };

  // Convertimos los datos del ticket a formato JSON
  const qrData = JSON.stringify(ticketData);

  return (
    <div className="qr-container">
      <h2>Generando Código QR para Ticket</h2>
      <QRCode
        value={qrData} // Datos del ticket codificados en el QR
        size={256}
        fgColor="#ffffff"
      />
      <p>Escanea el código QR para obtener todos los detalles del ticket.</p>
    </div>
  );
};

export default QRTest;
