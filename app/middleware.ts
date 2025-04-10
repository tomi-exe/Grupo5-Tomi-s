import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export async function middleware(request: NextRequest) {
  console.log("Middleware executed for:", request.nextUrl.pathname); // Debugging log

  const token = request.cookies.get("session")?.value;
  console.log("Token found in cookies:", token); // Debugging log

  if (!token) {
    console.log("No token found. Redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const session = await verifyToken(token);
    console.log("Session from token:", session); // Debugging log

    if (!session) {
      console.log("Invalid token. Redirecting to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log("Valid session. Proceeding to:", request.nextUrl.pathname);
    return NextResponse.next();
  } catch (error) {
    console.error("Error verifying token:", error); // Debugging log
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/my-tickets"], // Correctly protect the /my-tickets route
};

const cookieParser = require('cookie-parser'); // Si estás usando cookies

app.use(cookieParser());

app.use((req, res, next) => {
    res.cookie('miCookieGlobal', 'valorGlobal', {
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
    });
    next();
});