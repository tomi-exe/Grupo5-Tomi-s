"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
}

export default function QrScanner({ onScan, onError }: QrScannerProps) {
  const regionId = "html5qr-code-full-region";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    };

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (isCancelled) return;
        if (!devices || devices.length === 0) {
          throw new Error("No cameras found");
        }
        const cam =
          devices.find((d) => d.label.toLowerCase().includes("back")) ||
          devices[0];

        console.log("Starting QR scanner with camera", cam.label);
        const html5QrCode = new Html5Qrcode(regionId);
        html5QrCodeRef.current = html5QrCode;

        html5QrCode
          .start(
            cam.id,
            config,
            (decodedText) => {
              console.log("QR detected", decodedText);
              onScan(decodedText);
              html5QrCode.stop().catch(() => {});
            },
            () => {
              // frame decode failure, ignore
            }
          )
          .catch((err) => {
            console.error("QR start error", err);
            onError?.(err);
          });
      })
      .catch((err) => {
        console.error("Camera error", err);
        onError?.(err);
      });

    return () => {
      isCancelled = true;
      html5QrCodeRef.current
        ?.stop()
        .then(() => html5QrCodeRef.current?.clear())
        .catch(() => {});
    };
  }, [onScan, onError]);

  return (
    <div
      id={regionId}
      className="w-full h-64 bg-gray-900 rounded-lg overflow-hidden relative"
    >
      <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-blue-500 rounded-lg" />
    </div>
  );
}
