"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/Toast"; // Asegúrate de importar correctamente el hook useToast
import Loading from "../../components/Loading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const addToast = useToast(); // Hook para mostrar toasts

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
        addToast("Inicio de sesión exitoso", "success"); // Muestra toast de éxito
        router.push("/events");
      } else {
        addToast(data.error || "Error al iniciar sesión", "error"); // Muestra toast de error
      }
    } catch (err) {
      console.error("Login error:", err);
      addToast(
        "Error al iniciar sesión. Por favor, intenta nuevamente.",
        "error"
      ); // Muestra toast de error genérico
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex justify-center items-center p-4">
      {loading ? (
        <Loading text="Iniciando sesión..." />
      ) : (
        <form
          onSubmit={handleLogin}
          className="bg-[#192734] p-6 rounded shadow-md w-full max-w-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Iniciar Sesión
          </h1>

          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 mb-4 rounded bg-[#0d1117] border border-[#233748] text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 mb-6 rounded bg-[#0d1117] border border-[#233748] text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
          >
            Entrar
          </button>
        </form>
      )}
    </div>
  );
}
