import Link from "next/link";
import { cookies } from "next/headers";
import { type Prisma } from "@prisma/client";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInteger, sanitizeOptionalString } from "@/lib/sanitize";
import { Container } from "../components/container";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
} from "../components/icons";
import { EventSearch } from "./event-search";
import {
  formatHHMMToLocale,
  getLocalDateYYYYMMDD,
  normalizeYYYYMMDD,
  parseYYYYMMDDToLocalDate
} from "@/lib/date";

type UserRole = "attendee" | "organizer";
type WhenFilter = "all" | "today" | "week" | "month";
type SortFilter = "soonest" | "latest" | "az";
const EVENTS_PAGE_SIZE = 24;

function getRoleFromQuery(roleParam?: string): UserRole {
  return roleParam === "organizer" ? "organizer" : "attendee";
}

function getWhenFilter(input?: string): WhenFilter {
  if (input === "today" || input === "week" || input === "month") return input;
  return "all";
}

function getSortFilter(input?: string): SortFilter {
  if (input === "latest" || input === "az") return input;
  return "soonest";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildEventsHref(params: {
  role?: string;
  q?: string;
  when?: string;
  date?: string;
  location?: string;
  organizer?: string;
  organizerQ?: string;
  hasTime?: string;
  sort?: string;
  page?: string;
}) {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.q) query.set("q", params.q);
  if (params.when) query.set("when", params.when);
  if (params.date) query.set("date", params.date);
  if (params.location) query.set("location", params.location);
  if (params.organizer) query.set("organizer", params.organizer);
  if (params.organizerQ) query.set("organizerQ", params.organizerQ);
  if (params.hasTime) query.set("hasTime", params.hasTime);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", params.page);
  const queryText = query.toString();
  return queryText ? `/events?${queryText}` : "/events";
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
  searchParams: Promise<{
    role?: string;
    q?: string;
    when?: string;
    date?: string;
    location?: string;
    organizer?: string;
    organizerQ?: string;
    hasTime?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const role = getRoleFromQuery(params.role);
  const isOrganizer = role === "organizer";
  const searchQuery = sanitizeOptionalString(params.q, { maxLength: 120 }) ?? "";
  const whenFilter = getWhenFilter(params.when);
  const exactDate = params.date ? normalizeYYYYMMDD(params.date) : null;
  const locationFilter = sanitizeOptionalString(params.location, { maxLength: 180 });
  const organizerFilter = sanitizeInteger(params.organizer);
  const hasTimeOnly = params.hasTime === "1";
  const sortFilter = getSortFilter(params.sort);
  const pageParam = sanitizeInteger(params.page);
  const page = pageParam && pageParam > 0 ? pageParam : 1;
  const skip = (page - 1) * EVENTS_PAGE_SIZE;

  const today = getLocalDateYYYYMMDD();
  const weekEnd = getLocalDateYYYYMMDD(addDays(new Date(), 7));
  const endOfMonth = getLocalDateYYYYMMDD(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );

  const dateFilter = exactDate
    ? { date: exactDate }
    : whenFilter === "today"
      ? { date: today }
      : whenFilter === "week"
        ? { date: { gte: today, lte: weekEnd } }
      : whenFilter === "month"
          ? { date: { gte: today, lte: endOfMonth } }
          : { date: { gte: today } };

  const where: Prisma.EventWhereInput = {
    ...dateFilter,
    ...(searchQuery
      ? { name: { contains: searchQuery, mode: "insensitive" as const } }
      : {}),
    ...(locationFilter
      ? { location: { contains: locationFilter, mode: "insensitive" as const } }
      : {}),
    ...(organizerFilter !== null ? { organizer_id: organizerFilter } : {}),
    ...(hasTimeOnly ? { time: { not: null } } : {}),
  };

  const orderBy: Prisma.EventOrderByWithRelationInput[] =
    sortFilter === "az"
      ? [{ name: "asc" }, { date: "asc" }, { time: "asc" }, { id: "asc" }]
      : sortFilter === "latest"
        ? [{ date: "desc" }, { time: "desc" }, { id: "desc" }]
        : [{ date: "asc" }, { time: "asc" }, { id: "asc" }];

  await prisma.event.deleteMany({ where: { date: { lt: today } } });
  const [events, totalMatches] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: EVENTS_PAGE_SIZE,
      include: {
        organizer: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.event.count({ where }),
  ]);

  const organizers = await prisma.user.findMany({
    where: { events: { some: { date: { gte: today } } } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const hasMore = page * EVENTS_PAGE_SIZE < totalMatches;
  const eventsStart = totalMatches === 0 ? 0 : skip + 1;
  const eventsEnd = Math.min(skip + events.length, totalMatches);
  const clearFiltersHref = buildEventsHref({ role: params.role });
  const loadMoreHref = buildEventsHref({
    role: params.role,
    q: params.q,
    when: params.when,
    date: params.date,
    location: params.location,
    organizer: params.organizer,
    organizerQ: params.organizerQ,
    hasTime: params.hasTime,
    sort: params.sort,
    page: String(page + 1),
  });

  const cookieStore = await cookies();
  const token = cookieStore.get("eventhive_session")?.value;
  const payload = token ? verifyJwt(token) : null;
  const isAuthenticated = !!payload;
  const hasActiveFilters =
    !!searchQuery ||
    !!locationFilter ||
    organizerFilter !== null ||
    hasTimeOnly ||
    !!exactDate ||
    whenFilter !== "all";

  return (
    <main>
      <section className="border-b border-border/70 bg-muted/20 py-7 md:py-9">
        <Container>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">Events</p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Browse events
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {isOrganizer
                ? "Manage your published events and track guest RSVPs."
                : "Discover upcoming events and add yourself to the guest list."}
            </p>
            {isAuthenticated && (
              <Link
                href="/dashboard/events/new"
                className="mt-2 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
              >
                <PlusIcon className="size-4" />
                Create event
              </Link>
            )}
          </div>
        </Container>
      </section>

      <section className="border-b border-border/70 py-6">
        <Container>
          <EventSearch organizers={organizers} />
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">
              {totalMatches > 0
                ? `Showing ${eventsStart}-${eventsEnd} of ${totalMatches} upcoming events`
                : "Showing 0 events"}
            </p>
            {hasActiveFilters ? (
              <Link
                href={clearFiltersHref}
                className="inline-flex h-9 items-center rounded-lg border border-input bg-background px-3 font-medium transition hover:bg-muted"
              >
                Clear active filters
              </Link>
            ) : null}
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {hasActiveFilters ? "No matching events" : "No events yet"}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                {hasActiveFilters
                  ? "No events match your current filters. Clear filters to view all upcoming events."
                  : "No upcoming events are published yet. Follow organizers or create the first event."}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {hasActiveFilters ? (
                  <Link
                    href={clearFiltersHref}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                  >
                    <ArrowRightIcon className="size-4" />
                    Clear filters
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/organizers"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-background px-5 text-sm font-semibold transition hover:bg-muted"
                    >
                      Browse organizers
                    </Link>
                    {isAuthenticated ? (
                      <Link
                        href="/dashboard/events/new"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                      >
                        <PlusIcon className="size-4" />
                        Create event
                      </Link>
                    ) : (
                      <Link
                        href="/signin"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                      >
                        <ArrowRightIcon className="size-4" />
                        Sign in
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
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
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                        <CalendarIcon className="size-3.5" />
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                          <ClockIcon className="size-3.5" />
                          {formatHHMMToLocale(event.time)}
                        </span>
                      )}
                      {event.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                          <MapPinIcon className="size-3.5" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      View guests <ArrowRightIcon className="size-3.5" />
                    </p>
                  </Link>
                ))}
              </div>
              {hasMore ? (
                <div className="mt-8 flex justify-center">
                  <Link
                    href={loadMoreHref}
                    className="inline-flex h-10 items-center rounded-full border border-input bg-background px-5 text-sm font-semibold transition hover:bg-muted"
                  >
                    Load more events
                  </Link>
                </div>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </main>
  );
}

