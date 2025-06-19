import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { connectToDB } from "@/app/lib/db-utils";
import User from "@/models/User";

export async function middleware(request: NextRequest) {
  console.log("Middleware executed for:", request.nextUrl.pathname);

  const token = request.cookies.get("session")?.value;
  console.log("Token found in cookies:", !!token);

  if (!token) {
    console.log("No token found. Redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = await verifyToken(token);
    console.log("Session from token:", !!session);

    if (!session) {
      console.log("Invalid token. Redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar permisos de administrador para rutas admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
      try {
        await connectToDB();
        const user = await User.findById(session.user.id);
        
        if (!user || user.role !== 'admin') {
          console.log("Access denied: User is not admin");
          return NextResponse.redirect(new URL("/events", request.url));
        }
        
        console.log("Admin access granted for:", request.nextUrl.pathname);
      } catch (error) {
        console.error("Error checking admin permissions:", error);
        return NextResponse.redirect(new URL("/events", request.url));
      }
    }

    console.log("Valid session. Proceeding to:", request.nextUrl.pathname);
    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Rutas protegidas
export const config = {
  matcher: [
    "/my-tickets/:path*",
    "/api/tickets/:path*",
    "/resale-market/:path*",
    "/api/resale/tickets/:path*",
    "/resale-market",
    "/resale-market/:path*",
    "/api/resale/tickets",
    "/api/resale/tickets/:path*",
    "/organizer/:path*",
    "/admin/:path*", // Proteger todas las rutas de admin
    "/api/admin/:path*", // Proteger todas las APIs de admin
    "/transfer-history/:path*",
    "/purchase-history/:path*",
    "/checkin/:path*",
    "/api/checkin/:path*",
    "/api/transfers/:path*",
    "/api/coupons/:path*"
  ],
};