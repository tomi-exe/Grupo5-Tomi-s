import { NextRequest } from "next/server";
import Transfer from "@/models/Transfer";
import type { ITransfer } from "@/models/Transfer";
import User from "@/models/User";
import Ticket from "@/models/Ticket";
import { connectToDB } from "./db-utils"; // Cambiar a la nueva utilidad

interface TransferData {
  ticketId: string;
  previousOwnerId: string;
  newOwnerId: string;
  transferType: "direct_transfer" | "resale_purchase" | "admin_transfer";
  transferPrice?: number;
  notes?: string;
  request?: NextRequest;
}

export class TransferService {
  /**
   * Registra una transferencia en el historial de auditoría
   */
  static async recordTransfer(data: TransferData): Promise<void> {
    try {
      await connectToDB();

      // Obtener información del ticket
      const ticket = await Ticket.findById(data.ticketId);
      if (!ticket) {
        throw new Error("Ticket no encontrado");
      }

      // Obtener información del propietario anterior
      const previousOwner = await User.findById(data.previousOwnerId);
      if (!previousOwner) {
        throw new Error("Propietario anterior no encontrado");
      }

      // Obtener información del nuevo propietario
      const newOwner = await User.findById(data.newOwnerId);
      if (!newOwner) {
        throw new Error("Nuevo propietario no encontrado");
      }

      // Extraer información de la request si está disponible
      let ipAddress = null;
      let userAgent = null;
      
      if (data.request) {
        ipAddress = this.getClientIP(data.request);
        userAgent = data.request.headers.get("user-agent") || null;
      }

      // Crear registro de transferencia
      const transfer = new Transfer({
        ticketId: data.ticketId,
        eventName: ticket.eventName,
        eventDate: ticket.eventDate,
        previousOwnerId: data.previousOwnerId,
        previousOwnerEmail: previousOwner.email,
        previousOwnerName: previousOwner.name,
        newOwnerId: data.newOwnerId,
        newOwnerEmail: newOwner.email,
        newOwnerName: newOwner.name,
        transferType: data.transferType,
        transferPrice: data.transferPrice || null,
        ipAddress,
        userAgent,
        notes: data.notes || null,
        status: "completed",
      });

      await transfer.save();

      console.log(`📋 Transferencia registrada: Ticket ${data.ticketId} de ${previousOwner.email} a ${newOwner.email}`);
    } catch (error) {
      console.error("Error registrando transferencia:", error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de transferencias de un ticket específico
   */
  static async getTicketTransferHistory(ticketId: string) {
    await connectToDB();
    
    return await Transfer.find({ ticketId })
      .sort({ transferDate: -1 })
      .populate("previousOwnerId", "name email")
      .populate("newOwnerId", "name email");
  }

  /**
   * Obtiene el historial de transferencias de un usuario
   */
  static async getUserTransferHistory(userId: string) {
    await connectToDB();
    
    return await Transfer.find({
      $or: [
        { previousOwnerId: userId },
        { newOwnerId: userId }
      ]
    })
      .sort({ transferDate: -1 })
      .populate("ticketId", "eventName eventDate")
      .populate("previousOwnerId", "name email")
      .populate("newOwnerId", "name email");
  }

  /**
   * Obtiene todas las transferencias para administradores
   */
  static async getAllTransfers(
    page: number = 1,
    limit: number = 50,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      transferType?: string;
      userId?: string;
    }
  ) {
    await connectToDB();

    // Construir filtros
    const query: any = {};
    
    if (filters?.startDate && filters?.endDate) {
      query.transferDate = {
        $gte: filters.startDate,
        $lte: filters.endDate
      };
    }
    
    if (filters?.transferType) {
      query.transferType = filters.transferType;
    }
    
    if (filters?.userId) {
      query.$or = [
        { previousOwnerId: filters.userId },
        { newOwnerId: filters.userId }
      ];
    }

    // Obtener transferencias con paginación
    const transfers = await Transfer.find(query)
      .sort({ transferDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("ticketId", "eventName eventDate")
      .populate("previousOwnerId", "name email")
      .populate("newOwnerId", "name email");

    // Contar total para paginación
    const total = await Transfer.countDocuments(query);

    return {
      transfers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Obtiene estadísticas de transferencias
   */
  static async getTransferStats(startDate?: Date, endDate?: Date) {
    await connectToDB();

    const matchFilter: any = {};
    if (startDate && endDate) {
      matchFilter.transferDate = { $gte: startDate, $lte: endDate };
    }

    const stats = await Transfer.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalTransfers: { $sum: 1 },
          directTransfers: {
            $sum: { $cond: [{ $eq: ["$transferType", "direct_transfer"] }, 1, 0] }
          },
          resaleTransfers: {
            $sum: { $cond: [{ $eq: ["$transferType", "resale_purchase"] }, 1, 0] }
          },
          adminTransfers: {
            $sum: { $cond: [{ $eq: ["$transferType", "admin_transfer"] }, 1, 0] }
          },
          totalResaleValue: {
            $sum: { $cond: [{ $eq: ["$transferType", "resale_purchase"] }, "$transferPrice", 0] }
          },
          averageResalePrice: {
            $avg: { $cond: [{ $eq: ["$transferType", "resale_purchase"] }, "$transferPrice", null] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalTransfers: 0,
      directTransfers: 0,
      resaleTransfers: 0,
      adminTransfers: 0,
      totalResaleValue: 0,
      averageResalePrice: 0
    };
  }

  /**
   * Extrae la IP del cliente de la request
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
}