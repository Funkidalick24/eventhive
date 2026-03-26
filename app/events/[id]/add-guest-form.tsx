"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        Add a guest
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the guest&apos;s name and email. Their RSVP status will default to{" "}
        <strong>Pending</strong>.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="guest-name" className="text-sm font-medium">
            Full name <span className="text-destructive">*</span>
          </label>
          <input
            id="guest-name"
            type="text"
            required
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="guest-email" className="text-sm font-medium">
            Email address <span className="text-destructive">*</span>
          </label>
          <input
            id="guest-email"
            type="email"
            required
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
            Guest added successfully! RSVP status set to <strong>Pending</strong>.
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add guest"}
          </button>
        </div>
      </form>
    </section>
  );
}
