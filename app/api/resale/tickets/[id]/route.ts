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

    // ✅ Notificación segura por consola
    const accion = forSale === true ? "puesto en venta" : "retirado del mercado";
    const fecha = updated.eventDate
      ? new Date(updated.eventDate).toLocaleString("es-CL")
      : "fecha no disponible";

    console.log(`📢 Notificación: Tu ticket para "${updated.eventName}" (${fecha}) ha sido ${accion}.`);

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

    // ✅ Notificación segura por consola
    const fecha = updated.eventDate
      ? new Date(updated.eventDate).toLocaleString("es-CL")
      : "fecha no disponible";

    console.log(`📢 Notificación: Tu ticket para "${updated.eventName}" (${fecha}) ha sido retirado del mercado.`);

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    console.error("Error en DELETE /api/tickets/[id]:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

