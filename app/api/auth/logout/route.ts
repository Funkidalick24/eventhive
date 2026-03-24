import { NextResponse } from "next/server";

const SESSION_COOKIE = "eventhive_session";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

