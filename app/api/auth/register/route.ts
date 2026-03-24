import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

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

  if (getUserByEmail(email)) {
    return NextResponse.json(
      { message: "Email is already in use." },
      { status: 409 },
    );
  }

  try {
    const id = createUser({
      name,
      email,
      passwordHash: hashPassword(password),
    });

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: {
          id,
          name,
          email,
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
