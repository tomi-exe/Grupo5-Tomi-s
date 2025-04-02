import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "secret");

// 🔹 Generate a JWT
export async function generateToken(payload: any) {
  console.log("Generating token for payload:", payload); // Debugging log
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secretKey);
}

// 🔹 Verify a JWT
export async function verifyToken(token: string) {
  try {
    console.log("Verifying token:", token); // Debugging log
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    console.log("Token verified. Payload:", payload); // Debugging log
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error); // Debugging log
    return null;
  }
}

// 🔹 Save session in cookies
export async function setSession(user: any) {
  try {
    console.log("Setting session for user:", user); // Debugging log
    const token = await generateToken({ user });
    console.log("Generated token:", token); // Debugging log
    (await cookies()).set("session", token, { httpOnly: true, maxAge: 3600 });
    console.log("Session set successfully."); // Debugging log
  } catch (error) {
    console.error("Error setting session:", error); // Debugging log
  }
}

// 🔹 Get session from cookies
export async function getSession() {
  try {
    const token = (await cookies()).get("session")?.value;
    console.log("Retrieved token from cookies:", token); // Debugging log
    if (!token) return null;
    const session = await verifyToken(token);
    console.log("Verified session:", session); // Debugging log
    return session;
  } catch (error) {
    console.error("Error getting session:", error); // Debugging log
    return null;
  }
}

// 🔹 Logout
export async function logout() {
  try {
    console.log("Logging out user."); // Debugging log
    (await cookies()).set("session", "", { expires: new Date(0) });
    console.log("User logged out successfully."); // Debugging log
  } catch (error) {
    console.error("Error during logout:", error); // Debugging log
  }
}
