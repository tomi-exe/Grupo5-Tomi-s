"use client";

import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError: (error: Error) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const qrRegionId = "html5qr-code-full-region";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isCancelled = false;

    // Config de escaneo
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    };

    // 1) Enumerar cámaras y elegir “environment”
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (isCancelled) return;
        if (!devices || devices.length === 0) {
          throw new Error("No se encontraron cámaras");
        }
        // Buscar cámara trasera
        const cam =
          devices.find((d) => d.label.toLowerCase().includes("back")) ||
          devices[0];

        // 2) Iniciar html5-qr
        const html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;

        html5QrCode
          .start(
            cam.id,
            config,
            (decodedText) => {
              onScan(decodedText);
              html5QrCode.stop().catch(() => {});
            },
            (err) => {
              /* ignoramos errores de frame */
            }
          )
          .catch(onError);
      })
      .catch(onError);

    return () => {
      isCancelled = true;
      // Cleanup: stop y clear
      html5QrCodeRef.current
        ?.stop()
        .then(() => html5QrCodeRef.current?.clear())
        .catch(() => {});
    };
  }, [onScan, onError]);

  return (
    <div
      id={qrRegionId}
      className="w-full h-64 bg-gray-900 rounded-lg overflow-hidden relative"
      aria-label="Escáner de código QR"
    >
      {/* Marco guía */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none border-4 border-dashed border-blue-500 rounded-lg"
      />
    </div>
  );
}
