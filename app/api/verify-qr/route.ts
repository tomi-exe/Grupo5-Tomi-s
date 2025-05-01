import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket"; // Ajusta el import según tu estructura

// app/api/verify-qr/route.ts
export async function POST(req: Request) {
  try {
    const { _id } = await req.json();
    if (!_id) {
      return NextResponse.json(
        { valid: false, message: "Ticket inválido" },
        { status: 400 }
      );
    }
    await connectToDB();
    const ticket = await Ticket.findById(_id);
    if (!ticket) {
      return NextResponse.json(
        { valid: false, message: "Ticket no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ valid: true, ticket });
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Error interno" },
      { status: 500 }
    );
  }
}
