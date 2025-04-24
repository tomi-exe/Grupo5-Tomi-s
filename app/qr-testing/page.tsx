"use client";
import React from "react";
import { QRCode } from "react-qrcode-logo";

const QRTest = () => {
  // Datos del ticket
  const ticketData = {
    event: "Concierto de Rock",
    ticketNumber: "123456789",
    date: "2025-04-25",
    location: "Estadio Nacional",
    organizer: "Producciones X",
    time: "20:00",
  };

  // Covert datas to JSON string for QR code
  const ticketDataString = JSON.stringify(ticketData);

  return (
    <div className="qr-container">
      <h2>Generando Código QR para Ticket</h2>
      <QRCode
        value={ticketDataString}
        logoImage="https://example.com/logo.png"
      />
      <p>Escanea el código QR para más detalles sobre el ticket.</p>
    </div>
  );
};

export default QRTest;
