import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongodb"; 
import User from "@/models/User"; 
import bcrypt from "bcrypt";


const validateRut = (rut: string) => {
  const cleanRut = rut.replace(/[.-]/g, "");
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const calculatedDv = 11 - (sum % 11);
  const validDv =
    calculatedDv === 11
      ? "0"
      : calculatedDv === 10
      ? "K"
      : calculatedDv.toString();

  return dv === validDv;
};

export async function POST(req: Request) {
  try {
    const { email, password, name, rut } = await req.json();
    console.log("Request body:", { email, name, rut }); 

    
    if (!email || !password || !name || !rut) {
      console.log("Missing required fields");
      return NextResponse.json(
        { message: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar el RUT
    if (!validateRut(rut)) {
      console.log("Invalid RUT");
      return NextResponse.json(
        { message: "El RUT ingresado no es válido" },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectToDB();
    console.log("Connected to database");

    // Verificar si el usuario ya existe por correo
    const existingUser = await User.findOne({ email });
    console.log("Existing user by email:", existingUser);

    if (existingUser) {
      return NextResponse.json(
        { message: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Verificar si el RUT ya está registrado
    const existingRut = await User.findOne({ rut });
    console.log("Existing user by RUT:", existingRut);

    if (existingRut) {
      return NextResponse.json(
        { message: "El RUT ingresado ya está registrado" },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    // Crear un nuevo usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      rut, // Guardar el RUT
    });
    console.log("New user object created:", newUser);

    // Guardar el usuario en la base de datos
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
