import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Ticket from "@/models/Ticket";
import { connectToDB } from "@/app/lib/mongodb";
// PUT: Modificar ticket
export async function PUT(req: NextRequest) {
  await connectToDB();
  const { id, ...update } = await req.json();
  const ticket = await Ticket.findByIdAndUpdate(id, update, { new: true });
  if (!ticket)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(ticket);
}

// DELETE: Eliminar ticket
export async function DELETE(req: NextRequest) {
  await connectToDB();
  const { id } = await req.json();
  const ticket = await Ticket.findByIdAndDelete(id);
  if (!ticket)
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}
