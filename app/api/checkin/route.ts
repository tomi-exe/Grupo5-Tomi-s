import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import TicketModel from "@/models/Ticket";
import EventModel from "@/models/Event";

export async function POST(req: NextRequest) {
  await connectToDB();

  const { qrCode } = await req.json();
  if (!qrCode) {
    return NextResponse.json({ success: false, message: "QR code is missing" }, { status: 400 });
  }

  const ticket = await TicketModel.findOne({ qrCode });

  if (!ticket) {
    return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
  }

  if (ticket.isUsed) {
    return NextResponse.json({ success: false, message: "Ticket already used" }, { status: 409 });
  }

  ticket.isUsed = true;
  ticket.checkInDate = new Date();
  await ticket.save();

  const event = await EventModel.findOne({ name: ticket.eventName });

  if (!event) {
    return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
  }

  event.currentAttendees += 1;
  await event.save();

  return NextResponse.json({ success: true, message: "Check-in successful" });
}


