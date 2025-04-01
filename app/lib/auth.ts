import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

// 🔹 Generar un JWT
export async function generateToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
}

// 🔹 Verificar un JWT
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

// 🔹 Guardar sesión en cookies
export async function setSession(user: any) {
  const token = await generateToken({ user });
  cookies().set("session", token, { httpOnly: true, maxAge: 3600 });
}

// 🔹 Obtener sesión desde cookies
export async function getSession() {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

// 🔹 Cerrar sesión
export async function logout() {
  cookies().set("session", "", { expires: new Date(0) });
}
