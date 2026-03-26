import Link from "next/link";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { getAllEvents } from "@/lib/db";
import { Container } from "../components/container";

type UserRole = "attendee" | "organizer";

function getRoleFromQuery(roleParam?: string): UserRole {
  return roleParam === "organizer" ? "organizer" : "attendee";
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role = getRoleFromQuery(params.role);
  const isOrganizer = role === "organizer";

  const events = getAllEvents();

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
            {isAuthenticated && (
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/events/new"
                  className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                >
                  + Create event
                </Link>
              </div>
            )}
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
                {isAuthenticated
                  ? "Create your first event and start adding guests."
                  : "Sign in to create and manage events."}
              </p>
              {isAuthenticated ? (
                <Link
                  href="/events/new"
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                >
                  Create your first event
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                >
                  Sign in
                </Link>
              )}
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
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>
                      {"Date: "}
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {event.location && <span>{"Location: "}{event.location}</span>}
                  </div>
                  {event.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
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
