"use client";
import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import Loading from "@/components/Loading";

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
      // If result is null, do nothing
      if (result === null) return;
      // Use getText() method to access the QR code string
      const code =
        typeof result.getText === "function" ? result.getText() : result.text;
      if (code === qr) return; // no re-send same code
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
          setFeedback({ type: "success", text: json.message });
        })
        .catch((e: any) => {
          setFeedback({ type: "error", text: e.message });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [qr]
  );

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Staff QR Check-in</h1>

      <div className="w-full max-w-lg aspect-square sm:aspect-video bg-[#192734] rounded-lg overflow-hidden shadow-lg relative">
        <div style={{ width: "100%", height: "100%" }}>
          <BarcodeScanner onUpdate={handleUpdate} />
        </div>
        <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-blue-400 rounded-lg animate-pulse" />
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
