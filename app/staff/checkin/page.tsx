"use client";
import { useState, useCallback } from "react";
import Loading from "@/components/Loading";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(() => import("react-qr-barcode-scanner"), {
  ssr: false,
});

export default function StaffCheckInPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdate = useCallback(
    (_err: unknown, result?: any) => {
      if (!result) return;
      const code =
        typeof result.getText === "function" ? result.getText() : result.text;
      if (!code || code === qr) return;
      console.log("QR scanned:", code);
      setQr(code);
      setLoading(true);
      setFeedback(null);

      fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: code }),
      })
        .then(async (res) => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Check-in failed");
          console.log("Check-in successful", json);
          setFeedback({ type: "success", text: json.message });
        })
        .catch((e: any) => {
          console.error("Check-in error", e);
          setFeedback({ type: "error", text: e.message });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [qr]
  );

  const handleError = useCallback((err: unknown) => {
    console.error("Scanner error", err);
    const message =
      typeof err === "string"
        ? err
        : err instanceof DOMException
        ? err.message
        : "Unknown scanner error";
    setFeedback({ type: "error", text: message });
  }, []);

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Staff QR Check-in</h1>

      <div className="w-full max-w-lg bg-[#192734] rounded-lg overflow-hidden shadow-lg relative p-4">
        <BarcodeScanner onUpdate={handleUpdate} onError={handleError} />
        <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-blue-400 rounded-lg" />
      </div>

      {loading && <Loading text="Procesando..." />}

      {feedback && (
        <p
          className={`mt-4 p-3 rounded ${
            feedback.type === "success" ? "bg-green-700" : "bg-red-700"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {!loading && (
        <p className="mt-2 text-gray-400">
          {qr ? `Último QR: ${qr}` : "Apunta la cámara al código QR"}
        </p>
      )}
    </div>
  );
}
