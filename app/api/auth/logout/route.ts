import { NextResponse } from "next/server";

const SESSION_COOKIE = "eventhive_session";

function buildLogoutResponse(request: Request) {
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

export async function GET(request: Request) {
  return buildLogoutResponse(request);
}

export async function POST(request: Request) {
  return buildLogoutResponse(request);
}
