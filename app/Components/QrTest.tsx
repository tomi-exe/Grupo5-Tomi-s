"use client";
import React from "react";
import { QRCode } from "react-qrcode-logo";

const QRTest = () => {
  const ticketData = {
    eventName: "Concierto de Rock",
    eventDate: "2025-04-25",
    price: 25000,
    disp: 1,
    userId: "usuario_demo_id",
    location: "Estadio Nacional",
    ticketNumber: "123456789",
  };

  const qrData = JSON.stringify(ticketData);

  return (
    <div className="qr-container">
      <h2>Generando Código QR para Ticket</h2>
      <QRCode value={qrData} size={256} fgColor="#ffffff" />
      <p>Escanea el código QR para obtener todos los detalles del ticket.</p>
    </div>
  );
};

export default QRTest;
