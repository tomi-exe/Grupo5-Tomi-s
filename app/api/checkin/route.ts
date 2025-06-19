// File: app/api/checkin/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import TicketModel from "@/models/Ticket";
import EventModel from "@/models/Event";
import jwt from "jsonwebtoken";
import { getSession } from "@/app/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  await connectToDB();

  // 1) Verificar sesión
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "No autorizado" },
      { status: 401 }
    );
  }

  // 2) Leer y verificar JWT del QR
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Token ausente" },
      { status: 400 }
    );
  }

  let payload: { id: string; eventName: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as any;
  } catch (err: any) {
    const message =
      err.name === "TokenExpiredError" ? "Token expirado" : "Token inválido";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

  // 3) Buscar el ticket usando findById
  //    —cast a any para evitar el TS overload error—
  const ticket = await (TicketModel as any).findById(payload.id);
  if (!ticket) {
    return NextResponse.json(
      { success: false, message: "Ticket no encontrado" },
      { status: 404 }
    );
  }

  // 4) Ya usado?
  if (ticket.isUsed) {
    return NextResponse.json(
      { success: false, message: "Ticket ya usado" },
      { status: 409 }
    );
  }

  // 5) Marcar como usado
  ticket.isUsed = true;
  ticket.checkInDate = new Date();
  await ticket.save();

  // 6) Incrementar asistentes en el evento
  //    —de nuevo cast a any para silenciar TS—
  const event = await (EventModel as any)
    .findOne({ eventName: ticket.eventName })
    .exec();
  if (!event) {
    return NextResponse.json(
      { success: false, message: "Evento no encontrado" },
      { status: 404 }
    );
  }
  event.currentAttendees = (event.currentAttendees || 0) + 1;
  await event.save();

  // 7) Responder éxito
  return NextResponse.json(
    { success: true, message: "Check-in exitoso" },
    { status: 200 }
  );
}
