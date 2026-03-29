import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatHHMMToLocale,
  getLocalDateYYYYMMDD,
  parseYYYYMMDDToLocalDate,
} from "@/lib/date";
import { parseScheduleCardsForDisplay } from "@/lib/schedule";
import { Container } from "@/app/components/container";
import { AddGuestForm } from "./add-guest-form";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) notFound();

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  const today = getLocalDateYYYYMMDD();
  if (event.date < today) {
    await prisma.event.delete({ where: { id: eventId } });
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("eventhive_session")?.value;
  const payload = token ? verifyJwt(token) : null;
  const isAuthenticated = !!payload;
  const isOwner = payload?.sub === event.organizer_id;

  const formattedDate = (
    parseYYYYMMDDToLocalDate(event.date) ?? new Date(event.date)
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const scheduleDisplay = parseScheduleCardsForDisplay(event.schedule);

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Event header */}
          <header className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <Link
              href="/events"
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Back to events
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              {event.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>📅 {formattedDate}</span>
              {event.time && <span>⏰ {formatHHMMToLocale(event.time)}</span>}
              {event.location && <span>📍 {event.location}</span>}
            </div>

            {isOwner && (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5">
                <Link
                  href={`/dashboard/events/${eventId}/edit`}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                >
                  Manage in dashboard
                </Link>
              </div>
            )}
          </header>

          {/* About / details */}
          {(event.description || event.schedule) && (
            <section className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-5">
              {event.description && (
                <div>
                  <h2 className="font-heading text-xl font-semibold tracking-tight">
                    About this event
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {event.schedule && (
                <div>
                  <h2 className="font-heading text-xl font-semibold tracking-tight">
                    Schedule
                  </h2>
                  {scheduleDisplay.cards.length > 0 ? (
                    <div className="mt-3 grid gap-3">
                      {scheduleDisplay.cards.map((card, index) => (
                        <article
                          key={`${card.time}-${card.title}-${index}`}
                          className="rounded-xl border border-border bg-background px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-foreground">
                              {card.title || "Schedule item"}
                            </p>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                              {card.time ? formatHHMMToLocale(card.time) : "TBD"}
                            </p>
                          </div>
                          {card.details ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {card.details}
                            </p>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base whitespace-pre-line">
                      {scheduleDisplay.fallbackText}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* RSVP / sign up (does not reveal guest list) */}
          {isAuthenticated ? (
            <AddGuestForm eventId={eventId} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                <Link
                  href="/signin"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </Link>{" "}
                to RSVP to this event.
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
