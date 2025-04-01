import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function Events() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Eventos Disponibles</h1>
      <p>Lista de eventos...</p>
    </div>
  );
}
