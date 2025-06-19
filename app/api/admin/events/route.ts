import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { connectToDB } from "@/app/lib/db-utils";
import User from "@/models/User";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";

// Interfaces para tipado
interface TicketStats {
  totalTickets: number;
  soldTickets: number;
  usedTickets: number;
  forSaleTickets: number;
  totalRevenue: number;
  averagePrice: number;
}

interface EventWithStats {
  _id: string;
  eventName: string;
  eventDate: string;
  location: string;
  description?: string;
  maxCapacity: number;
  currentCheckedIn: number;
  basePrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  occupancyPercentage: number;
  availableCapacity: number;
  isFull: boolean;
  ticketStats?: TicketStats;
}

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  totalCapacity: number;
  totalCheckedIn: number;
  averageOccupancy: number;
}

/**
 * GET: Obtener todos los eventos para administradores
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    await connectToDB();

    // Verificar si el usuario es administrador
    const user = await User.findById(session.user.id);
    if (user?.role !== 'admin') {
      return NextResponse.json({ message: "Acceso denegado - Solo administradores" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("includeStats") === "true";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Construir filtros
    let query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Obtener eventos con paginación
    const events = await Event.find(query)
      .sort({ eventDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Procesar eventos y agregar estadísticas si se solicita
    let eventsWithStats: EventWithStats[] = [];

    if (includeStats) {
      // Procesar eventos con estadísticas
      eventsWithStats = await Promise.all(
        events.map(async (event) => {
          try {
            // Obtener estadísticas de tickets para cada evento
            const ticketStats = await Ticket.aggregate([
              { $match: { eventName: new RegExp(event.eventName, 'i') } },
              {
                $group: {
                  _id: null,
                  totalTickets: { $sum: 1 },
                  soldTickets: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
                  usedTickets: { $sum: { $cond: [{ $eq: ["$isUsed", true] }, 1, 0] } },
                  forSaleTickets: { $sum: { $cond: [{ $eq: ["$forSale", true] }, 1, 0] } },
                  totalRevenue: { $sum: "$price" },
                  averagePrice: { $avg: "$price" }
                }
              }
            ]);

            const stats: TicketStats = ticketStats[0] || {
              totalTickets: 0,
              soldTickets: 0,
              usedTickets: 0,
              forSaleTickets: 0,
              totalRevenue: 0,
              averagePrice: 0
            };

            // Calcular campos virtuales manualmente
            const occupancyPercentage = event.maxCapacity > 0 
              ? Math.round((event.currentCheckedIn / event.maxCapacity) * 100)
              : 0;
            const availableCapacity = Math.max(0, event.maxCapacity - event.currentCheckedIn);
            const isFull = event.currentCheckedIn >= event.maxCapacity;

            // Convertir tipos de manera segura
            const eventId = event._id instanceof mongoose.Types.ObjectId 
              ? event._id.toString() 
              : String(event._id);

            const eventData: EventWithStats = {
              _id: eventId,
              eventName: event.eventName,
              eventDate: event.eventDate.toISOString(),
              location: event.location,
              description: event.description,
              maxCapacity: event.maxCapacity,
              currentCheckedIn: event.currentCheckedIn,
              basePrice: event.basePrice,
              status: event.status,
              createdAt: event.createdAt.toISOString(),
              updatedAt: event.updatedAt.toISOString(),
              occupancyPercentage,
              availableCapacity,
              isFull,
              ticketStats: stats
            };

            return eventData;
          } catch (error) {
            console.error(`Error getting stats for ${event.eventName}:`, error);
            
            // Retornar evento sin estadísticas en caso de error
            const eventId = event._id instanceof mongoose.Types.ObjectId 
              ? event._id.toString() 
              : String(event._id);

            const eventData: EventWithStats = {
              _id: eventId,
              eventName: event.eventName,
              eventDate: event.eventDate.toISOString(),
              location: event.location,
              description: event.description,
              maxCapacity: event.maxCapacity,
              currentCheckedIn: event.currentCheckedIn,
              basePrice: event.basePrice,
              status: event.status,
              createdAt: event.createdAt.toISOString(),
              updatedAt: event.updatedAt.toISOString(),
              occupancyPercentage: 0,
              availableCapacity: event.maxCapacity,
              isFull: false
            };

            return eventData;
          }
        })
      );
    } else {
      // Procesar eventos sin estadísticas
      eventsWithStats = events.map(event => {
        const occupancyPercentage = event.maxCapacity > 0 
          ? Math.round((event.currentCheckedIn / event.maxCapacity) * 100)
          : 0;
        const availableCapacity = Math.max(0, event.maxCapacity - event.currentCheckedIn);
        const isFull = event.currentCheckedIn >= event.maxCapacity;

        // Convertir tipos de manera segura
        const eventId = event._id instanceof mongoose.Types.ObjectId 
          ? event._id.toString() 
          : String(event._id);

        const eventData: EventWithStats = {
          _id: eventId,
          eventName: event.eventName,
          eventDate: event.eventDate.toISOString(),
          location: event.location,
          description: event.description,
          maxCapacity: event.maxCapacity,
          currentCheckedIn: event.currentCheckedIn,
          basePrice: event.basePrice,
          status: event.status,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
          occupancyPercentage,
          availableCapacity,
          isFull
        };

        return eventData;
      });
    }

    // Contar total para paginación
    const total = await Event.countDocuments(query);

    // Obtener estadísticas generales de eventos
    const eventStatsResult = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          upcomingEvents: {
            $sum: { $cond: [{ $eq: ["$status", "upcoming"] }, 1, 0] }
          },
          ongoingEvents: {
            $sum: { $cond: [{ $eq: ["$status", "ongoing"] }, 1, 0] }
          },
          completedEvents: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          totalCapacity: { $sum: "$maxCapacity" },
          totalCheckedIn: { $sum: "$currentCheckedIn" },
          averageOccupancy: { 
            $avg: { 
              $cond: [
                { $gt: ["$maxCapacity", 0] },
                { $multiply: [{ $divide: ["$currentCheckedIn", "$maxCapacity"] }, 100] },
                0
              ]
            }
          }
        }
      }
    ]);

    const eventStats: EventStats = eventStatsResult[0] || {
      totalEvents: 0,
      upcomingEvents: 0,
      ongoingEvents: 0,
      completedEvents: 0,
      totalCapacity: 0,
      totalCheckedIn: 0,
      averageOccupancy: 0
    };

    return NextResponse.json({
      events: eventsWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      stats: eventStats
    });

  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST: Crear un nuevo evento (solo para administradores)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    await connectToDB();

    // Verificar si el usuario es administrador
    const user = await User.findById(session.user.id);
    if (user?.role !== 'admin') {
      return NextResponse.json({ message: "Acceso denegado - Solo administradores" }, { status: 403 });
    }

    const body = await request.json();
    const {
      eventName,
      eventDate,
      location,
      description,
      maxCapacity,
      basePrice
    }: {
      eventName: string;
      eventDate: string;
      location: string;
      description?: string;
      maxCapacity: number;
      basePrice: number;
    } = body;

    // Validaciones básicas
    if (!eventName || !eventDate || !location || !maxCapacity || basePrice === undefined) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar tipos de datos
    if (typeof eventName !== 'string' || typeof location !== 'string') {
      return NextResponse.json(
        { message: "Nombre del evento y ubicación deben ser texto" },
        { status: 400 }
      );
    }

    if (typeof maxCapacity !== 'number' || maxCapacity < 1) {
      return NextResponse.json(
        { message: "La capacidad máxima debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    if (typeof basePrice !== 'number' || basePrice < 0) {
      return NextResponse.json(
        { message: "El precio base debe ser un número mayor o igual a 0" },
        { status: 400 }
      );
    }

    // Verificar que el nombre del evento sea único
    const existingEvent = await Event.findOne({ 
      eventName: new RegExp(`^${eventName.trim()}$`, 'i') 
    });
    
    if (existingEvent) {
      return NextResponse.json(
        { message: "Ya existe un evento con ese nombre" },
        { status: 409 }
      );
    }

    // Validar fecha futura
    const eventDateTime = new Date(eventDate);
    if (isNaN(eventDateTime.getTime())) {
      return NextResponse.json(
        { message: "Fecha del evento inválida" },
        { status: 400 }
      );
    }

    if (eventDateTime <= new Date()) {
      return NextResponse.json(
        { message: "La fecha del evento debe ser futura" },
        { status: 400 }
      );
    }

    // Crear el evento
    const event = new Event({
      eventName: eventName.trim(),
      eventDate: eventDateTime,
      location: location.trim(),
      description: description?.trim(),
      maxCapacity: parseInt(maxCapacity.toString()),
      basePrice: parseFloat(basePrice.toString()),
      status: 'upcoming'
    });

    await event.save();

    // Crear respuesta con formato consistente
    const eventId = event._id instanceof mongoose.Types.ObjectId 
      ? event._id.toString() 
      : String(event._id);

    const eventResponse: EventWithStats = {
      _id: eventId,
      eventName: event.eventName,
      eventDate: event.eventDate.toISOString(),
      location: event.location,
      description: event.description,
      maxCapacity: event.maxCapacity,
      currentCheckedIn: event.currentCheckedIn,
      basePrice: event.basePrice,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      occupancyPercentage: 0,
      availableCapacity: event.maxCapacity,
      isFull: false
    };

    return NextResponse.json({
      message: "Evento creado exitosamente",
      event: eventResponse
    }, { status: 201 });

  } catch (error) {
    console.error("Error creando evento:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}