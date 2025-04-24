import { QRCode } from "react-qrcode-logo";

interface Ticket {
  eventName: string;
  ticketNumber: string;
  date: string;
  qrData: string; // codedata for QR code
}

export default function TicketPreview({ ticket }: { ticket: Ticket }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#111a22] text-white p-4">
      <div className="bg-[#192734] p-6 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">{ticket.eventName}</h1>
        <div className="mb-6">
          <QRCode value={ticket.qrData} size={200} fgColor="#ffffff" />
        </div>
        <p className="text-lg mb-2">Ticket #: {ticket.ticketNumber}</p>
        <p className="text-md mb-2">Fecha: {ticket.date}</p>
        <p className="text-sm text-[#92b0c9]">
          Escanea el código QR para más detalles.
        </p>
      </div>
    </div>
  );
}
