import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import TicketModel from "@/models/Ticket";
import EventModel from "@/models/Event";

export async function POST(req: NextRequest) {
  await connectToDB();
  const { qrCode } = await req.json();

  if (!qrCode) {
    return NextResponse.json(
      { success: false, message: "QR code is missing" },
      { status: 400 }
    );
  }

  // Castea a any para poder usar findOne sin errores de TS
  const Ticket = TicketModel as any;
  const ticket = await Ticket.findOne({ qrCode });

  if (!ticket) {
    return NextResponse.json(
      { success: false, message: "Ticket not found" },
      { status: 404 }
    );
  }

  if (ticket.isUsed) {
    return NextResponse.json(
      { success: false, message: "Ticket already used" },
      { status: 409 }
    );
  }

  ticket.isUsed = true;
  ticket.checkInDate = new Date();
  await ticket.save();

  // Mismo truco para el EventModel
  const Event = EventModel as any;
  const event = await Event.findOne({ name: ticket.eventName });

  if (!event) {
    return NextResponse.json(
      { success: false, message: "Event not found" },
      { status: 404 }
    );
  }

  event.currentAttendees += 1;
  await event.save();

  return NextResponse.json({ success: true, message: "Check-in successful" });
}
