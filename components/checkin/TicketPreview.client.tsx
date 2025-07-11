"use client";

import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface ScannedTicket {
  ticketId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
}

interface TicketPreviewProps {
  ticket: ScannedTicket;
  loading: boolean;
  error: string | null;
}

interface TicketPreviewActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function TicketPreviewActions({
  onConfirm,
  onCancel,
  loading,
}: TicketPreviewActionsProps) {
  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Escanear otro
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded text-white font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {loading ? "Registrando…" : "Registrar Check-In"}
      </button>
    </div>
  );
}

export default function TicketPreview({
  ticket,
  loading,
  error,
  ...actions
}: TicketPreviewProps & TicketPreviewActionsProps) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      className="max-w-md w-full bg-[#192734] p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">{ticket.eventName}</h2>
      <dl className="text-gray-200 mb-6">
        <dt className="font-semibold">Fecha:</dt>
        <dd className="mb-2">
          {format(new Date(ticket.eventDate), "dd MMM yyyy, HH:mm")}
        </dd>
        <dt className="font-semibold">Ticket ID:</dt>
        <dd className="break-all mb-4">{ticket.ticketId}</dd>
      </dl>
      {error && (
        <p role="alert" className="text-red-400 mb-4" aria-live="assertive">
          {error}
        </p>
      )}
      <TicketPreviewActions {...actions} loading={loading} />
    </motion.div>
  );
}
