import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import Coupon from "@/models/Coupon";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  await connectToDB();
  const { value, description, rewardType, expiresAt } = await request.json();

  if (!value || !description || !rewardType || !expiresAt) {
    return NextResponse.json({ message: "Faltan datos" }, { status: 400 });
  }

  // Genera código único de 8 chars
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();

  try {
    const coupon = await Coupon.create({
      code,
      value,
      description,
      rewardType,
      expiresAt: new Date(expiresAt),
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { message: "Código duplicado" },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function GET() {
  await connectToDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ coupons });
}
