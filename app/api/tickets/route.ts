import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/db-utils";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { TransferService } from "@/app/lib/transferService";
import mongoose from "mongoose";

/**
 * POST: Registrar un nuevo ticket
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

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
      userId: new mongoose.Types.ObjectId(session.user.id),
      currentOwnerId: new mongoose.Types.ObjectId(session.user.id), // Establecer propietario inicial
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
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const tickets = await Ticket.find({ 
      $or: [
        { userId: userId },
        { currentOwnerId: userId }
      ]
    }).sort({ eventDate: 1 }); // Ordenar por fecha del evento

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
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { ticketId, newUserId } = await request.json();
    if (!ticketId || !newUserId) {
      return NextResponse.json(
        { message: "Faltan datos para transferir" },
        { status: 400 }
      );
    }

    // Validar que ticketId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json(
        { message: "ID de ticket inválido" },
        { status: 400 }
      );
    }

    // Validar que newUserId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(newUserId)) {
      return NextResponse.json(
        { message: "ID de usuario destinatario inválido" },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario actual es el propietario
    const currentUserId = session.user.id;
    const ticketCurrentOwnerId = ticket.currentOwnerId?.toString();
    const ticketOriginalUserId = ticket.userId.toString();

    if (ticketCurrentOwnerId !== currentUserId && ticketOriginalUserId !== currentUserId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Verificar que el ticket no esté usado
    if (ticket.isUsed || ticket.status === 'used') {
      return NextResponse.json(
        { message: "No se puede transferir un ticket ya utilizado" },
        { status: 400 }
      );
    }

    // Verificar que no se esté transfiriendo a sí mismo
    if (newUserId === currentUserId) {
      return NextResponse.json(
        { message: "No puedes transferir un ticket a ti mismo" },
        { status: 400 }
      );
    }

    // Registrar la transferencia en el historial ANTES de actualizar el ticket
    const previousOwnerId = ticket.currentOwnerId?.toString() || ticket.userId.toString();
    
    await TransferService.recordTransfer({
      ticketId: (ticket._id as mongoose.Types.ObjectId).toString(),
      previousOwnerId: previousOwnerId,
      newOwnerId: newUserId,
      transferType: "direct_transfer",
      notes: "Transferencia directa entre usuarios",
      request
    });

    // Actualizar el ticket
    ticket.currentOwnerId = new mongoose.Types.ObjectId(newUserId);
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