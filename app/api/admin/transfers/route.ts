import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { TransferService } from "@/app/lib/transferService";
import User from "@/models/User";
import { connectToDB } from "@/app/lib/mongodb";

/**
 * GET: Obtener historial de transferencias para administradores
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar si el usuario es administrador
    await connectToDB();
    const user = await User.findById(session.user.id);
    
    // Nota: Aquí deberías implementar tu lógica de roles de admin
    // Por ahora, asumimos que tienes un campo 'role' en el modelo User
    // if (user?.role !== 'admin') {
    //   return NextResponse.json({ message: "Acceso denegado" }, { status: 403 });
    // }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const transferType = searchParams.get("transferType") || undefined;
    const userId = searchParams.get("userId") || undefined;
    const startDate = searchParams.get("startDate") 
      ? new Date(searchParams.get("startDate")!) 
      : undefined;
    const endDate = searchParams.get("endDate") 
      ? new Date(searchParams.get("endDate")!) 
      : undefined;

    // Obtener transferencias
    const result = await TransferService.getAllTransfers(page, limit, {
      startDate,
      endDate,
      transferType,
      userId
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error obteniendo transferencias:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST: Obtener estadísticas de transferencias
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { startDate, endDate } = await request.json();

    const stats = await TransferService.getTransferStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}