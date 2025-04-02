"use client"; // Ensure this is at the top of the file

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rut, setRut] = useState(""); // New state for RUT
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function for validating the RUT
  const validateRut = (rut: string) => {
    // Eliminar puntos y guiones
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

    console.log("Submitting form with:", { name, email, password, rut });

    // Validate the RUT before sending to the server
    if (!validateRut(rut)) {
      setError("El RUT ingresado no es válido.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          rut, // Send RUT to server
        }),
      });

      console.log("Response status:", res.status);

      if (res.ok) {
        console.log("Registration successful, redirecting to /login...");
        router.push("/login");
      } else {
        const result = await res.json();
        console.error("Error response from server:", result);
        setError(result.message || "Hubo un error al registrar el usuario.");
      }
    } catch (err) {
      console.error("Error during fetch:", err);
      setError("Hubo un error al registrar el usuario.");
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="rut">RUT</label>
          <input
            id="rut"
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}
