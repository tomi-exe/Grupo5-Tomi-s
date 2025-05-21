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
