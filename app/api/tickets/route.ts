import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { TransferService } from "@/app/lib/transferService";

/**
 * POST: Registrar un nuevo ticket
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { eventName, eventDate, price, disp = 1 } = body;

    if (!eventName || !eventDate || price == null) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const ticket = new Ticket({
      eventName,
      eventDate: new Date(eventDate),
      price,
      disp,
      userId: session.user.id,
      currentOwnerId: session.user.id, // Establecer propietario inicial
      forSale: false,
      transferDate: null,
    });

    await ticket.save();

    return NextResponse.json(
      { message: "Compra registrada con éxito", ticket },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /api/tickets:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

/**
 * GET: Obtener tickets del usuario
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const tickets = await Ticket.find({ 
      $or: [
        { userId: session.user.id },
        { currentOwnerId: session.user.id }
      ]
    });
    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/tickets:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

/**
 * PUT: Transferir un ticket a otro usuario
 */
export async function PUT(request: NextRequest) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user)
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const { ticketId, newUserId } = await request.json();
    if (!ticketId || !newUserId) {
      return NextResponse.json(
        { message: "Faltan datos para transferir" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket)
      return NextResponse.json(
        { message: "Ticket no encontrado" },
        { status: 404 }
      );

    // Verificar que el usuario actual es el propietario
    if (ticket.currentOwnerId?.toString() !== session.user.id && ticket.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Registrar la transferencia en el historial ANTES de actualizar el ticket
    await TransferService.recordTransfer({
      ticketId: ticket._id.toString(),
      previousOwnerId: ticket.currentOwnerId?.toString() || ticket.userId.toString(),
      newOwnerId: newUserId,
      transferType: "direct_transfer",
      notes: "Transferencia directa entre usuarios",
      request
    });

    // Actualizar el ticket
    const previousOwnerId = ticket.currentOwnerId || ticket.userId;
    ticket.currentOwnerId = newUserId;
    ticket.forSale = false;
    ticket.transferDate = new Date();
    await ticket.save();

    return NextResponse.json(
      { message: "Transferencia realizada", ticket },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT /api/tickets:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}