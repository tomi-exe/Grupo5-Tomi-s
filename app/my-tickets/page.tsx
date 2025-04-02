import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function MyTickets() {
  // Check if the user is logged in
  const session = await getSession();
  if (!session) {
    // Redirect to the login page if no session is found
    redirect("/login");
  }

  // Render the page content if the user is logged in
  return (
    <>
      <h1 className="text-2xl font-bold">Mis Entradas</h1>
      <p className="mt-2">Listado de entradas compradas o transferidas.</p>
    </>
  );
}
