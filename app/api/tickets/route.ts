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
    // Asegura conexión a MongoDB
    await connectToDB();

    // Log del body para depuración
    const body = await request.clone().json();
    console.log("POST /api/tickets body:", body);

    // Obtener sesión de usuario
    const session = await getSession();
    console.log("Session en POST /api/tickets:", session);
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Extraer y validar campos
    const { eventName, eventDate, price, disp = 1 } = body;
    if (!eventName || !eventDate || price == null) {
      console.warn("POST /api/tickets datos incompletos", body);
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Crear y guardar el ticket
    const ticket = new Ticket({
      eventName,
      eventDate: new Date(eventDate),
      price,
      disp,
      userId: session.user.id,
      forSale: false,
    });
    await ticket.save();
    console.log("Ticket guardado:", ticket);

    // Responder con éxito
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
    // Asegura conexión a MongoDB
    await connectToDB();

    // Obtener sesión de usuario
    const session = await getSession();
    console.log("Session en GET /api/tickets:", session);
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Consultar tickets del usuario
    const tickets = await Ticket.find({ userId: session.user.id });
    console.log("Tickets encontrados:", tickets);

    // Responder con lista de tickets
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
