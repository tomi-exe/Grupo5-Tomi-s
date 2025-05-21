import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Ticket from "@/models/Ticket";

/**
 * PUT: Actualiza una reventa existente por ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  try {
    const updateData = await request.json();
    const updated = await Ticket.findByIdAndUpdate(params.id, updateData, {
      new: true,
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating ticket" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Elimina una reventa por ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDB();
  try {
    const deleted = await Ticket.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting ticket" },
      { status: 500 }
    );
  }
}
