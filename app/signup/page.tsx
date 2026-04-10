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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsDoNotMatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

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
    setPassword("");
    setConfirmPassword("");
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
                placeholder="Alex Johnson"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                name="email"
                required
                placeholder="alex@company.com"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-16 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-2 my-auto h-7 rounded-md px-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                Minimum 8 characters.
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Confirm password</span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full rounded-lg border bg-background px-3 py-2 pr-16 text-sm ${
                    passwordsDoNotMatch ? "border-rose-500" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute inset-y-0 right-2 my-auto h-7 rounded-md px-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordsDoNotMatch ? (
                <span className="text-xs text-rose-600 dark:text-rose-400">
                  Passwords do not match.
                </span>
              ) : null}
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
              disabled={submitting || passwordsDoNotMatch}
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
