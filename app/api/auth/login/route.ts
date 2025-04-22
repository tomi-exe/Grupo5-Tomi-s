import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongodb"; // Ensure this path is correct
import User from "@/models/User"; // Correct import for the User model
import bcrypt from "bcrypt";
import { setSession } from "@/app/lib/auth"; // Ensure this path is correct

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Connect to the database
    await connectToDB();

    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 401 }
      );
    }

    // Compare the password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Create a session
    await setSession(user);

    return NextResponse.json({ message: "Login exitoso" });
  } catch (error) {
    console.error("Error in /api/auth/login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
