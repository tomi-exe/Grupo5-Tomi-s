import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { connectToDB } from "@/app/lib/db-utils";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * GET: Obtener información del usuario actual
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "No autorizado" }, 
        { status: 401 }
      );
    }

    await connectToDB();

    // Obtener información completa del usuario desde la base de datos
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" }, 
        { status: 404 }
      );
    }

    // Convertir _id de manera segura
    const userId = user._id instanceof mongoose.Types.ObjectId 
      ? user._id.toString() 
      : String(user._id);

    return NextResponse.json({
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        rut: user.rut
      }
    });

  } catch (error) {
    console.error("Error obteniendo información del usuario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}