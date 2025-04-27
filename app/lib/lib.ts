
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers"; 
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);


export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m") 
    .sign(key);
}


export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] });
    return payload;
  } catch (error) {
    return null; 
  }
}


export async function login(formData: FormData) {
  const user = { email: formData.get("email"), name: "John" };
  const expires = new Date(Date.now() + 10 * 60 * 1000); 
  const session = await encrypt({ user, expires });

  const cookieStore = await cookies(); 
  const cookieExpires = new Date(Date.now() + 10 * 60 * 1000); 
  cookieStore.set("session", session, {
    expires: cookieExpires,
    httpOnly: true,
  });
}


export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", { expires: new Date(0) }); 
}


export async function getSession(cookieHeader?: string) {
  const cookieStore = await cookies(); 
  const session = cookieHeader || cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}


export async function updateSession(request: NextRequest) {
  const cookieStore = await cookies(); 
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  if (!parsed) return; 

  parsed.expires = new Date(Date.now() + 10 * 60 * 1000); 
  const res = NextResponse.next();

  cookieStore.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });

  return res;
}
