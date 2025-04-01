// app/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/lib"; // Importando tus funciones de sesión

export async function middleware(request: NextRequest) {
  const session = await getSession(request.cookies.get("session")?.value);

  // Si no hay sesión, redirigir al login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si hay sesión, continuar con la petición
  return NextResponse.next();
}

// Configurar las rutas que este middleware debe aplicar
export const config = {
  matcher: ["/events", "/protected/*"], // Rutas a las que protegerás
};
