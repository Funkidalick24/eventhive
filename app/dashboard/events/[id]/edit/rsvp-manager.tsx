"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  SearchIcon,
  SparkIcon,
} from "@/app/components/icons";
import { RemoveGuestButton } from "@/app/events/[id]/remove-guest-button";
import { RsvpStatusSelect } from "@/app/events/[id]/rsvp-status-select";

type GuestItem = {
  id: number;
  name: string;
  email: string;
  rsvp_status: string;
};

type Props = {
  eventId: number;
  initialGuests: GuestItem[];
};

export function RsvpManager({ eventId, initialGuests }: Props) {
  const router = useRouter();
  const [guests, setGuests] = useState<GuestItem[]>(initialGuests);
  const [query, setQuery] = useState("");
  const [acceptingAll, setAcceptingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGuests = useMemo(() => {
    if (!normalizedQuery) {
      return guests;
    }

    return guests.filter((guest) => {
      return (
        guest.name.toLowerCase().includes(normalizedQuery) ||
        guest.email.toLowerCase().includes(normalizedQuery) ||
        guest.rsvp_status.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [guests, normalizedQuery]);

  const acceptedCount = useMemo(
    () => guests.filter((guest) => guest.rsvp_status === "Accepted").length,
    [guests]
  );
  const allAccepted = guests.length > 0 && acceptedCount === guests.length;

  async function handleAcceptAll() {
    setError(null);
    setAcceptingAll(true);

    try {
      const res = await fetch("/api/guests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, rsvp_status: "Accepted" }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to accept all guests.");
      } else {
        setGuests((current) =>
          current.map((guest) => ({ ...guest, rsvp_status: "Accepted" }))
        );
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setAcceptingAll(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            RSVP management
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Search guests and manage RSVP statuses from your dashboard.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {acceptedCount}/{guests.length} accepted
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or status"
            className="h-10 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>

        <button
          type="button"
          onClick={handleAcceptAll}
          disabled={acceptingAll || guests.length === 0 || allAccepted}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
        >
          <CheckCircleIcon className="size-4" />
          {acceptingAll ? "Accepting..." : "Accept all"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {guests.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground">
          No RSVPs yet. Share your event link to collect responses.
        </p>
      ) : filteredGuests.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground">
          No guests match your search.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="flex items-center justify-between gap-4 bg-background px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{guest.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {guest.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <RsvpStatusSelect
                  guestId={guest.id}
                  currentStatus={guest.rsvp_status}
                />
                <RemoveGuestButton guestId={guest.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {guests.length > 0 && (
        <p className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <SparkIcon className="size-3.5" />
          Changes update in real time and are reflected on refresh.
        </p>
      )}
    </section>
  );
}
