import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { TransferService } from "@/app/lib/transferService";

/**
 * PUT: Compra de reventa
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id: ticketId } = context.params;
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    // Handle resale purchase or sale listing toggles
    const isPurchase = body.buy === true;
    const hasForSaleField = body.forSale !== undefined;
    if (!isPurchase && !hasForSaleField) {
      return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
    }

    // Fetch the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    if (isPurchase) {
      // Ensure it's available for resale
      if (!ticket.forSale) {
        return NextResponse.json(
          { message: "Ticket no está en reventa" },
          { status: 400 }
        );
      }

      // Record resale purchase
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
        console.error("Warning: failed to record resale transfer:", recordErr);
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

    // Handle toggling sale listing
    ticket.forSale = body.forSale;
    await ticket.save();
    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error) {
    console.error("Error PUT /api/resale/tickets/[id]:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
