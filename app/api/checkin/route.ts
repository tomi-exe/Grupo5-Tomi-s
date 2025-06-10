import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import CheckInImport from "@/models/CheckIn";
const CheckIn = CheckInImport as any;
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { getSession } from "@/app/lib/auth";
import nodemailer from "nodemailer";

interface PaginatedResponse {
  attendees: any[];
  total: number;
  page: number;
  pages: number;
}

/**
 * POST /api/checkin
 * Registra un check-in si el ticket corresponde al evento.
 * Envía un email de confirmación al usuario sin bloquear el flujo.
 */
export async function POST(request: NextRequest) {
  await connectToDB();

  // 1) Auth
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { eventId, ticketId }: { eventId?: string; ticketId?: string } =
    await request.json();
  if (!eventId || !ticketId) {
    return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
  }

  // 2) Validar ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    return NextResponse.json(
      { message: "Ticket no encontrado" },
      { status: 404 }
    );
  }
  // Asumiendo que Ticket tiene campo eventId
  if (ticket.get("eventId").toString() !== eventId) {
    return NextResponse.json(
      { message: "El ticket no corresponde a este evento" },
      { status: 400 }
    );
  }

  // 3) Prevenir duplicados
  try {
    const record = await CheckIn.create({
      userId: ticket.userId,
      eventId,
      ticketId,
      checkedBy: session.user.id,
      status: "success",
    });

    // 4) Enviar correo de confirmación (no bloqueante)
    (async () => {
      try {
        const user = await User.findById(ticket.userId);
        if (user?.email) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
          await transporter.sendMail({
            from: `"TicketZone" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Confirmación de Check-In",
            html: `<p>¡Tu check-in para ${ticket.eventName} fue exitoso!</p>`,
          });
        }
      } catch (err) {
        console.error("Error enviando email de check-in:", err);
      }
    })();

    return NextResponse.json(
      { checkIn: record, message: "Check-in exitoso" },
      { status: 201 }
    );
  } catch (err: any) {
    // 5) Duplicado por índice único
    if (err.code === 11000) {
      return NextResponse.json(
        {
          message: "Este ticket ya fue usado para check-in",
          status: "duplicate",
        },
        { status: 409 }
      );
    }
    console.error("Error creando check-in:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

/**
 * GET /api/checkin?eventId=...&page=...&limit=...
 * Devuelve la lista de asistentes paginada.
 */
export async function GET(request: NextRequest) {
  await connectToDB();

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ message: "Falta eventId" }, { status: 400 });
  }

  // Paginación
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const skip = (page - 1) * limit;

  const total = await CheckIn.countDocuments({ eventId });
  const list = await CheckIn.find({ eventId })
    .populate("userId", "name email")
    .populate("checkedBy", "name email")
    .skip(skip)
    .limit(limit)
    .lean();

  const response: PaginatedResponse = {
    attendees: list,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
  return NextResponse.json(response);
}

/**
 * DELETE /api/checkin
 * Revoca un check-in dado ticketId+eventId.
 */
export async function DELETE(request: NextRequest) {
  await connectToDB();

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { eventId, ticketId }: { eventId?: string; ticketId?: string } =
    await request.json();
  if (!eventId || !ticketId) {
    return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
  }

  const deleted = await CheckIn.findOneAndDelete({ eventId, ticketId });
  if (!deleted) {
    return NextResponse.json(
      { message: "No existía ese check-in" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Check-in revocado con éxito" });
}
