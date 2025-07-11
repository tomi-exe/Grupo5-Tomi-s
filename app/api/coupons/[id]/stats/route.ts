import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CouponService } from "@/app/lib/couponService";

/**
 * GET: Obtener estadísticas de un cupón específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // await el Promise para extraer el id
    const { id: couponId } = await params;
    if (!couponId) {
      return NextResponse.json(
        { message: "ID del cupón es requerido" },
        { status: 400 }
      );
    }

    const stats = await CouponService.getCouponStats(couponId);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error obteniendo estadísticas del cupón:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
