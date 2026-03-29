import Link from "next/link";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "../components/container";
import {
  formatHHMMToLocale,
  getLocalDateYYYYMMDD,
  parseYYYYMMDDToLocalDate,
} from "@/lib/date";

type UserRole = "attendee" | "organizer";

function getRoleFromQuery(roleParam?: string): UserRole {
  return roleParam === "organizer" ? "organizer" : "attendee";
}

function getEventTeaser(description: string | null, location: string | null) {
  const firstLine = description?.trim().split("\n")[0];
  if (firstLine) return firstLine;
  if (location) return `For attendees gathering at ${location}.`;
  return "Join this upcoming event and RSVP in seconds.";
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role = getRoleFromQuery(params.role);
  const isOrganizer = role === "organizer";

  const today = getLocalDateYYYYMMDD();
  await prisma.event.deleteMany({ where: { date: { lt: today } } });
  const events = await prisma.event.findMany({
    where: { date: { gte: today } },
    orderBy: { date: "asc" },
  });

  const cookieStore = await cookies();
  const token = cookieStore.get("eventhive_session")?.value;
  const payload = token ? verifyJwt(token) : null;
  const isAuthenticated = !!payload;

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
              {isOrganizer
                ? "Manage your published events and track guest RSVPs."
                : "Discover upcoming events and add yourself to the guest list."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                No events yet
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                No upcoming events are published yet. Check back soon.
              </p>
              {!isAuthenticated ? (
                <Link
                  href="/signin"
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
                >
                  <h2 className="font-heading text-lg font-semibold tracking-tight group-hover:text-primary">
                    {event.name}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {getEventTeaser(event.description, event.location)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>
                      {"Date: "}
                      {(parseYYYYMMDDToLocalDate(event.date) ?? new Date(event.date)).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                    {event.time && (
                      <span>
                        {"Time: "}
                        {formatHHMMToLocale(event.time)}
                      </span>
                    )}
                    {event.location && <span>{"Location: "}{event.location}</span>}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-primary">
                    View guests &rarr;
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
