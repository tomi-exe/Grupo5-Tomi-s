import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Ticket from "@/models/Ticket";

// Conexión a la base de datos (ajusta si tienes un helper)
const MONGODB_URI = process.env.MONGODB_URI || "";
async function dbConnect() {
  if (mongoose.connection.readyState < 1) {
    await mongoose.connect(MONGODB_URI);
  }
}

// GET: Listar tickets
export async function GET() {
  await dbConnect();
  const tickets = await Ticket.find({});
  return NextResponse.json({ tickets });
}

// POST: Crear ticket
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const ticket = await Ticket.create(body);
  return NextResponse.json(ticket, { status: 201 });
}

// PUT: Modificar ticket
export async function PUT(req: NextRequest) {
  await dbConnect();
  const { id, ...update } = await req.json();
  const ticket = await Ticket.findByIdAndUpdate(id, update, { new: true });
  if (!ticket)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(ticket);
}

// DELETE: Eliminar ticket
export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { id } = await req.json();
  const ticket = await Ticket.findByIdAndDelete(id);
  if (!ticket)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}
