import { NextRequest } from "next/server";
import { connectToDB } from "@/app/lib/db-utils";
import Coupon, { type ICoupon } from "@/models/Coupon";
import CouponUsage, { type ICouponUsage } from "@/models/CouponUsage";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";
import User from "@/models/User";
import mongoose from "mongoose";

interface CreateCouponData {
  eventId: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_item';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  maxUses: number;
  createdBy: string;
  targetAudience?: 'all_attendees' | 'vip_attendees' | 'early_birds' | 'specific_users';
  applicableItems?: string[];
  customCode?: string;
}

interface ValidateCouponResult {
  isValid: boolean;
  reason?: string;
  coupon?: ICoupon;
  discountAmount?: number;
}

interface ApplyCouponData {
  couponCode: string;
  userId: string;
  eventId: string;
  originalAmount: number;
  items?: string[];
  request?: NextRequest;
}

interface ApplyCouponResult {
  success: boolean;
  message: string;
  discountApplied: number;
  finalAmount: number;
  couponUsage?: ICouponUsage;
}

export class CouponService {
  /**
   * Crea un nuevo cupón asociado a un evento específico
   */
  static async createCoupon(data: CreateCouponData): Promise<ICoupon> {
    const session = await mongoose.startSession();
    
    try {
      await connectToDB();
      
      const result = await session.withTransaction(async () => {
        // Verificar que el evento existe
        const event = await Event.findById(data.eventId).session(session);
        if (!event) {
          throw new Error('Evento no encontrado');
        }
        
        // Verificar que el usuario creador existe
        const creator = await User.findById(data.createdBy).session(session);
        if (!creator) {
          throw new Error('Usuario creador no encontrado');
        }
        
        // Preparar datos del cupón
        const couponData = {
          ...data,
          eventName: event.eventName,
          code: data.customCode || undefined // Si no se proporciona, se genera automáticamente
        };
        
        // Crear el cupón
        const coupon = await Coupon.createEventCoupon(couponData);
        
        console.log(`✅ Cupón creado: ${coupon.code} para evento "${event.eventName}"`);
        
        return coupon;
      });
      
      return result;
      
    } catch (error: unknown) {
      console.error("Error creando cupón:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(errorMessage);
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Valida si un cupón puede ser usado por un usuario específico en un evento
   */
  static async validateCoupon(
    couponCode: string, 
    userId: string, 
    eventId: string, 
    purchaseAmount: number = 0
  ): Promise<ValidateCouponResult> {
    try {
      await connectToDB();
      
      // Buscar el cupón por código
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        isActive: true 
      });
      
      if (!coupon) {
        return {
          isValid: false,
          reason: "Cupón no encontrado o inactivo"
        };
      }
      
      // Verificar que el cupón pertenece al evento correcto
      if (!coupon.validateForEvent(eventId)) {
        return {
          isValid: false,
          reason: `Este cupón solo es válido para el evento "${coupon.eventName}"`
        };
      }
      
      // Verificar que el cupón está dentro del período válido
      if (!coupon.isValid) {
        if (coupon.isExpired) {
          return {
            isValid: false,
            reason: "Este cupón ha expirado"
          };
        }
        
        if (!coupon.hasUsesRemaining) {
          return {
            isValid: false,
            reason: "Este cupón ha alcanzado su límite de usos"
          };
        }
        
        return {
          isValid: false,
          reason: "Este cupón no está actualmente válido"
        };
      }
      
      // Verificar que el usuario puede usar este cupón
      const canUse = await coupon.canBeUsedBy(userId, eventId);
      if (!canUse) {
        return {
          isValid: false,
          reason: "No puedes usar este cupón. Verifica que tengas un ticket para este evento y no lo hayas usado antes."
        };
      }
      
      // Verificar monto mínimo de compra
      if (coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
        return {
          isValid: false,
          reason: `Este cupón requiere una compra mínima de $${coupon.minPurchaseAmount.toLocaleString()}`
        };
      }
      
      // Calcular descuento
      const discountAmount = this.calculateDiscount(coupon, purchaseAmount);
      
      return {
        isValid: true,
        coupon,
        discountAmount
      };
      
    } catch (error: unknown) {
      console.error("Error validando cupón:", error);
      return {
        isValid: false,
        reason: "Error interno al validar el cupón"
      };
    }
  }
  
  /**
   * Aplica un cupón a una compra
   */
  static async applyCoupon(data: ApplyCouponData): Promise<ApplyCouponResult> {
    const session = await mongoose.startSession();
    
    try {
      await connectToDB();
      
      const result = await session.withTransaction(async () => {
        // Validar el cupón
        const validation = await this.validateCoupon(
          data.couponCode,
          data.userId,
          data.eventId,
          data.originalAmount
        );
        
        if (!validation.isValid || !validation.coupon) {
          return {
            success: false,
            message: validation.reason || "Cupón inválido",
            discountApplied: 0,
            finalAmount: data.originalAmount
          };
        }
        
        const coupon = validation.coupon;
        const discountAmount = validation.discountAmount || 0;
        const finalAmount = Math.max(0, data.originalAmount - discountAmount);
        
        // Usar el cupón (incrementar contador de usos)
        await coupon.useCoupon(data.userId);
        
        // Crear registro de uso
        const couponUsage = new CouponUsage({
          couponId: coupon._id,
          userId: data.userId,
          eventId: data.eventId,
          discountApplied: discountAmount,
          originalAmount: data.originalAmount,
          finalAmount: finalAmount,
          usedAt: new Date(),
          ipAddress: data.request ? this.getClientIP(data.request) : null,
          userAgent: data.request ? data.request.headers.get("user-agent") : null
        });
        
        await couponUsage.save({ session });
        
        console.log(`💰 Cupón aplicado: ${coupon.code} - Descuento: $${discountAmount} - Usuario: ${data.userId}`);
        
        return {
          success: true,
          message: `Cupón "${coupon.code}" aplicado exitosamente`,
          discountApplied: discountAmount,
          finalAmount: finalAmount,
          couponUsage
        };
      });
      
      return result;
      
    } catch (error: unknown) {
      console.error("Error aplicando cupón:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return {
        success: false,
        message: errorMessage,
        discountApplied: 0,
        finalAmount: data.originalAmount
      };
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Obtiene cupones válidos para un evento específico
   */
  static async getEventCoupons(eventId: string, includeExpired: boolean = false) {
    try {
      await connectToDB();
      
      let query: any = { eventId: eventId };
      
      if (!includeExpired) {
        const now = new Date();
        query = {
          ...query,
          isActive: true,
          validFrom: { $lte: now },
          validUntil: { $gte: now }
        };
      }
      
      const coupons = await Coupon.find(query)
        .populate('createdBy', 'name email')
        .sort({ validUntil: 1 });
      
      return coupons;
      
    } catch (error: unknown) {
      console.error("Error obteniendo cupones del evento:", error);
      throw error;
    }
  }
  
  /**
   * Obtiene cupones disponibles para un usuario en un evento específico
   */
  static async getUserEventCoupons(userId: string, eventId: string) {
    try {
      await connectToDB();
      
      // Verificar que el usuario tiene ticket para el evento
      const userTicket = await Ticket.findOne({
        $or: [
          { userId: userId },
          { currentOwnerId: userId }
        ],
        eventId: eventId,
        status: 'active'
      });
      
      if (!userTicket) {
        return [];
      }
      
      // Obtener cupones válidos para el evento
      const validCoupons = await Coupon.findValidCouponsForEvent(eventId);
      
      // Filtrar cupones que el usuario ya ha usado
      const usedCouponIds = await CouponUsage.find({ userId })
        .distinct('couponId') as mongoose.Types.ObjectId[];
      
      // Convertir ObjectIds a strings para la comparación
      const usedCouponIdsStrings = usedCouponIds.map(id => id.toString());
      
      const availableCoupons = validCoupons.filter((coupon: ICoupon) => {
        const couponId = (coupon._id as mongoose.Types.ObjectId).toString();
        return !usedCouponIdsStrings.includes(couponId);
      });
      
      return availableCoupons;
      
    } catch (error: unknown) {
      console.error("Error obteniendo cupones del usuario:", error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de uso de cupones
   */
  static async getCouponStats(couponId: string) {
    try {
      await connectToDB();
      
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        throw new Error('Cupón no encontrado');
      }
      
      const usageStats = await CouponUsage.getUsageStats(couponId);
      
      return {
        coupon: {
          code: coupon.code,
          title: coupon.title,
          maxUses: coupon.maxUses,
          currentUses: coupon.currentUses,
          usagePercentage: coupon.usagePercentage,
          isActive: coupon.isActive,
          isValid: coupon.isValid
        },
        usage: usageStats
      };
      
    } catch (error: unknown) {
      console.error("Error obteniendo estadísticas de cupón:", error);
      throw error;
    }
  }
  
  /**
   * Calcula el descuento basado en el tipo de cupón
   */
  private static calculateDiscount(coupon: ICoupon, amount: number): number {
    let discount = 0;
    
    switch (coupon.discountType) {
      case 'percentage':
        discount = (amount * coupon.discountValue) / 100;
        break;
      case 'fixed_amount':
        discount = coupon.discountValue;
        break;
      case 'free_item':
        // Para items gratuitos, el descuento sería el valor del item
        discount = coupon.discountValue;
        break;
    }
    
    // Aplicar límite máximo de descuento si existe
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
    
    // El descuento no puede ser mayor al monto original
    return Math.min(discount, amount);
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
}