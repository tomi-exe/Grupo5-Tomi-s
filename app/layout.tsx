"use client";

import { useState, useEffect, ReactNode } from "react";
import Navbar from "./Components/Navbar";
import Link from "next/link";
import { ToastProvider } from "./Components/Toast";

interface User {
  id: string;
  email: string;
  name: string;
  role?: "user" | "admin" | "organizer";
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener la información del usuario actual
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // Si no está autenticado, asegurar que user sea null
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Función para actualizar el estado del usuario (para que Navbar pueda notificar cambios)
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
  };

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
              {/* Navbar */}
              <div className="w-full">
                <Navbar user={user} loading={loading} updateUser={updateUser} />
              </div>
              
              {/* Información del usuario en el header - Solo mostrar si está logueado */}
              {!loading && user && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mt-4 sm:mt-0">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Bienvenido, {user.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.email}
                    </div>
                  </div>
                  {user.role && user.role !== 'user' && (
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-medium">
                      {user.role.toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-400">Cargando...</span>
                </div>
              )}
            </header>

            {/* Main content */}
            <main className="flex-1 px-4 py-6 sm:px-10">
              <div className="max-w-4xl mx-auto">{children}</div>
            </main>

            {/* Footer */}
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