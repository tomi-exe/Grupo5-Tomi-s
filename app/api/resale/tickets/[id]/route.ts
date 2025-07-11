// app/api/resale/tickets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { TransferService } from "@/app/lib/transferService";

/**
 * PUT: Compra de reventa o toggle de listado
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // 1. Extraer el id del ticket (await sobre el Promise)
  const { id: ticketId } = await params;

  try {
    // 2. Conectar a la BD y verificar sesión
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 3. Parsear body
    const body = await request.json();
    const isPurchase = body.buy === true;
    const hasForSaleField = body.forSale !== undefined;
    if (!isPurchase && !hasForSaleField) {
      return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
    }

    // 4. Buscar el ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    if (isPurchase) {
      // 4.a. Compra de reventa
      if (!ticket.forSale) {
        return NextResponse.json(
          { message: "Ticket no está en reventa" },
          { status: 400 }
        );
      }

      try {
        await TransferService.recordTransfer({
          ticketId,
          previousOwnerId:
            ticket.currentOwnerId?.toString() || ticket.userId.toString(),
          newOwnerId: session.user.id,
          transferType: "resale_purchase",
          transferPrice: ticket.price,
          notes: "Compra de reventa",
          request,
        });
      } catch (recordErr) {
        console.warn("Warning: fallo al registrar transferencia:", recordErr);
      }

      ticket.currentOwnerId = session.user.id;
      ticket.forSale = false;
      ticket.transferDate = new Date();
      await ticket.save();

      return NextResponse.json(
        { message: "Compra de reventa completada", ticket },
        { status: 200 }
      );
    }

    // 4.b. Toggle de “forSale”
    ticket.forSale = body.forSale;
    await ticket.save();
    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error) {
    console.error("Error PUT /api/resale/tickets/[id]:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
