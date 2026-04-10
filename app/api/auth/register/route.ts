import { NextResponse } from "next/server";
import { hashPassword, validatePassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeEmail, sanitizeString, safeJsonObject } from "@/lib/sanitize";

export async function POST(request: Request) {
  const body = await safeJsonObject(request);
  if (!body) {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const name = sanitizeString(body.name, { maxLength: 120 });
  const email = sanitizeEmail(body.email);
  const password = sanitizeString(body.password, { trim: false, maxLength: 1024 });

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Name, email, and password are required." },
      { status: 400 },
    );
  }

  if (!validatePassword(password)) {
    return NextResponse.json(
      { message: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { message: "Email is already in use." },
      { status: 409 },
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashPassword(password),
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { message: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
