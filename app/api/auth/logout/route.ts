import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); // <-- así sí
  cookieStore.set("session", "", { expires: new Date(0) });

  return NextResponse.redirect("/login");
}


