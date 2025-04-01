import { getSession } from "@/app/lib/lib";
import { redirect } from "next/navigation";
import Layout from "@/Components/Layout";

export default async function Events() {
  const session = await getSession();

  if (!session) {
    redirect("/login"); // Redirigir si el usuario no está autenticado
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Eventos Disponibles</h1>
      <p className="mt-2">Aquí irá el listado de conciertos y actividades.</p>
    </Layout>
  );
}
