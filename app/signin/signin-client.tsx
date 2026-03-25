"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { GoogleIcon } from "../components/icons";

type SessionUser = {
  id: number;
  name: string;
  email: string;
};

function getDashboardHref(role: string | null) {
  return role === "organizer" || role === "attendee"
    ? `/dashboard?role=${role}`
    : "/dashboard";
}

function getGoogleOauthErrorCopy(code: string | null) {
  if (!code) return null;

  const errorCopy: Record<string, string> = {
    cancelled: "Google sign-in was cancelled. Please try again.",
    not_configured: "Google sign-in is not available right now.",
    state_mismatch: "Google sign-in expired. Please try again.",
    missing_params: "Google sign-in failed. Please try again.",
    token_exchange_failed: "Google sign-in failed. Please try again.",
    missing_id_token: "Google sign-in failed. Please try again.",
    invalid_id_token: "Google sign-in failed. Please try again.",
    email_not_verified: "Please verify your Google email address and try again.",
    user_create_failed: "We could not sign you in. Please try again.",
  };

  return errorCopy[code] ?? "Google sign-in failed. Please try again.";
}

export function SigninClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("oauth");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(() =>
    getGoogleOauthErrorCopy(oauthError),
  );
  const [submitting, setSubmitting] = useState(false);
  const [oauthSubmitting, setOauthSubmitting] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  const showRegisteredNotice = searchParams.get("registered") === "1";

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => {
        if (!response.ok) {
          throw new Error("No session");
        }
        return response.json() as Promise<{ user: SessionUser }>;
      })
      .then((data) => {
        setSessionUser(data.user);
      })
      .catch(() => {
        setSessionUser(null);
      });
  }, []);

  useEffect(() => {
    if (!sessionUser) return;
    router.refresh();
    router.replace(getDashboardHref(searchParams.get("role")));
  }, [router, searchParams, sessionUser]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      message?: string;
      user?: SessionUser;
    };

    if (!response.ok) {
      setError(data.message ?? "Login failed.");
      setSubmitting(false);
      return;
    }

    setSessionUser(data.user ?? null);
    form?.reset();
    setSubmitting(false);
    setMessage(null);
    router.refresh();
    router.push(getDashboardHref(searchParams.get("role")));
  }

  function handleGoogleSignin() {
    setOauthSubmitting(true);

    const role = searchParams.get("role");
    const destination = role
      ? `/api/auth/google?role=${encodeURIComponent(role)}`
      : "/api/auth/google";

    window.location.assign(destination);
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Access your account and events securely.
      </p>

      {showRegisteredNotice ? (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          Account created. Please sign in.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignin}
          disabled={submitting || oauthSubmitting}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-70"
        >
          <GoogleIcon className="h-5 w-5" />
          {oauthSubmitting ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-xs text-muted-foreground">or</span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || oauthSubmitting}
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-70"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>

      {sessionUser ? (
        <p className="mt-4 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-700">
          Signed in as {sessionUser.name} ({sessionUser.email}).
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <p className="mt-6 text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/signup" className="font-medium text-primary">
          Create one
        </Link>
      </p>
    </div>
  );
}
