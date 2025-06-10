"use client";

import { useState, ReactNode } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { ToastProvider } from "../components/Toast"; // Ajusta la ruta según tu estructura

export default function RootLayout({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");

  return (
    <html lang="en">
      <head>
        <title>Proyecto</title>
        <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
      </head>
      <body>
        <ToastProvider>
          <div className="flex flex-col min-h-screen bg-[#111a22] text-white">
            <header className="flex flex-wrap items-center justify-between border-b border-[#233748] px-6 py-4">
              {}
              <div className="flex items-center gap-8">
                <Navbar />
              </div>
              {}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                {}
                {}
                <Link href="/register">
                  <button className="px-4 py-2 bg-[#233748] rounded-xl text-sm font-bold">
                    Registrar
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-4 py-2 bg-white text-black rounded-xl text-sm font-bold">
                    Iniciar sesión
                  </button>
                </Link>
              </div>
            </header>

            {}
            <main className="flex-1 px-4 py-6 sm:px-10">
              <div className="max-w-4xl mx-auto">{children}</div>
            </main>

            {}
            <footer className="bg-[#233748] text-center py-6 text-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <a href="#" className="text-[#92b0c9] hover:underline">
                  Sobre nosotros
                </a>
                <a href="#" className="text-[#92b0c9] hover:underline">
                  Contacto
                </a>
                <a href="#" className="text-[#92b0c9] hover:underline">
                  Términos y condiciones
                </a>
                <a href="#" className="text-[#92b0c9] hover:underline">
                  Política de privacidad
                </a>
              </div>
              <p className="mt-4 text-[#92b0c9]">
                ©2025 Ticketzone. Todos los derechos reservados.
              </p>
            </footer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
