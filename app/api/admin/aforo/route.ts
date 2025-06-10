import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  await connectToDB();

  const events = await Event.find({});
  return NextResponse.json({ events });
}
