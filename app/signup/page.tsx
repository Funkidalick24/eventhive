"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Container } from "../components/container";

export default function SignupPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const role = String(formData.get("role") ?? "attendee");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(data.message ?? "Registration failed.");
      setSubmitting(false);
      return;
    }

    form?.reset();
    setSubmitting(false);
    setMessage(null);
    router.push(`/signin?registered=1&role=${encodeURIComponent(role)}`);
  }

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to manage events and RSVPs.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Name</span>
              <input
                name="name"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

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
                minLength={8}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <span className="text-xs text-muted-foreground">
                Minimum 8 characters.
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">I plan to</span>
              <select
                name="role"
                defaultValue="attendee"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="attendee">Attend events</option>
                <option value="organizer">Organize events</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

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
            Already registered?{" "}
            <Link href="/signin" className="font-medium text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
