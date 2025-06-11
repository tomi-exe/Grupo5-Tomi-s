import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CheckInService } from "@/app/lib/checkInService";
import Event from "@/models/Event";
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
      return NextResponse.json(
        { message: "No autorizado" }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get("eventName");

    if (!eventName) {
      return NextResponse.json(
        { message: "Nombre del evento es requerido" },
        { status: 400 }
      );
    }

    // Obtener estadísticas de capacidad
    const capacityStats = await CheckInService.getEventCapacityStats(eventName);

    if (!capacityStats) {
      return NextResponse.json(
        { message: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      eventName: capacityStats.event.eventName,
      capacity: {
        maximum: capacityStats.event.maxCapacity,
        current: capacityStats.event.currentCheckedIn,
        available: capacityStats.event.availableCapacity,
        occupancyPercentage: capacityStats.event.occupancyPercentage,
        isFull: capacityStats.event.isFull
      },
      event: {
        date: capacityStats.event.eventDate,
        status: capacityStats.event.status
      },
      checkInStats: capacityStats.checkInStats
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
      return NextResponse.json(
        { message: "No autorizado" }, 
        { status: 401 }
      );
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
    const events = await Event.find({
      eventName: { $in: eventNames }
    }).select('eventName maxCapacity currentCheckedIn eventDate status');

    const capacityInfo = events.map(event => ({
      eventName: event.eventName,
      capacity: {
        maximum: event.maxCapacity,
        current: event.currentCheckedIn,
        available: event.availableCapacity,
        occupancyPercentage: event.occupancyPercentage,
        isFull: event.isFull
      },
      event: {
        date: event.eventDate,
        status: event.status
      }
    }));

    return NextResponse.json({
      events: capacityInfo,
      summary: {
        totalEvents: capacityInfo.length,
        fullEvents: capacityInfo.filter(e => e.capacity.isFull).length,
        totalCapacity: capacityInfo.reduce((sum, e) => sum + e.capacity.maximum, 0),
        totalCheckedIn: capacityInfo.reduce((sum, e) => sum + e.capacity.current, 0),
        averageOccupancy: Math.round(
          capacityInfo.reduce((sum, e) => sum + e.capacity.occupancyPercentage, 0) / capacityInfo.length
        )
      }
    });

  } catch (error) {
    console.error("Error en /api/events/capacity POST:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}