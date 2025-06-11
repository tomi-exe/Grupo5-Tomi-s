import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth";
import { CheckInService } from "@/app/lib/checkInService";

/**
 * POST: Procesar check-in de un ticket
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { message: "No autorizado" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      ticketId, 
      verificationMethod = 'qr_scan',
      location,
      notes 
    } = body;

    // Validar datos requeridos
    if (!ticketId) {
      return NextResponse.json(
        { message: "ID del ticket es requerido" },
        { status: 400 }
      );
    }

    // Procesar el check-in
    const result = await CheckInService.processCheckIn({
      ticketId,
      userId: session.user.id,
      verificationMethod,
      location,
      notes,
      request
    });

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        checkIn: result.data
      }, { status: 200 });
    } else {
      return NextResponse.json({
        message: result.message,
        error: result.error
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Error en /api/checkin POST:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET: Validar elegibilidad de check-in para un ticket
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

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json(
        { message: "ID del ticket es requerido" },
        { status: 400 }
      );
    }

    // Validar elegibilidad
    const validation = await CheckInService.validateCheckInEligibility(
      ticketId, 
      session.user.id
    );

    return NextResponse.json({
      eligible: validation.eligible,
      reason: validation.reason
    });

  } catch (error) {
    console.error("Error en /api/checkin GET:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}