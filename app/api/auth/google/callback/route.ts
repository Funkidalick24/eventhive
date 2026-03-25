import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createJwt, hashPassword } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/db";
import {
  decodeCookiePayload,
  getGoogleOAuthConfig,
  verifyGoogleIdToken,
  type GoogleOauthCookiePayload,
} from "@/lib/google-oauth";

const SESSION_COOKIE = "eventhive_session";
const OAUTH_COOKIE = "eventhive_google_oauth";

function getDashboardHref(role: string | null) {
  return role === "organizer" || role === "attendee"
    ? `/dashboard?role=${role}`
    : "/dashboard";
}

function redirectToSigninWithError(origin: string, code: string) {
  const url = new URL("/signin", origin);
  url.searchParams.set("oauth", code);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { origin, clientId, clientSecret, redirectUri } = getGoogleOAuthConfig(
    request.url,
  );

  const oauthError = requestUrl.searchParams.get("error");
  if (oauthError) {
    return redirectToSigninWithError(origin, "cancelled");
  }

  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code || !state) {
    return redirectToSigninWithError(origin, "missing_params");
  }

  if (!clientId || !clientSecret) {
    return redirectToSigninWithError(origin, "not_configured");
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieValue = cookieHeader
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${OAUTH_COOKIE}=`))
    ?.split("=")[1];

  const cookiePayload = cookieValue
    ? decodeCookiePayload<GoogleOauthCookiePayload>(cookieValue)
    : null;

  if (!cookiePayload || cookiePayload.state !== state) {
    return redirectToSigninWithError(origin, "state_mismatch");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    return redirectToSigninWithError(origin, "token_exchange_failed");
  }

  const tokenData = (await tokenResponse.json()) as {
    id_token?: string;
  };

  const idToken = tokenData.id_token;
  if (!idToken) {
    return redirectToSigninWithError(origin, "missing_id_token");
  }

  let verified: Awaited<ReturnType<typeof verifyGoogleIdToken>>;
  try {
    verified = await verifyGoogleIdToken({ idToken, audience: clientId });
  } catch {
    return redirectToSigninWithError(origin, "invalid_id_token");
  }

  const email = verified.email?.trim().toLowerCase();
  const name = verified.name?.trim() || "Google user";

  if (!email || verified.emailVerified === false) {
    return redirectToSigninWithError(origin, "email_not_verified");
  }

  let user = getUserByEmail(email);

  if (!user) {
    try {
      createUser({
        name,
        email,
        passwordHash: hashPassword(randomBytes(32).toString("hex")),
      });
    } catch {
      // Likely a concurrent insert; fall through to lookup.
    }
    user = getUserByEmail(email);
  }

  if (!user) {
    return redirectToSigninWithError(origin, "user_create_failed");
  }

  const token = createJwt({ sub: user.id, email: user.email, name: user.name });

  const response = NextResponse.redirect(
    new URL(getDashboardHref(cookiePayload.role ?? null), origin),
  );

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  response.cookies.set({
    name: OAUTH_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}

