"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useToast } from "../../components/Toast";

export default function QRTestingPage() {
  const toast = useToast();
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    setScanner(html5QrCode);

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      async (decodedText: string) => {
        if (scanned) return;
        setScanned(true);

        try {
          const parsed = JSON.parse(decodedText);
          const qrCode = parsed.ticketNumber || parsed.qrCode;

          const res = await fetch("/api/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrCode }),
          });

          const result = await res.json();

          if (result.success) {
            toast(result.message || "Check-in exitoso", "success");
          } else {
            toast(result.message || "Error en check-in", "error");
          }
        } catch (err) {
          toast("QR inválido", "error");
        }

        setTimeout(() => setScanned(false), 4000);
      },
      (errorMessage) => {
        // Error escaneo silencioso (opcional log)
        console.warn("QR error:", errorMessage);
      }
    );

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-xl font-bold mb-4 text-white">
        Escanea tu código QR
      </h1>
      <div
        ref={scannerRef}
        id="reader"
        className="w-full max-w-md border-2 border-white rounded"
      />
    </div>
  );
}
