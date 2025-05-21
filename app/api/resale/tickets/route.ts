import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";

// GET: Listar solo tickets activos en reventa
export async function GET() {
  await connectToDB();
  const tickets = await Ticket.find({ forSale: true });
  return NextResponse.json({ tickets });
}

// POST: Publicar nueva reventa (marca forSale=true)
export async function POST(request: NextRequest) {
  await connectToDB();
  const data = await request.json();
  const { eventName, eventDate, price, userId } = data;
  // Validar campos necesarios
  if (!eventName || !eventDate || price == null || !userId) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }
  const ticket = await Ticket.create({
    eventName,
    eventDate: new Date(eventDate),
    price,
    userId,
    forSale: true,
  });
  return NextResponse.json(ticket, { status: 201 });
}
