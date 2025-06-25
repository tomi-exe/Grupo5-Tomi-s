// File: app/api/tickets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";
import { TransferService } from "@/app/lib/transferService";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = "7d";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { eventName, eventDate, price, disp = 1 } = await request.json();
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
      currentOwnerId: session.user.id,
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
 *
 * Modifica el GET para que incluya un JWT firmado por process.env.JWT_SECRET.
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 1) Definir la forma de nuestro documento lean
    interface LeanTicket {
      _id: Types.ObjectId;
      eventName: string;
      eventDate: Date;
      price: number;
      currentOwnerId?: Types.ObjectId | null;
    }

    // 2) Hacer la query y castear a nuestro tipo
    const tickets = (await Ticket.find({
      $or: [{ userId: session.user.id }, { currentOwnerId: session.user.id }],
    })
      .lean()
      .exec()) as unknown as LeanTicket[];

    // 3) Firmar un JWT para cada ticket
    const ticketsWithToken = tickets.map((t) => {
      const payload = {
        id: t._id.toString(),
        eventName: t.eventName,
        eventDate: t.eventDate,
        price: t.price,
        currentOwnerId: t.currentOwnerId?.toString() ?? null,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

      return {
        ...t,
        qrToken: token,
      };
    });

    return NextResponse.json({ tickets: ticketsWithToken }, { status: 200 });
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

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario actual es el propietario
    if (
      ticket.currentOwnerId?.toString() !== session.user.id &&
      ticket.userId.toString() !== session.user.id
    ) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    // Registrar la transferencia en el historial antes de actualizar
    await TransferService.recordTransfer({
      ticketId: ticket._id.toString(),
      previousOwnerId:
        ticket.currentOwnerId?.toString() || ticket.userId.toString(),
      newOwnerId: newUserId,
      transferType: "direct_transfer",
      notes: "Transferencia directa entre usuarios",
      request,
    });

    // Actualizar el ticket
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
