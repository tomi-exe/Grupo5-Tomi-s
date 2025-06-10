"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/logout")
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Logout failed", error);
        router.push("/login");
      });
  }, [router]);

  return <Loading text="Cerrando sesión..." />;
}
