import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatHHMMToLocale,
  getLocalDateYYYYMMDD,
  parseYYYYMMDDToLocalDate,
} from "@/lib/date";
import { Container } from "../components/container";

const SESSION_COOKIE = "eventhive_session";
type DashboardTab = "events" | "rsvps";

function getDashboardTab(tabParam: string | undefined, roleParam: string | undefined): DashboardTab {
  if (tabParam === "events" || tabParam === "rsvps") return tabParam;
  return roleParam === "attendee" ? "rsvps" : "events";
}

function eventStartMs(date: string, time: string | null) {
  const parsedDate = parseYYYYMMDDToLocalDate(date);
  if (!parsedDate) return Number.MAX_SAFE_INTEGER;

  const [hours, minutes] = time?.split(":").map(Number) ?? [23, 59];
  parsedDate.setHours(Number.isFinite(hours) ? hours : 23, Number.isFinite(minutes) ? minutes : 59, 0, 0);
  return parsedDate.getTime();
}

function formatEventDate(date: string, time: string | null) {
  const parsedDate = parseYYYYMMDDToLocalDate(date) ?? new Date(date);
  const dateText = parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return time ? `${dateText} • ${formatHHMMToLocale(time)}` : dateText;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; tab?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/signin");
  }

  const payload = verifyJwt(token);

  if (!payload) {
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const activeTab = getDashboardTab(params.tab, params.role);
  const today = getLocalDateYYYYMMDD();

  await prisma.event.deleteMany({
    where: { organizer_id: user.id, date: { lt: today } },
  });

  const myEventsRaw = await prisma.event.findMany({
    where: { organizer_id: user.id, date: { gte: today } },
  });

  const myRsvpsRaw = await prisma.guest.findMany({
    where: { email: user.email, event: { date: { gte: today } } },
    include: { event: true },
  });

  const myEvents = [...myEventsRaw].sort(
    (a, b) => eventStartMs(a.date, a.time) - eventStartMs(b.date, b.time)
  );
  const myRsvps = [...myRsvpsRaw].sort(
    (a, b) => eventStartMs(a.event.date, a.event.time) - eventStartMs(b.event.date, b.event.time)
  );

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-sm font-semibold text-primary">Dashboard</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Signed in as {user.email}.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard?tab=events"
                className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                  activeTab === "events"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                My events ({myEvents.length})
              </Link>
              <Link
                href="/dashboard?tab=rsvps"
                className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                  activeTab === "rsvps"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                My RSVPs ({myRsvps.length})
              </Link>
            </div>
          </header>

          {activeTab === "events" ? (
            <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  My events
                </h2>
                <Link
                  href="/dashboard/events/new"
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                >
                  + Create event
                </Link>
              </div>

              {myEvents.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-background p-8 text-center">
                  <h3 className="font-heading text-xl font-semibold tracking-tight">
                    No events created yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
                    Create your first event in the dashboard and it will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {myEvents.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-2xl border border-border bg-background p-6 shadow-sm"
                    >
                      <h3 className="font-heading text-lg font-semibold tracking-tight">
                        {event.name}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatEventDate(event.date, event.time)}
                        {event.location ? ` • ${event.location}` : ""}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/dashboard/events/${event.id}/edit`}
                          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/events/${event.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold transition hover:bg-muted"
                        >
                          View
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-2xl font-semibold tracking-tight">
                  My RSVPs
                </h2>
                <Link
                  href="/events"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold transition hover:bg-muted"
                >
                  Browse events
                </Link>
              </div>

              {myRsvps.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-background p-8 text-center">
                  <h3 className="font-heading text-xl font-semibold tracking-tight">
                    No RSVPs yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
                    RSVP to events and they will appear here for quick tracking.
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {myRsvps.map((rsvp) => (
                    <article
                      key={rsvp.id}
                      className="rounded-2xl border border-border bg-background p-6 shadow-sm"
                    >
                      <h3 className="font-heading text-lg font-semibold tracking-tight">
                        {rsvp.event.name}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatEventDate(rsvp.event.date, rsvp.event.time)}
                        {rsvp.event.location ? ` • ${rsvp.event.location}` : ""}
                      </p>
                      <p className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        RSVP: {rsvp.rsvp_status}
                      </p>
                      <div className="mt-4">
                        <Link
                          href={`/events/${rsvp.event.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-semibold transition hover:bg-muted"
                        >
                          View event
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </Container>
    </main>
  );
}
