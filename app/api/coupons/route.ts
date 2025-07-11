import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CouponService } from "@/app/lib/couponService";

/**
 * GET: Obtener cupones (filtrados por evento si se especifica)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const includeExpired = searchParams.get("includeExpired") === "true";

    if (eventId) {
      const coupons = await CouponService.getEventCoupons(eventId, includeExpired);
      return NextResponse.json({ coupons });
    }

    return NextResponse.json({ message: "eventId es requerido" }, { status: 400 });
  } catch (error) {
    console.error("Error obteniendo cupones:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST: Crear un nuevo cupón
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
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

    const couponData = {
      eventId,
      title,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      maxUses,
      createdBy: session.user.id,
      targetAudience,
      applicableItems,
      customCode
    };

    const coupon = await CouponService.createCoupon(couponData);

    return NextResponse.json({
      message: "Cupón creado exitosamente",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        maxUses: coupon.maxUses
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