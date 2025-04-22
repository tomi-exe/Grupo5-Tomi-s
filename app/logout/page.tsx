"use client"; // Asegúrate de marcar este componente como cliente

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // Llamar al API route para hacer el logout
    fetch("/api/auth/logout")
      .then(() => {
        // Redirigir al login después de hacer logout
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  }, [router]);

  return <p>Logging out...</p>;
}
