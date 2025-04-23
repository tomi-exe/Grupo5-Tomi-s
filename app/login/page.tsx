"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../Components/Loading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); //state for loading
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // activate loading

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/events");
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false); // deactivate loading after the request is done
    }
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex justify-center items-center p-4">
      {/* show the loading component if its use state is true */}
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

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

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
