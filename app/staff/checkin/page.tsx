"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QrScanner from "@/components/checkin/QrScanner.client";
import TicketPreview from "@/components/checkin/TicketPreview.client";
import CheckInResult from "@/components/checkin/CheckInResult.client";

interface ScannedTicket {
  ticketId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
}

export default function CheckInPage() {
  const [stage, setStage] = useState<"scan" | "preview" | "result">("scan");
  const [scanned, setScanned] = useState<ScannedTicket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleScan = (data: string) => {
    try {
      const obj = JSON.parse(data) as ScannedTicket;
      if (!obj.ticketId || !obj.eventId) throw new Error("Datos incompletos");
      setScanned(obj);
      setError(null);
      setStage("preview");
    } catch (e: any) {
      setError("QR inválido: " + e.message);
    }
  };
  const handleError = (err: Error) => {
    console.error(err);
    setError("Error cámara");
  };
  const handleConfirm = async () => {
    if (!scanned) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: scanned.ticketId,
          eventId: scanned.eventId,
        }),
      });
      const data = await res.json();
      setResult({
        success: res.ok,
        message: res.ok ? "✅ Check-In registrado" : `⚠️ ${data.message}`,
      });
      setStage("result");
    } catch {
      setResult({ success: false, message: "❌ Error de red" });
      setStage("result");
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setStage("scan");
    setScanned(null);
    setError(null);
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Sistema de Check-In</h1>
      <AnimatePresence mode="wait" initial={false}>
        {stage === "scan" && (
          <motion.div
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <QrScanner onScan={handleScan} onError={handleError} />
            {error && <p className="mt-4 text-red-400">{error}</p>}
          </motion.div>
        )}
        {stage === "preview" && scanned && (
          <motion.div
            key="preview"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
          >
            <TicketPreview
              ticket={scanned}
              onConfirm={handleConfirm}
              onCancel={handleReset}
              loading={loading}
              error={error}
            />
          </motion.div>
        )}
        {stage === "result" && result && (
          <motion.div
            key="result"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <CheckInResult
              success={result.success}
              message={result.message}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
