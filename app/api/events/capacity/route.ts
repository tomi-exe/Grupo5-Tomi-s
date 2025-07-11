import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import Event from "@/models/Event"; // Ensure this is the Mongoose model, not a TypeScript type
import { connectToDB } from "@/app/lib/db-utils";

/**
 * GET: Obtener información de capacidad de un evento
 * Query params: eventName (requerido)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get("eventName");

    if (!eventName) {
      return NextResponse.json(
        { message: "Nombre del evento es requerido" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Buscar el evento por nombre
    const event = await (Event as any)
      .findOne({ eventName })
      .select("eventName maxCapacity currentCheckedIn eventDate status");

    if (!event) {
      return NextResponse.json(
        { message: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Calcular información de capacidad
    const availableCapacity = event.maxCapacity - event.currentCheckedIn;
    const occupancyPercentage = Math.round(
      (event.currentCheckedIn / event.maxCapacity) * 100
    );
    const isFull = event.currentCheckedIn >= event.maxCapacity;

    return NextResponse.json({
      eventName: event.eventName,
      capacity: {
        maximum: event.maxCapacity,
        current: event.currentCheckedIn,
        available: availableCapacity,
        occupancyPercentage,
        isFull,
      },
      event: {
        date: event.eventDate,
        status: event.status,
      },
    });
  } catch (error) {
    console.error("Error en /api/events/capacity GET:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST: Obtener capacidad de múltiples eventos
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { eventNames } = body;

    if (!Array.isArray(eventNames) || eventNames.length === 0) {
      return NextResponse.json(
        { message: "Lista de nombres de eventos es requerida" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Obtener información de capacidad para múltiples eventos
    // Ensure Event is the Mongoose model, not a type
    const events = await (Event as any)
      .find({
        eventName: { $in: eventNames },
      })
      .select("eventName maxCapacity currentCheckedIn eventDate status");

    type EventDoc = {
      eventName: string;
      maxCapacity: number;
      currentCheckedIn: number;
      availableCapacity: number;
      occupancyPercentage: number;
      isFull: boolean;
      eventDate: Date;
      status: string;
    };

    const capacityInfo = events.map((event: EventDoc) => ({
      eventName: event.eventName,
      capacity: {
        maximum: event.maxCapacity,
        current: event.currentCheckedIn,
        available: event.availableCapacity,
        occupancyPercentage: event.occupancyPercentage,
        isFull: event.isFull,
      },
      event: {
        date: event.eventDate,
        status: event.status,
      },
    }));

    return NextResponse.json({
      events: capacityInfo,
      summary: {
        totalEvents: capacityInfo.length,
        fullEvents: capacityInfo.filter(
          (e: (typeof capacityInfo)[0]) => e.capacity.isFull
        ).length,
        totalCapacity: capacityInfo.reduce(
          (sum: number, e: (typeof capacityInfo)[0]) =>
            sum + e.capacity.maximum,
          0
        ),
        totalCheckedIn: capacityInfo.reduce(
          (sum: number, e: (typeof capacityInfo)[0]) =>
            sum + e.capacity.current,
          0
        ),
        averageOccupancy: Math.round(
          capacityInfo.reduce(
            (sum: number, e: (typeof capacityInfo)[0]) =>
              sum + e.capacity.occupancyPercentage,
            0
          ) / capacityInfo.length
        ),
      },
    });
  } catch (error) {
    console.error("Error en /api/events/capacity POST:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
