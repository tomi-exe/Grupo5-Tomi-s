"use client";

import { useState, ReactNode } from "react";
import Navbar from "./Components/Navbar";
import Link from "next/link";
import { ToastProvider } from "./Components/Toast"; // Ajusta la ruta según tu estructura

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
                <label className="flex items-center rounded-xl bg-[#233748] w-full sm:w-auto">
                  <div className="flex items-center px-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24px"
                      height="24px"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                    >
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar"
                    className="flex-1 bg-transparent px-3 py-2 text-white placeholder:text-[#92b0c9] focus:outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
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
