// File: app/api/tickets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";

interface Params {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Sólo permitimos cambiar forSale (y opcionalmente price/disp)
    const { forSale, price, disp } = await request.json();
    const updates: any = {};
    if (forSale !== undefined) updates.forSale = forSale;
    if (price !== undefined) updates.price = price;
    if (disp !== undefined) updates.disp = disp;

    const updated = await Ticket.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      updates,
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { message: "Ticket no encontrado o no eres propietario" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ticket: updated });
  } catch (err) {
    console.error("Error en PUT /api/tickets/[id]:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Marcar forSale=false en lugar de borrar:
    const updated = await Ticket.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { forSale: false },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json(
        { message: "Ticket no encontrado o no eres propietario" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ticket: updated });
  } catch (err) {
    console.error("Error en DELETE /api/tickets/[id]:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
