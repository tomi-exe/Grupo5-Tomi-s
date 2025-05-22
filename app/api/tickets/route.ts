// File: app/api/tickets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";

/**
 * POST: Registrar un nuevo ticket para el usuario autenticado
 */
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    // Llamada a getSession sin argumentos, según la firma existente
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const {
      eventName,
      eventDate,
      price,
      disp = 1,
    }: {
      eventName?: string;
      eventDate?: string;
      price?: number;
      disp?: number;
    } = await request.json();

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
    });
    await ticket.save();

    return NextResponse.json(
      { message: "Compra registrada con éxito", ticket },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar ticket:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

/**
 * GET: Obtener tickets del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    // Llamada a getSession sin argumentos, según la firma existente
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const tickets = await Ticket.find({ userId: session.user.id });
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
