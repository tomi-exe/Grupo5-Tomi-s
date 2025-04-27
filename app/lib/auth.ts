import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Tipo del usuario guardado en JWT
export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

// Generar token JWT
export async function generateToken(payload: { user: SessionUser }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
}

// Verificar JWT
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify<{ user: SessionUser }>(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Error verificando token:", error);
    return null;
  }
}

// Guardar sesión en cookie
export async function setSession(user: SessionUser) {
  const token = await generateToken({ user });
  
  // Forma simplificada sin usar variable intermedia
  (await
    // Forma simplificada sin usar variable intermedia
    cookies()).set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}


export async function getSession(): Promise<{ user: SessionUser } | null> {
  const sessionCookie = (await cookies()).get("session");
  const token = sessionCookie?.value;
  
  if (!token) return null;
  return await verifyToken(token);
}


export async function logout() {
  (await cookies()).set("session", "", {
    expires: new Date(0),
    path: "/",
  });
}


