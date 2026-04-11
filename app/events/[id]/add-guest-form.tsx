"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MailIcon, SparkIcon, UserIcon } from "@/app/components/icons";

export function AddGuestForm({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, name, email }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to add guest. Please try again.");
      } else {
        setSuccess(true);
        setName("");
        setEmail("");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        RSVP
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your name and email to RSVP. Your RSVP status will default to{" "}
        <strong>Pending</strong>.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="guest-name" className="text-sm font-medium">
            Full name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="guest-name"
              type="text"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="guest-email" className="text-sm font-medium">
            Email address <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="guest-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            RSVP received! Status set to <strong>Pending</strong>.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
          >
            <SparkIcon className="size-4" />
            {loading ? "Submitting…" : "Submit RSVP"}
          </button>
        </div>
      </form>
    </section>
  );
}
