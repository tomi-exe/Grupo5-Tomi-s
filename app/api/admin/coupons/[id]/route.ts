import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { connectToDB } from "@/app/lib/db-utils";
import User from "@/models/User";
import Coupon from "@/models/Coupon";
import CouponUsage from "@/models/CouponUsage";

/**
 * GET: Obtener un cupón específico con estadísticas detalladas
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

    const couponId = context.params.id;
    
    // Obtener cupón con detalles
    const coupon = await Coupon.findById(couponId)
      .populate('eventId', 'eventName eventDate location')
      .populate('createdBy', 'name email');

    if (!coupon) {
      return NextResponse.json(
        { message: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    // Obtener estadísticas de uso básicas
    let usageStats = {
      summary: {
        totalUses: coupon.currentUses,
        totalDiscountApplied: 0,
        totalOriginalAmount: 0,
        totalFinalAmount: 0,
        averageDiscount: 0,
        firstUse: null,
        lastUse: null
      },
      usageByDay: []
    };

    // Intentar obtener estadísticas detalladas si CouponUsage existe
    try {
      if (CouponUsage.getUsageStats) {
        usageStats = await CouponUsage.getUsageStats(couponId);
      }
    } catch (error) {
      console.log("CouponUsage stats not available, using basic stats");
    }

    // Obtener usos recientes
    let recentUsages: any[] = [];
    try {
      if (CouponUsage.findByCoupon) {
        recentUsages = await CouponUsage.findByCoupon(couponId)
          .limit(10)
          .sort({ usedAt: -1 });
      }
    } catch (error) {
      console.log("Recent usages not available");
    }

    return NextResponse.json({
      coupon: {
        ...coupon.toObject(),
        usagePercentage: Math.round((coupon.currentUses / coupon.maxUses) * 100),
        isValid: coupon.isValid,
        isExpired: coupon.isExpired,
        hasUsesRemaining: coupon.hasUsesRemaining
      },
      stats: usageStats,
      recentUsages
    });

  } catch (error) {
    console.error("Error obteniendo cupón:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Actualizar un cupón existente
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

    const couponId = context.params.id;
    const body = await request.json();
    const {
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
      isActive,
      code
    } = body;

    // Buscar el cupón existente
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return NextResponse.json(
        { message: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    // Validaciones básicas
    if (title !== undefined) coupon.title = title;
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    
    if (discountValue !== undefined) {
      if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
        return NextResponse.json(
          { message: "El descuento porcentual debe estar entre 0 y 100" },
          { status: 400 }
        );
      }
      coupon.discountValue = discountValue;
    }

    // Validar fechas si se proporcionan
    if (validFrom && validUntil) {
      const startDate = new Date(validFrom);
      const endDate = new Date(validUntil);
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { message: "La fecha de inicio debe ser anterior a la fecha de fin" },
          { status: 400 }
        );
      }
      
      coupon.validFrom = startDate;
      coupon.validUntil = endDate;
    } else if (validFrom) {
      coupon.validFrom = new Date(validFrom);
    } else if (validUntil) {
      coupon.validUntil = new Date(validUntil);
    }

    // Validar maxUses (no puede ser menor que los usos actuales)
    if (maxUses !== undefined) {
      if (maxUses < coupon.currentUses) {
        return NextResponse.json(
          { message: `El máximo de usos no puede ser menor que los usos actuales (${coupon.currentUses})` },
          { status: 400 }
        );
      }
      coupon.maxUses = maxUses;
    }

    // Verificar código único si se cambia
    if (code && code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: couponId }
      });
      if (existingCoupon) {
        return NextResponse.json(
          { message: "Este código de cupón ya existe" },
          { status: 409 }
        );
      }
      coupon.code = code.toUpperCase();
    }

    // Actualizar otros campos opcionales
    if (minPurchaseAmount !== undefined) {
      coupon.minPurchaseAmount = minPurchaseAmount > 0 ? minPurchaseAmount : undefined;
    }
    if (maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount = maxDiscountAmount > 0 ? maxDiscountAmount : undefined;
    }
    if (targetAudience !== undefined) coupon.targetAudience = targetAudience;
    if (isActive !== undefined) coupon.isActive = isActive;

    // Guardar cambios
    await coupon.save();

    return NextResponse.json({
      message: "Cupón actualizado exitosamente",
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        maxUses: coupon.maxUses,
        currentUses: coupon.currentUses,
        isActive: coupon.isActive,
        usagePercentage: Math.round((coupon.currentUses / coupon.maxUses) * 100)
      }
    });

  } catch (error) {
    console.error("Error actualizando cupón:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Eliminar un cupón (solo si no ha sido usado)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
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

    const couponId = context.params.id;

    // Buscar el cupón
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return NextResponse.json(
        { message: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si el cupón ha sido usado
    if (coupon.currentUses > 0) {
      return NextResponse.json(
        { message: "No se puede eliminar un cupón que ya ha sido utilizado" },
        { status: 400 }
      );
    }

    // Eliminar el cupón
    await Coupon.findByIdAndDelete(couponId);

    return NextResponse.json({
      message: "Cupón eliminado exitosamente"
    });

  } catch (error) {
    console.error("Error eliminando cupón:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}