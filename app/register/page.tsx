"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const validateRut = (rut: string) => {
    const cleanRut = rut.replace(/[.-]/g, "");
    if (cleanRut.length < 8 || cleanRut.length > 9) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const calculatedDv = 11 - (sum % 11);
    const validDv =
      calculatedDv === 11
        ? "0"
        : calculatedDv === 10
        ? "K"
        : calculatedDv.toString();

    return dv === validDv;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateRut(rut)) {
      setError("El RUT ingresado no es válido.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, rut }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Error al registrar usuario");
      }
    } catch (err) {
      setError("Error interno del servidor");
    }
  };

  return (
    <div className="min-h-screen bg-[#111a22] text-white flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#192734] p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>

        <input
          type="text"
          placeholder="Nombre completo"
          className="w-full p-3 mb-4 rounded bg-[#0d1117] border border-[#233748] text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          className="w-full p-3 mb-4 rounded bg-[#0d1117] border border-[#233748] text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="RUT (ej: 12345678-9)"
          className="w-full p-3 mb-6 rounded bg-[#0d1117] border border-[#233748] text-white"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          required
        />

        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
