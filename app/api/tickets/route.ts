import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";

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
      forSale: false,
      transferDate: null, // <-- Se inicializa en null al crear
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

    const tickets = await Ticket.find({ userId: session.user.id });
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

    if (ticket.userId.toString() !== session.user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    ticket.userId = newUserId;
    ticket.forSale = false;
    ticket.transferDate = new Date(); // <-- Guarda la fecha de transferencia
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
