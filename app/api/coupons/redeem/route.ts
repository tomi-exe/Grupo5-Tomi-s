import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Coupon from "@/models/Coupon";
import Event from "@/models/Event";
import { getSession } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { code, eventId } = await request.json();
    if (!code) {
      return NextResponse.json(
        { message: "Código de cupón requerido" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return NextResponse.json(
        { message: "Cupón no encontrado" },
        { status: 404 }
      );
    }

    if (coupon.used) {
      return NextResponse.json(
        { message: "Cupón ya canjeado" },
        { status: 409 }
      );
    }

    // Optional: verify event exists
    let event = null;
    if (eventId) {
      event = await (Event as any).findById(eventId);
      if (!event) {
        return NextResponse.json(
          { message: "Evento no encontrado" },
          { status: 404 }
        );
      }
    }

    coupon.used = true;
    coupon.usedBy = session.user.id as any;
    coupon.usedAt = new Date();
    coupon.usedEvent = event?._id ?? null;
    await coupon.save();

    return NextResponse.json({ message: "Cupón canjeado", coupon });
  } catch (error) {
    console.error("Error POST /api/coupons/redeem:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
