// app/api/admin/aforo/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    // 2. Recuperar todos los eventos como objetos POJO
    const events = await (Event as any).find({}).lean().exec();

    // 3. Para cada evento, contar tickets y calcular disponibles
    const enriched = await Promise.all(
      events.map(async (ev: any) => {
        const soldCount = await Ticket.countDocuments({
          eventId: ev._id.toString(),
        });
        const capacity = ev.capacity ?? 0;
        const available = Math.max(capacity - soldCount, 0);
        return {
          ...ev,
          sold: soldCount,
          capacity,
          available,
        };
      })
    );

    return NextResponse.json({ events: enriched });
  } catch (error) {
    console.error("Error GET /api/admin/aforo:", error);
    return NextResponse.json(
      { message: "Error interno al obtener eventos" },
      { status: 500 }
    );
  }
}
