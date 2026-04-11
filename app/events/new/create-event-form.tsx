"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScheduleCard, serializeScheduleCards } from "@/lib/schedule";
import {
  CalendarIcon,
  ClockIcon,
  EditIcon,
  MapPinIcon,
  PlusIcon,
  SparkIcon,
  TrashIcon,
  XCircleIcon,
} from "@/app/components/icons";

export function CreateEventForm({ cancelHref = "/dashboard/events" }: { cancelHref?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleCards, setScheduleCards] = useState<ScheduleCard[]>([
    { time: "", title: "", details: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const schedule = serializeScheduleCards(scheduleCards);
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date,
          time,
          location,
          description,
          schedule: schedule ?? "",
        }),
      });

      const data = (await res.json()) as { id?: number; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to create event.");
        return;
      }

      if (!data.id) {
        setError("Event created, but no ID was returned.");
        return;
      }

      router.push(`/events/${data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateCard(index: number, patch: Partial<ScheduleCard>) {
    setScheduleCards((current) =>
      current.map((card, cardIndex) =>
        cardIndex === index ? { ...card, ...patch } : card
      )
    );
  }

  function addCard() {
    setScheduleCards((current) => [...current, { time: "", title: "", details: "" }]);
  }

  function removeCard(index: number) {
    setScheduleCards((current) => {
      const next = current.filter((_, cardIndex) => cardIndex !== index);
      return next.length > 0 ? next : [{ time: "", title: "", details: "" }];
    });
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
          placeholder="AI & Product Meetup"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="event-date" className="text-sm font-medium">
          Date <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="event-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="event-time" className="text-sm font-medium">
          Time
        </label>
        <div className="relative">
          <ClockIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="event-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="event-location" className="text-sm font-medium">
          Location
        </label>
        <div className="relative">
          <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="event-location"
            type="text"
            placeholder="Innovation Hub, Room 204"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="event-description" className="text-sm font-medium">
          About / details
        </label>
        <div className="relative">
          <EditIcon className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
          <textarea
            id="event-description"
            rows={3}
            placeholder="A 90-minute meetup with a short talk, demos, and networking."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium">Schedule cards (optional)</label>
        <p className="text-xs text-muted-foreground">
          Add time cards to make your schedule easier to scan on the event page.
        </p>
        <div className="grid gap-3">
          {scheduleCards.map((card, index) => (
            <div
              key={`schedule-card-${index}`}
              className="rounded-xl border border-border bg-background p-3"
            >
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`event-schedule-time-${index}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Time
                  </label>
                  <input
                    id={`event-schedule-time-${index}`}
                    type="time"
                    value={card.time}
                    onChange={(e) => updateCard(index, { time: e.target.value })}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor={`event-schedule-title-${index}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Title
                  </label>
                  <input
                    id={`event-schedule-title-${index}`}
                    type="text"
                    value={card.title}
                    placeholder="Check-in and welcome"
                    onChange={(e) => updateCard(index, { title: e.target.value })}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label
                    htmlFor={`event-schedule-details-${index}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Details (optional)
                  </label>
                  <textarea
                    id={`event-schedule-details-${index}`}
                    rows={2}
                    value={card.details}
                    placeholder="Quick notes for this time card"
                    onChange={(e) => updateCard(index, { details: e.target.value })}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold transition hover:bg-muted"
                  >
                    <TrashIcon className="size-3.5" />
                    Remove card
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCard}
          className="mt-1 inline-flex h-9 w-fit items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition hover:bg-muted"
        >
          <PlusIcon className="size-4" /> Add time card
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:opacity-50"
        >
          <SparkIcon className="size-4" />
          {loading ? "Creating…" : "Create event"}
        </button>
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
        >
          <XCircleIcon className="size-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}
