import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // Eliminar la cookie de sesión
  cookies().set("session", "", { expires: new Date(0) });

  // Redirigir a la página de login
  return NextResponse.redirect("/login");
}
