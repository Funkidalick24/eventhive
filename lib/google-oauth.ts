import { OAuth2Client } from "google-auth-library";

import { getAppOrigin } from "@/lib/app-base-url";

export type GoogleOauthCookiePayload = {
  state: string;
  role?: string | null;
};

export function getGoogleOAuthConfig(requestUrl: string) {
  const origin = getAppOrigin(requestUrl);

  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "";

  return { origin, clientId, clientSecret, redirectUri };
}

export function encodeCookiePayload(payload: unknown) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCookiePayload<T>(value: string): T | null {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf-8");
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

export async function verifyGoogleIdToken(input: {
  idToken: string;
  audience: string;
}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: input.idToken,
    audience: input.audience,
  });

  const payload = ticket.getPayload();

  return {
    email: payload?.email ?? null,
    name:
      payload?.name ??
      payload?.given_name ??
      payload?.family_name ??
      "Google user",
    emailVerified: payload?.email_verified ?? null,
  };
}
