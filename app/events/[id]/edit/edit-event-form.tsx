"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  eventId: number;
  initialName: string;
  initialDate: string;
  initialLocation: string;
  initialDescription: string;
};

export function EditEventForm({
  eventId,
  initialName,
  initialDate,
  initialLocation,
  initialDescription,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(initialDate);
  const [location, setLocation] = useState(initialLocation);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, location, description }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to update event.");
      } else {
        setSuccess(true);
        router.refresh();
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

      {success && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          Event updated successfully!
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/events/${eventId}`)}
          className="inline-flex h-10 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
