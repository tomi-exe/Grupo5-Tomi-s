// File: app/api/tickets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getSession } from "@/app/lib/auth";

interface Params {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: Params) {
  await connectToDB();

  // 1) Autenticación
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  // 2) Filtrar sólo los campos que permitimos mutar
  const { forSale, price, disp } = await request.json();
  const updates: Record<string, any> = {};
  if (forSale !== undefined) updates.forSale = forSale;
  if (price !== undefined) updates.price = price;
  if (disp !== undefined) updates.disp = disp;

  // 3) Comprobar propiedad y actualizar
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

  // 4) Responder uniformemente
  return NextResponse.json({ ticket: updated }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  await connectToDB();

  // 1) Autenticación
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  // 2) (Opcional) Deslistar en lugar de borrar:
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

  // 3) Responder uniformemente
  return NextResponse.json({ ticket: updated }, { status: 200 });
}
