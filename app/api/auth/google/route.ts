import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  encodeCookiePayload,
  getGoogleOAuthConfig,
  type GoogleOauthCookiePayload,
} from "@/lib/google-oauth";

const OAUTH_COOKIE = "eventhive_google_oauth";

function buildAuthUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", input.state);
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("include_granted_scopes", "true");
  return url;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role");

  const { clientId, redirectUri } = getGoogleOAuthConfig(request.url);

  if (!clientId) {
    return NextResponse.json(
      { message: "Google OAuth is not configured." },
      { status: 500 },
    );
  }

  const state = randomBytes(16).toString("hex");

  const payload: GoogleOauthCookiePayload = { state, role };
  const response = NextResponse.redirect(
    buildAuthUrl({ clientId, redirectUri, state }),
  );

  response.cookies.set({
    name: OAUTH_COOKIE,
    value: encodeCookiePayload(payload),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}

