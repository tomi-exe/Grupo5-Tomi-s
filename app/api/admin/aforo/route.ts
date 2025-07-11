import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Event from "@/models/Event"; // Make sure "@/models/Event" exports a Mongoose model, not a type or union
import Ticket from "@/models/Ticket";

export async function GET(
  request: NextRequest,
  { params }: { params: {} }
): Promise<NextResponse> {
  try {
    await connectToDB();

    // 1) Recuperar todos los eventos
    const events = await (Event as any).find({}).lean();

    // 2) Para cada evento, contar tickets vendidos y calcular disponible
    const enriched = await Promise.all(
      events.map(
        async (ev: { _id: any; capacity?: number; [key: string]: any }) => {
          const soldCount = await Ticket.countDocuments({
            eventId: ev._id.toString(),
          });
          const capacity = ev.capacity ?? 0; // asumir que Event tiene campo `capacity`
          const available = Math.max(capacity - soldCount, 0);
          return {
            ...ev,
            sold: soldCount,
            capacity,
            available,
          };
        }
      )
    );

    // 3) Devolver JSON con aforo
    return NextResponse.json({ events: enriched });
  } catch (error) {
    console.error("Error GET /api/admin/aforo:", error);
    return NextResponse.json(
      { message: "Error interno al obtener eventos" },
      { status: 500 }
    );
  }
}
