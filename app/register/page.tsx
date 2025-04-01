"use client"; // Ensure this is at the top of the file

import { useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Correct useRouter import

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting form with:", { name, email, password }); // Debugging input values

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
        }),
      });

      console.log("Response status:", res.status); // Debugging response status

      if (res.ok) {
        console.log("Registration successful, redirecting to /login...");
        router.push("/login"); // Redirect to login page
      } else {
        const result = await res.json();
        console.error("Error response from server:", result); // Debugging server error
        setError(result.message || "Hubo un error al registrar el usuario.");
      }
    } catch (err) {
      console.error("Error during fetch:", err); // Debugging fetch errors
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
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit">Registrarse</button>
      </form>
    </div>
  );
}
