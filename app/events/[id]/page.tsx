import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifyJwt } from "@/lib/auth";
import { getEventById, getGuestsByEventId } from "@/lib/db";
import { Container } from "@/app/components/container";
import { AddGuestForm } from "./add-guest-form";
import { DeleteEventButton } from "./delete-event-button";
import { RemoveGuestButton } from "./remove-guest-button";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);

  if (isNaN(eventId)) notFound();

  const event = getEventById(eventId);
  if (!event) notFound();

  const guests = getGuestsByEventId(eventId);

  const cookieStore = await cookies();
  const token = cookieStore.get("eventhive_session")?.value;
  const payload = token ? verifyJwt(token) : null;
  const isAuthenticated = !!payload;
  const isOwner = payload?.sub === event.organizer_id;

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              {event.location && <span>📍 {event.location}</span>}
            </div>
            {event.description && (
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                {event.description}
              </p>
            )}

            {isOwner && (
              <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5">
                <Link
                  href={`/events/${eventId}/edit`}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                >
                  Edit event
                </Link>
                <DeleteEventButton eventId={eventId} />
              </div>
            )}
          </header>

          {/* Add guest form – only for signed-in users */}
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
                to add guests to this event.
              </p>
            </div>
          )}

          {/* Guest list */}
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Guest list
              </h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                {guests.length}
              </span>
            </div>

            {guests.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No guests added yet. Be the first to RSVP!
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {guests.map((guest) => (
                  <li
                    key={guest.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{guest.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {guest.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {guest.rsvp_status}
                      </span>
                      {isAuthenticated && (
                        <RemoveGuestButton guestId={guest.id} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </Container>
    </main>
  );
}
