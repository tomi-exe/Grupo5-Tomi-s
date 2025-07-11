import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";

// GET: Listar solo tickets activos en reventa
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  await connectToDB();
  const tickets = await Ticket.find({ forSale: true });
  return NextResponse.json({ tickets });
}

// POST: Publicar nueva reventa (marca forSale=true)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
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
