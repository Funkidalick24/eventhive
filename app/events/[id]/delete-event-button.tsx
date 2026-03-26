"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteEventButton({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to delete event.");
        setConfirming(false);
      } else {
        router.push("/events");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex h-9 items-center justify-center rounded-full bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition hover:brightness-95 disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex h-10 items-center justify-center rounded-full border border-destructive/30 px-5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
    >
      Delete event
    </button>
  );
}
