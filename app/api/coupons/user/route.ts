import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CouponService } from "@/app/lib/couponService";

/**
 * POST: Aplicar un cupón a una compra
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { couponCode, eventId, originalAmount, items } = body;

    if (!couponCode || !eventId || originalAmount == null) {
      return NextResponse.json(
        { message: "Faltan datos requeridos para aplicar el cupón" },
        { status: 400 }
      );
    }

    const result = await CouponService.applyCoupon({
      couponCode,
      userId: session.user.id,
      eventId,
      originalAmount,
      items,
      request
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        discountApplied: result.discountApplied,
        finalAmount: result.finalAmount,
        savings: originalAmount - result.finalAmount
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Error aplicando cupón:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}