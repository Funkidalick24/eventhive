"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewEventForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, location, description }),
      });

      const data = (await res.json()) as { id?: number; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to create event. Please try again.");
      } else {
        router.push(`/events/${data.id}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-1.5">
        <label htmlFor="event-name" className="text-sm font-medium">
          Event name <span className="text-destructive">*</span>
        </label>
        <input
          id="event-name"
          type="text"
          required
          placeholder="End-of-semester party"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="event-date" className="text-sm font-medium">
          Date <span className="text-destructive">*</span>
        </label>
        <input
          id="event-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="event-location" className="text-sm font-medium">
          Location
        </label>
        <input
          id="event-location"
          type="text"
          placeholder="Room 101, Main Campus"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="event-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="event-description"
          rows={3}
          placeholder="What's this event about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create event"}
        </button>
      </div>
    </form>
  );
}
