import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CheckInService } from "@/app/lib/checkInService";
import Event from "@/models/Event";
import CheckIn from "@/models/CheckIn";
import { connectToDB } from "@/app/lib/db-utils";

/**
 * GET: Endpoint para Server-Sent Events (SSE) para actualizaciones en tiempo real
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de organizador
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "No autorizado" }, 
        { status: 401 }
      );
    }

    // TODO: Verificar que el usuario tiene permisos de organizador
    // const user = await User.findById(session.user.id);
    // if (user.role !== 'organizer' && user.role !== 'admin') {
    //   return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const eventNames = searchParams.get("events")?.split(",") || [];

    // Configurar headers para SSE
    const responseHeaders = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Crear un ReadableStream para SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Función para enviar datos
        const sendData = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Enviar datos iniciales
        try {
          await connectToDB();
          
          const events = await Event.find({
            eventName: { $in: eventNames }
          }).select('eventName maxCapacity currentCheckedIn eventDate status');

          const initialData = events.map(event => ({
            eventName: event.eventName,
            capacity: {
              maximum: event.maxCapacity,
              current: event.currentCheckedIn,
              available: event.maxCapacity - event.currentCheckedIn,
              occupancyPercentage: Math.round((event.currentCheckedIn / event.maxCapacity) * 100),
              isFull: event.currentCheckedIn >= event.maxCapacity
            },
            timestamp: new Date().toISOString(),
            type: 'initial'
          }));

          sendData({
            type: 'initial',
            events: initialData,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Error sending initial data:', error);
          sendData({
            type: 'error',
            message: 'Error loading initial data',
            timestamp: new Date().toISOString()
          });
        }

        // Configurar polling para actualizaciones (en una implementación real usarías WebSockets o Database Change Streams)
        const pollInterval = setInterval(async () => {
          try {
            const events = await Event.find({
              eventName: { $in: eventNames }
            }).select('eventName maxCapacity currentCheckedIn eventDate status');

            const updateData = events.map(event => ({
              eventName: event.eventName,
              capacity: {
                maximum: event.maxCapacity,
                current: event.currentCheckedIn,
                available: event.maxCapacity - event.currentCheckedIn,
                occupancyPercentage: Math.round((event.currentCheckedIn / event.maxCapacity) * 100),
                isFull: event.currentCheckedIn >= event.maxCapacity
              },
              timestamp: new Date().toISOString(),
              type: 'update'
            }));

            sendData({
              type: 'update',
              events: updateData,
              timestamp: new Date().toISOString()
            });

            // Enviar heartbeat para mantener la conexión
            sendData({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            });

          } catch (error) {
            console.error('Error in polling:', error);
            sendData({
              type: 'error',
              message: 'Error polling for updates',
              timestamp: new Date().toISOString()
            });
          }
        }, 5000); // Actualizar cada 5 segundos

        // Cleanup cuando se cierre la conexión
        request.signal.addEventListener('abort', () => {
          clearInterval(pollInterval);
          controller.close();
        });
      }
    });

    return new Response(stream, { headers: responseHeaders });

  } catch (error) {
    console.error("Error en /api/events/realtime:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST: Obtener snapshot actual de múltiples eventos para el dashboard
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "No autorizado" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventNames, includeStats = false } = body;

    if (!Array.isArray(eventNames) || eventNames.length === 0) {
      return NextResponse.json(
        { message: "Lista de nombres de eventos es requerida" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Obtener eventos con información básica
    const events = await Event.find({
      eventName: { $in: eventNames }
    }).select('eventName maxCapacity currentCheckedIn eventDate status createdAt updatedAt');

    const eventsData = await Promise.all(
      events.map(async (event) => {
        const basicInfo = {
          eventName: event.eventName,
          capacity: {
            maximum: event.maxCapacity,
            current: event.currentCheckedIn,
            available: event.maxCapacity - event.currentCheckedIn,
            occupancyPercentage: Math.round((event.currentCheckedIn / event.maxCapacity) * 100),
            isFull: event.currentCheckedIn >= event.maxCapacity
          },
          event: {
            date: event.eventDate,
            status: event.status,
            lastUpdated: (event as any).updatedAt || new Date() // Cast temporal para updatedAt
          }
        };

        // Incluir estadísticas detalladas si se solicitan
        if (includeStats) {
          try {
            const eventId = (event._id as any).toString();
            const checkInStats = await CheckIn.getEventCheckInStats(eventId);
            return {
              ...basicInfo,
              checkInStats
            };
          } catch (error) {
            console.error(`Error getting stats for ${event.eventName}:`, error);
            return basicInfo;
          }
        }

        return basicInfo;
      })
    );

    // Calcular estadísticas generales
    const totalEvents = eventsData.length;
    const totalCapacity = eventsData.reduce((sum, e) => sum + e.capacity.maximum, 0);
    const totalCheckedIn = eventsData.reduce((sum, e) => sum + e.capacity.current, 0);
    const fullEvents = eventsData.filter(e => e.capacity.isFull).length;
    const averageOccupancy = totalEvents > 0 
      ? Math.round(eventsData.reduce((sum, e) => sum + e.capacity.occupancyPercentage, 0) / totalEvents)
      : 0;

    // Detectar eventos que necesitan atención
    const alerts = eventsData
      .filter(e => e.capacity.occupancyPercentage >= 90)
      .map(e => ({
        eventName: e.eventName,
        type: e.capacity.isFull ? 'full' : 'near_full',
        occupancyPercentage: e.capacity.occupancyPercentage,
        available: e.capacity.available
      }));

    return NextResponse.json({
      events: eventsData,
      summary: {
        totalEvents,
        totalCapacity,
        totalCheckedIn,
        fullEvents,
        averageOccupancy,
        utilizationRate: totalCapacity > 0 ? Math.round((totalCheckedIn / totalCapacity) * 100) : 0
      },
      alerts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en /api/events/realtime POST:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}