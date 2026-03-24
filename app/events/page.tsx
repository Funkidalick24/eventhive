import Link from "next/link";
import { listUpcomingEvents } from "@/lib/db";
import { Container } from "../components/container";

function formatEventDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export default async function EventsPage() {
  const events = listUpcomingEvents();

  return (
    <main>
      <section className="border-b border-border/70 bg-muted/20 py-12 md:py-16">
        <Container>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">Events</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Browse events
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Discover what&apos;s upcoming around you. This list now loads from
              the app database so live event inventory appears here
              automatically.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-medium shadow-sm transition hover:bg-muted"
              >
                Back to home
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          {events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/10 to-muted" />
                  <div className="space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {formatEventDate(event.starts_at)}
                    </p>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      {event.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {event.summary}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.venue_name} · {event.city}, {event.region}
                    </p>
                    <div className="pt-1">
                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-medium shadow-sm transition hover:bg-muted"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center md:p-12">
              <p className="text-sm font-semibold text-primary">No events yet</p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                Nothing scheduled right now
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                We don&apos;t have any published events at the moment. Be the
                first organizer to publish one and get your page listed here.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/organizers"
                  className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Publish an event
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-medium shadow-sm transition hover:bg-muted"
                >
                  Create organizer account
                </Link>
              </div>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
