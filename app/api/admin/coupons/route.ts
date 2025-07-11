// app/api/admin/coupons/route.ts

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
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    await connectToDB();

    // 1. Verificar si el usuario es administrador
    const user = await User.findById(session.user.id).lean().exec();
    if (user?.role !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado - Solo administradores" },
        { status: 403 }
      );
    }

    // 2. Parámetros de búsqueda y paginación
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const includeExpired = searchParams.get("includeExpired") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // 3. Construir la query
    const query: any = {};
    if (eventId) query.eventId = eventId;
    if (!includeExpired) query.validUntil = { $gte: new Date() };

    // 4. Obtener cupones con populate, lean y exec
    const coupons = await Coupon.find(query)
      .populate("eventId", "eventName eventDate location")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    // 5. Contar total para paginación
    const total = await Coupon.countDocuments(query).exec();

    // 6. Estadísticas generales con aggregate + exec
    const [
      stats = {
        totalCoupons: 0,
        activeCoupons: 0,
        totalUses: 0,
        expiredCoupons: 0,
      },
    ] = await Coupon.aggregate([
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
                    { $lt: ["$currentUses", "$maxUses"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalUses: { $sum: "$currentUses" },
          expiredCoupons: {
            $sum: {
              $cond: [{ $lt: ["$validUntil", new Date()] }, 1, 0],
            },
          },
        },
      },
    ]).exec();

    return NextResponse.json({
      coupons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
      stats,
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
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    await connectToDB();

    // 1. Verificar rol de admin
    const user = await User.findById(session.user.id).lean().exec();
    if (user?.role !== "admin") {
      return NextResponse.json(
        { message: "Acceso denegado - Solo administradores" },
        { status: 403 }
      );
    }

    // 2. Leer y validar body
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
      customCode,
    } = body;
    if (
      !eventId ||
      !title ||
      !description ||
      !discountType ||
      discountValue == null ||
      !validFrom ||
      !validUntil ||
      !maxUses
    ) {
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // 3. Verificar que el evento existe
    const event = await (Event as any).findById(eventId).lean().exec();
    if (!event) {
      return NextResponse.json(
        { message: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // 4. Validar fechas y valores
    const startDate = new Date(validFrom);
    const endDate = new Date(validUntil);
    if (startDate >= endDate) {
      return NextResponse.json(
        { message: "La fecha de inicio debe ser anterior a la fecha de fin" },
        { status: 400 }
      );
    }
    if (
      discountType === "percentage" &&
      (discountValue < 0 || discountValue > 100)
    ) {
      return NextResponse.json(
        { message: "El descuento porcentual debe estar entre 0 y 100" },
        { status: 400 }
      );
    }

    // 5. Verificar código único si existe
    if (customCode) {
      const existingCoupon = await Coupon.findOne({
        code: customCode.toUpperCase(),
      })
        .lean()
        .exec();
      if (existingCoupon) {
        return NextResponse.json(
          { message: "Este código de cupón ya existe" },
          { status: 409 }
        );
      }
    }

    // 6. Crear el cupón
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
      targetAudience: targetAudience || "all_attendees",
      applicableItems,
      customCode: customCode?.toUpperCase(),
    };
    const coupon = await CouponService.createCoupon(couponData);

    return NextResponse.json(
      {
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
          isActive: coupon.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando cupón:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
