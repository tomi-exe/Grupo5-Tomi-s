import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CouponService } from "@/app/lib/couponService";

/**
 * POST: Validar un cupón para un evento y usuario específico
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { couponCode, eventId, purchaseAmount = 0 } = body;

    if (!couponCode || !eventId) {
      return NextResponse.json(
        { message: "Código de cupón y ID del evento son requeridos" },
        { status: 400 }
      );
    }

    const validation = await CouponService.validateCoupon(
      couponCode,
      session.user.id,
      eventId,
      purchaseAmount
    );

    if (validation.isValid && validation.coupon) {
      return NextResponse.json({
        valid: true,
        coupon: {
          code: validation.coupon.code,
          title: validation.coupon.title,
          description: validation.coupon.description,
          discountType: validation.coupon.discountType,
          discountValue: validation.coupon.discountValue,
          discountAmount: validation.discountAmount
        }
      });
    } else {
      return NextResponse.json({
        valid: false,
        reason: validation.reason
      });
    }

  } catch (error) {
    console.error("Error validando cupón:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}