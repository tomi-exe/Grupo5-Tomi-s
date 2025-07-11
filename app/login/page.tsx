"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../Components/Toast";
import Loading from "../Components/Loading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const addToast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Inicio de sesión exitoso", "success");
        
        // Método 1: Refresh completo de la página (recomendado para asegurar actualización)
        setTimeout(() => {
          window.location.href = "/events";
        }, 1000);

        // Método 2: Evento personalizado para notificar al layout (alternativo)
        // const loginEvent = new CustomEvent('userLoggedIn', { 
        //   detail: { timestamp: new Date().toISOString() } 
        // });
        // window.dispatchEvent(loginEvent);
        
        // setTimeout(() => {
        //   router.push("/events");
        // }, 1000);

      } else {
        addToast(data.error || "Error al iniciar sesión", "error");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      addToast("Error al iniciar sesión. Por favor, intenta nuevamente.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex justify-center items-center p-4">
      {loading ? (
        <div className="text-center">
          <Loading text="Iniciando sesión..." />
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400">
              ✅ Verificando credenciales...
            </p>
            <p className="text-sm text-gray-400">
              🔄 Actualizando sesión...
            </p>
            <p className="text-sm text-gray-400">
              🚀 Redirigiendo...
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <form
            onSubmit={handleLogin}
            className="bg-[#192734] p-6 rounded-lg shadow-lg"
          >
            <h1 className="text-2xl font-bold mb-6 text-center">
              Iniciar Sesión
            </h1>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full p-3 rounded bg-[#0d1117] border border-[#233748] text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 rounded bg-[#0d1117] border border-[#233748] text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Entrar"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-blue-400 hover:text-blue-300 underline transition-colors"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-4 p-4 bg-[#192734]/50 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              💡 Al iniciar sesión, la página se actualizará automáticamente para mostrar todas las funciones disponibles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}