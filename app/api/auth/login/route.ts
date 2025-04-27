import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { setSession } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await connectToDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }


    await setSession({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({ message: "Login exitoso" });
  } catch (error) {
    console.error("Error in /api/auth/login:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

