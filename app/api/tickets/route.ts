import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { event, price } = await req.json();
    if (!event || !price) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    const ticket = new Ticket({
      event,
      price,
      userId: session.user.id,
    });

    await ticket.save();

    return NextResponse.json({ message: "Compra registrada con éxito", ticket });
  } catch (error) {
    console.error("Error al registrar ticket:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const tickets = await Ticket.find({ userId: session.user.id });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}


