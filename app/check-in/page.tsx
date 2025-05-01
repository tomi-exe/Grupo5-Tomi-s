"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

// ...existing imports...

export default function CheckIn() {
  const [result, setResult] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5Qr = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    html5Qr.current = new Html5Qrcode(scannerRef.current.id);

    html5Qr.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decoded: string | { decodedText: string }, resultObj) => {
        // Compatibilidad: algunos devuelven decodedText, otros solo decoded
        const decodedText =
          typeof decoded === "string" ? decoded : decoded.decodedText;
        if (!decodedText) return;

        try {
          const ticket = JSON.parse(decodedText);
          const res = await fetch("/api/verify-qr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: ticket._id }),
          });
          const json = await res.json();
          if (json.valid) {
            setResult("✅ Ticket válido");
          } else {
            setResult("❌ Ticket inválido: " + json.message);
          }
        } catch {
          setResult("❌ QR inválido");
        }
        html5Qr.current?.stop();
      },
      (errorMessage) => {
        // Puedes mostrar errores de escaneo si quieres
      }
    );

    return () => {
      html5Qr.current?.stop();
      html5Qr.current?.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6">Check-in de Tickets</h1>
      <div
        ref={scannerRef}
        id="qr-reader"
        style={{ width: 300, height: 300, background: "#fff", borderRadius: 8 }}
      />
      {result && <div className="text-xl font-bold mt-4">{result}</div>}
      <p className="mt-4 text-sm text-[#92b0c9]">
        Escanea el QR del ticket para verificar su validez.
      </p>
    </div>
  );
}
