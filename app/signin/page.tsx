"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Container } from "../components/container";

type SessionUser = {
  id: number;
  name: string;
  email: string;
};

function RegisteredNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("registered") !== "1") {
    return null;
  }

  return (
    <p className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
      Account created. Please sign in.
    </p>
  );
}

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

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
    const role = searchParams.get("role");
    const dashboardHref =
      role === "organizer" || role === "attendee"
        ? `/dashboard?role=${role}`
        : "/dashboard";

    if (sessionUser) {
      router.replace(dashboardHref);
    }
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
    const role = searchParams.get("role");
    const dashboardHref =
      role === "organizer" || role === "attendee"
        ? `/dashboard?role=${role}`
        : "/dashboard";
    router.push(dashboardHref);
  }

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your account and events securely.
          </p>

          <Suspense fallback={null}>
            <RegisteredNotice />
          </Suspense>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
              disabled={submitting}
              className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

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
      </Container>
    </main>
  );
}
