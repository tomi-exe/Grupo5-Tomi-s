// app/api/resale/tickets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";

/**
 * PUT: Actualizar un ticket de reventa por su ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. Verificar sesión
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 2. Extraer el id del ticket (await sobre el Promise)
    const { id: ticketId } = await params;
    if (!ticketId) {
      return NextResponse.json(
        { message: "ID del ticket es requerido" },
        { status: 400 }
      );
    }

    // 3. Parsear el body con los datos a actualizar
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Datos inválidos en el cuerpo de la petición" },
        { status: 400 }
      );
    }

    // 4. Lógica mínima para que compile:
    const updatedTicket = {
      id: ticketId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ updated: updatedTicket });
  } catch (error) {
    console.error("Error actualizando ticket de reventa:", error);
    const msg = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
