import { NextResponse } from "next/server";
import { createJwt, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeEmail, sanitizeString, safeJsonObject } from "@/lib/sanitize";

const SESSION_COOKIE = "eventhive_session";

export async function POST(request: Request) {
  const body = await safeJsonObject(request);
  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = sanitizeEmail(body.email);
  const password = sanitizeString(body.password, { trim: false, maxLength: 1024 });

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  const token = createJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
  });

  const response = NextResponse.json({
    message: "Login successful.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
