// app/lib/lib.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers"; // Solo disponible en el servidor
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

// Función para crear el token JWT
export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m") // Expira en 10 minutos
    .sign(key);
}

// Función para verificar y descifrar el token JWT
export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    return payload;
  } catch (error) {
    return null; // Token inválido o expirado
  }
}

// Lógica para iniciar sesión y generar el JWT
export async function login(formData: FormData) {
  const user = { email: formData.get("email"), name: "John" };
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
  const session = await encrypt({ user, expires });

  const cookieStore = await cookies(); // Resolviendo Promise
  const cookieExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
  cookieStore.set("session", session, {
    expires: cookieExpires,
    httpOnly: true,
  });
}

// Lógica para cerrar sesión y eliminar la cookie de sesión
export async function logout() {
  const cookieStore = await cookies(); // Resolviendo Promise
  cookieStore.set("session", "", { expires: new Date(0) }); // Borrar la cookie
}

// Obtener la sesión desde la cookie
export async function getSession(cookieHeader?: string) {
  const cookieStore = await cookies(); // Resolviendo Promise
  const session = cookieHeader || cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

// Actualizar la sesión con un nuevo tiempo de expiración
export async function updateSession(request: NextRequest) {
  const cookieStore = await cookies(); // Resolviendo Promise
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  if (!parsed) return; // Si el token es inválido, no actualizamos

  parsed.expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos más
  const res = NextResponse.next();

  cookieStore.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });

  return res;
}
