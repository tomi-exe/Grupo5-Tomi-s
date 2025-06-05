import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { TransferService } from "@/app/lib/transferService";

/**
 * GET: Obtener historial de transferencias del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    let transfers;
    
    if (ticketId) {
      // Obtener transferencias de un ticket específico
      transfers = await TransferService.getTicketTransferHistory(ticketId);
    } else {
      // Obtener todas las transferencias del usuario
      transfers = await TransferService.getUserTransferHistory(session.user.id);
    }

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error("Error obteniendo transferencias del usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}