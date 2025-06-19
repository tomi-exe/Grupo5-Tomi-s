import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CouponService } from "@/app/lib/couponService";
import { connectToDB } from "@/app/lib/db-utils";
import User from "@/models/User";
import Event from "@/models/Event";
import Coupon from "@/models/Coupon";

/**
 * GET: Obtener todos los cupones (solo para administradores)
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
    const eventId = searchParams.get("eventId");
    const includeExpired = searchParams.get("includeExpired") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query: any = {};
    
    // Filtrar por evento si se especifica
    if (eventId) {
      query.eventId = eventId;
    }

    // Incluir expirados o no
    if (!includeExpired) {
      const now = new Date();
      query.validUntil = { $gte: now };
    }

    // Obtener cupones con paginación
    const coupons = await Coupon.find(query)
      .populate('eventId', 'eventName eventDate location')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Contar total para paginación
    const total = await Coupon.countDocuments(query);

    // Obtener estadísticas generales
    const stats = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          totalCoupons: { $sum: 1 },
          activeCoupons: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isActive", true] },
                    { $gte: ["$validUntil", new Date()] },
                    { $lt: ["$currentUses", "$maxUses"] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalUses: { $sum: "$currentUses" },
          expiredCoupons: {
            $sum: {
              $cond: [{ $lt: ["$validUntil", new Date()] }, 1, 0]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      coupons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      stats: stats[0] || {
        totalCoupons: 0,
        activeCoupons: 0,
        totalUses: 0,
        expiredCoupons: 0
      }
    });

  } catch (error) {
    console.error("Error obteniendo cupones:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST: Crear un nuevo cupón (solo para administradores)
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
      eventId,
      title,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      maxUses,
      targetAudience,
      applicableItems,
      customCode
    } = body;

    // Validaciones básicas
    if (!eventId || !title || !description || !discountType || 
        discountValue == null || !validFrom || !validUntil || !maxUses) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { message: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Validar fechas
    const startDate = new Date(validFrom);
    const endDate = new Date(validUntil);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { message: "La fecha de inicio debe ser anterior a la fecha de fin" },
        { status: 400 }
      );
    }

    // Validar descuento porcentual
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { message: "El descuento porcentual debe estar entre 0 y 100" },
        { status: 400 }
      );
    }

    // Verificar código personalizado único
    if (customCode) {
      const existingCoupon = await Coupon.findOne({ 
        code: customCode.toUpperCase() 
      });
      if (existingCoupon) {
        return NextResponse.json(
          { message: "Este código de cupón ya existe" },
          { status: 409 }
        );
      }
    }

    const couponData = {
      eventId,
      eventName: event.eventName,
      title,
      description,
      discountType,
      discountValue,
      minPurchaseAmount: minPurchaseAmount || undefined,
      maxDiscountAmount: maxDiscountAmount || undefined,
      validFrom: startDate,
      validUntil: endDate,
      maxUses,
      createdBy: session.user.id,
      targetAudience: targetAudience || 'all_attendees',
      applicableItems,
      customCode: customCode?.toUpperCase()
    };

    const coupon = await CouponService.createCoupon(couponData);

    return NextResponse.json({
      message: "Cupón creado exitosamente",
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        eventName: coupon.eventName,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        maxUses: coupon.maxUses,
        currentUses: coupon.currentUses,
        isActive: coupon.isActive
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creando cupón:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}