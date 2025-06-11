import { NextRequest } from "next/server";
import { connectToDB } from "@/app/lib/db-utils";
import Event, { type IEvent } from "@/models/Event";
import CheckIn, { type ICheckIn } from "@/models/CheckIn";
import Ticket, { type ITicket } from "@/models/Ticket";
import User from "@/models/User";
import mongoose from "mongoose";

interface CheckInData {
  ticketId: string;
  userId: string;
  verificationMethod?: 'qr_scan' | 'manual' | 'nfc';
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  verifiedBy?: string;
  request?: NextRequest;
}

interface CheckInResult {
  success: boolean;
  message: string;
  data?: {
    checkInId: string;
    eventName: string;
    checkInTime: Date;
    capacityInfo: {
      currentCheckedIn: number;
      maxCapacity: number;
      remainingCapacity: number;
      occupancyPercentage: number;
    };
  };
  error?: string;
}

export class CheckInService {
  /**
   * Procesa un check-in con validación de aforo
   */
  static async processCheckIn(data: CheckInData): Promise<CheckInResult> {
    const session = await mongoose.startSession();
    
    try {
      await connectToDB();
      
      const result = await session.withTransaction(async () => {
        // 1. Validar que el ticket existe y obtener información del evento
        const ticket = await Ticket.findById(data.ticketId)
          .populate('currentOwnerId', 'name email')
          .session(session);
          
        if (!ticket) {
          throw new Error('Ticket no encontrado');
        }
        
        // 2. Verificar que el usuario es el propietario actual del ticket
        if (ticket.currentOwnerId._id.toString() !== data.userId) {
          throw new Error('No tienes autorización para usar este ticket');
        }
        
        // 3. Verificar que el ticket no ha sido usado
        if (ticket.isUsed || ticket.status === 'used') {
          throw new Error('Este ticket ya ha sido utilizado');
        }
        
        // 4. Verificar si ya se hizo check-in con este ticket
        const existingCheckIn = await CheckIn.isTicketAlreadyCheckedIn(data.ticketId);
        if (existingCheckIn) {
          throw new Error('Ya se ha realizado check-in con este ticket');
        }
        
        // 5. Buscar o crear el evento
        let event: IEvent | null = await Event.findByEventName(ticket.eventName).session(session);
        
        if (!event) {
          event = new Event({
            eventName: ticket.eventName,
            eventDate: ticket.eventDate,
            location: "Ubicación por determinar", // Podrías obtener esto de otra fuente
            maxCapacity: ticket.disp || 1000, // Usar disponibilidad del ticket como capacidad inicial
            currentCheckedIn: 0,
            basePrice: ticket.originalPrice || ticket.price,
            status: this.getEventStatus(ticket.eventDate)
          });
          await event.save({ session });
        }
        
        // 6. Verificar que el evento permite check-ins
        if (!event.isCheckInAllowed()) {
          if (event.isFull) {
            throw new Error(`El evento "${event.eventName}" ha alcanzado su capacidad máxima (${event.maxCapacity} personas)`);
          }
          if (event.status !== 'upcoming') {
            throw new Error(`No se permite check-in para eventos con estado: ${event.status}`);
          }
        }
        
        // 7. Verificar fecha del evento (no permitir check-in muy temprano)
        const eventDate = new Date(event.eventDate);
        const now = new Date();
        const timeDiff = eventDate.getTime() - now.getTime();
        const hoursUntilEvent = timeDiff / (1000 * 60 * 60);
        
        // Permitir check-in solo 4 horas antes del evento
        if (hoursUntilEvent > 4) {
          throw new Error(`El check-in estará disponible 4 horas antes del evento. Faltan ${Math.round(hoursUntilEvent)} horas.`);
        }
        
        // 8. Crear el registro de check-in
        const checkInData = {
          ticketId: ticket._id,
          eventId: (event._id as mongoose.Types.ObjectId),
          userId: data.userId,
          verificationMethod: data.verificationMethod || 'qr_scan',
          location: data.location,
          notes: data.notes,
          verifiedBy: data.verifiedBy,
          ipAddress: data.request ? this.getClientIP(data.request) : null,
          userAgent: data.request ? data.request.headers.get("user-agent") : null,
          status: 'successful'
        };
        
        const checkIn = new CheckIn(checkInData);
        await checkIn.save({ session });
        
        // 9. Actualizar el aforo del evento (incrementar check-ins)
        await event.checkIn();
        
        // 10. Marcar el ticket como usado
        ticket.isUsed = true;
        ticket.status = 'used';
        await ticket.save({ session });
        
        // 11. Registrar log de auditoría
        console.log(`✅ Check-in exitoso: Usuario ${data.userId} para evento "${event.eventName}" (${event.currentCheckedIn}/${event.maxCapacity})`);
        
        return {
          success: true,
          message: "Check-in realizado exitosamente",
          data: {
            checkInId: (checkIn._id as mongoose.Types.ObjectId).toString(),
            eventName: event.eventName,
            checkInTime: checkIn.checkInTime,
            capacityInfo: {
              currentCheckedIn: event.currentCheckedIn,
              maxCapacity: event.maxCapacity,
              remainingCapacity: event.availableCapacity,
              occupancyPercentage: event.occupancyPercentage
            }
          }
        };
      });
      
      return result;
      
    } catch (error: unknown) {
      console.error("Error en check-in:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Crear registro de check-in fallido para auditoría
      try {
        await CheckIn.create({
          ticketId: data.ticketId,
          eventId: null, // No pudimos determinar el evento
          userId: data.userId,
          verificationMethod: data.verificationMethod || 'qr_scan',
          status: 'failed',
          notes: `Error: ${errorMessage}`,
          ipAddress: data.request ? this.getClientIP(data.request) : null,
          userAgent: data.request ? data.request.headers.get("user-agent") : null
        });
      } catch (logError: unknown) {
        const logErrorMessage = logError instanceof Error ? logError.message : 'Error desconocido';
        console.error("Error registrando check-in fallido:", logErrorMessage);
      }
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Obtiene estadísticas de capacidad de un evento
   */
  static async getEventCapacityStats(eventName: string) {
    try {
      await connectToDB();
      
      const event: IEvent | null = await Event.findByEventName(eventName);
      if (!event) {
        return null;
      }
      
      const checkInStats = await CheckIn.getEventCheckInStats((event._id as mongoose.Types.ObjectId).toString());
      
      return {
        event: {
          eventName: event.eventName,
          eventDate: event.eventDate,
          maxCapacity: event.maxCapacity,
          currentCheckedIn: event.currentCheckedIn,
          availableCapacity: event.availableCapacity,
          occupancyPercentage: event.occupancyPercentage,
          isFull: event.isFull,
          status: event.status
        },
        checkInStats
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error obteniendo estadísticas de capacidad:", errorMessage);
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Valida si un ticket puede hacer check-in
   */
  static async validateCheckInEligibility(ticketId: string, userId: string) {
    try {
      await connectToDB();
      
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return { eligible: false, reason: "Ticket no encontrado" };
      }
      
      if (ticket.currentOwnerId?.toString() !== userId && ticket.userId.toString() !== userId) {
        return { eligible: false, reason: "No autorizado para este ticket" };
      }
      
      if (ticket.isUsed || ticket.status === 'used') {
        return { eligible: false, reason: "Ticket ya utilizado" };
      }
      
      const existingCheckIn = await CheckIn.isTicketAlreadyCheckedIn(ticketId);
      if (existingCheckIn) {
        return { eligible: false, reason: "Ya se realizó check-in con este ticket" };
      }
      
      const event = await Event.findByEventName(ticket.eventName);
      if (event && !event.isCheckInAllowed()) {
        if (event.isFull) {
          return { eligible: false, reason: `Evento lleno (${event.currentCheckedIn}/${event.maxCapacity})` };
        }
        return { eligible: false, reason: `Estado del evento no permite check-in: ${event.status}` };
      }
      
      return { eligible: true, reason: "Ticket elegible para check-in" };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error("Error validando elegibilidad:", errorMessage);
      return { eligible: false, reason: "Error de validación" };
    }
  }
  
  /**
   * Obtiene la IP del cliente de la request
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    return "unknown";
  }
  
  /**
   * Determina el estado del evento basado en la fecha
   */
  private static getEventStatus(eventDate: Date): 'upcoming' | 'ongoing' | 'completed' {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    // Considerar que un evento dura aproximadamente 4 horas
    const eventEndTime = new Date(eventDateTime.getTime() + (4 * 60 * 60 * 1000));
    
    if (now < eventDateTime) {
      return 'upcoming';
    } else if (now >= eventDateTime && now <= eventEndTime) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }
}