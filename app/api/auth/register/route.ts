import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongodb"; // Ensure this path is correct
import User from "@/models/User"; // Correct import for the User model
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    console.log("Request body:", { email, password, name }); // Debugging input

    // Validate required fields
    if (!email || !password || !name) {
      console.log("Missing required fields");
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDB();
    console.log("Connected to database");

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });
    console.log("New user object created:", newUser);

    // Save the user to the database
    await newUser.save();
    console.log("User saved to database");

    return NextResponse.json(
      { message: "Usuario creado con éxito" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in /api/auth/register:", error); // Log the error

    // Return a detailed error response for debugging
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
