import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Eliminar la cookie de sesión
    cookieStore.set("session", "", { 
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      sameSite: "lax"
    });

    return NextResponse.json(
      { message: "Sesión cerrada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en logout:", error);
    return NextResponse.json(
      { message: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}

export async function POST() {
  // También permitir POST para logout
  return GET();
}