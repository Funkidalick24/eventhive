import Link from "next/link";
import { Container } from "./components/container";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  LockIcon,
  PlusIcon,
  SparkIcon,
  UserIcon,
} from "./components/icons";
import { prisma } from "@/lib/prisma";
import {
  formatHHMMToLocale,
  getLocalDateYYYYMMDD,
  parseYYYYMMDDToLocalDate,
} from "@/lib/date";
import { parseScheduleCardsForDisplay } from "@/lib/schedule";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatEventDateLabel(date: string, time: string | null) {
  const localDate = parseYYYYMMDDToLocalDate(date);
  const today = getLocalDateYYYYMMDD();
  const dayLabel =
    date === today
      ? "Today"
      : localDate
        ? localDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date;

  return time ? `${dayLabel} • ${formatHHMMToLocale(time)}` : dayLabel;
}

function eventStartMs(date: string, time: string | null) {
  const parsedDate = parseYYYYMMDDToLocalDate(date);
  if (!parsedDate) return Number.MAX_SAFE_INTEGER;
  const [hours, minutes] = time?.split(":").map(Number) ?? [23, 59];
  parsedDate.setHours(Number.isFinite(hours) ? hours : 23, Number.isFinite(minutes) ? minutes : 59, 0, 0);
  return parsedDate.getTime();
}

export default async function Home() {
  const today = getLocalDateYYYYMMDD();
  const weekEnd = getLocalDateYYYYMMDD(addDays(new Date(), 7));
  const upcomingEventsRaw = await prisma.event.findMany({
    where: { date: { gte: today } },
    orderBy: [{ date: "asc" }],
    select: {
      id: true,
      name: true,
      date: true,
      time: true,
      location: true,
      description: true,
      schedule: true,
    },
  });
  const upcomingEvents = [...upcomingEventsRaw]
    .sort((a, b) => eventStartMs(a.date, a.time) - eventStartMs(b.date, b.time))
    .slice(0, 3);
  const eventsThisWeek = await prisma.event.count({
    where: { date: { gte: today, lte: weekEnd } },
  });

  const primaryEvent = upcomingEvents[0] ?? null;
  const secondaryEvent = upcomingEvents[1] ?? primaryEvent;
  const primarySchedule = parseScheduleCardsForDisplay(primaryEvent?.schedule);
  const secondarySchedule = parseScheduleCardsForDisplay(secondaryEvent?.schedule);
  const primaryScheduleItems = primarySchedule.cards.slice(0, 4);
  const secondaryScheduleItems = secondarySchedule.cards.slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/70 pt-20 pb-24 md:pt-24 md:pb-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <span className="size-2 rounded-full bg-primary" />
                High-clarity event workspace
              </div>
              <h1 className="mt-6 font-heading text-5xl font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl">
                Architecting{" "}
                <span className="text-primary italic">momentum</span> for your
                next event.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                A modern, calm space to publish events, share schedules, and let
                people RSVP—without exposing your guest list.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-95 active:scale-[0.99]"
                >
                  <ArrowRightIcon className="size-4" />
                  Browse events
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 text-sm font-semibold transition hover:bg-muted active:scale-[0.99]"
                >
                  <SparkIcon className="size-4" />
                  Organizer dashboard
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2.25rem] border border-border bg-card p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.18)]">
                <div className="rounded-2xl bg-background p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        This week at a glance
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {eventsThisWeek} event{eventsThisWeek === 1 ? "" : "s"} ready to share
                      </p>
                    </div>
                    <span className="inline-flex h-9 items-center rounded-full bg-primary/15 px-3 text-xs font-semibold text-primary">
                      Live
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                          Upcoming
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {primaryEvent
                            ? formatEventDateLabel(primaryEvent.date, primaryEvent.time)
                            : "No upcoming events"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        {primaryEvent?.name ?? "Publish your first event"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {primaryEvent?.description?.trim()
                          ? primaryEvent.description
                          : primaryEvent?.location
                            ? `Location: ${primaryEvent.location}`
                            : "Create an event in the dashboard to populate this preview."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
                          Schedule
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {secondaryScheduleItems.length > 0 ? "Shared" : "Draft"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        {secondaryEvent?.name ?? "Schedule preview"}
                      </p>
                      {secondaryScheduleItems.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {secondaryScheduleItems.map((item, index) => (
                            <li key={`${item.time}-${item.title}-${index}`}>
                              {(item.time ? `${formatHHMMToLocale(item.time)} ` : "") +
                                (item.title || "Schedule item")}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Add schedule cards to your events to display them here.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-primary/10 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-secondary/10 blur-[100px]" />
            </div>
          </div>
        </Container>
      </section>

      {/* Metrics */}
      <section className="border-y border-border/50 bg-muted/20 py-10">
        <Container>
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <span className="block font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Fast
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Event pages
              </span>
            </div>
            <div>
              <span className="block font-heading text-3xl font-semibold text-primary md:text-4xl">
                Private
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Guest lists
              </span>
            </div>
            <div>
              <span className="block font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Clear
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Schedules
              </span>
            </div>
            <div>
              <span className="block font-heading text-3xl font-semibold text-foreground md:text-4xl">
                Simple
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                RSVPs
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Features
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Everything you need—kept intentionally simple.
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground md:text-base">
                EventHive focuses on the essentials: a clean event page, an
                optional schedule, and a privacy-first RSVP flow.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-8 rounded-[2rem] border border-border bg-card p-8 md:p-10">
                <h3 className="font-heading text-2xl font-semibold tracking-tight">
                  Schedule-first event pages
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                  Share what&apos;s happening, when it&apos;s happening, and where
                  to be—without clutter.
                </p>
                <div className="mt-8 rounded-2xl border border-border bg-background p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      {primaryEvent?.name ?? "Your event schedule"}
                    </p>
                    <span className="inline-flex h-8 items-center rounded-full bg-primary/15 px-3 text-xs font-semibold text-primary">
                      {primaryEvent ? "RSVP open" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {primaryScheduleItems.length > 0 ? (
                      primaryScheduleItems.map((item, index) => (
                        <div
                          key={`${item.time}-${item.title}-${index}`}
                          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                        >
                          <p className="text-sm text-foreground">
                            {item.title || "Schedule item"}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            {item.time ? formatHHMMToLocale(item.time) : "TBD"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-3">
                        <p className="text-sm text-muted-foreground">
                          Add schedule cards in your dashboard event editor to populate this section.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 rounded-[2rem] bg-primary p-8 text-primary-foreground md:p-10">
                <h3 className="font-heading text-2xl font-semibold tracking-tight">
                  Privacy-first RSVPs
                </h3>
                <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
                  People can RSVP without seeing who else signed up.
                </p>
                <div className="mt-8 space-y-3">
                  <div className="rounded-2xl bg-primary-foreground/10 p-4">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <LockIcon className="size-4" />
                      No public guest list
                    </p>
                    <p className="mt-1 text-xs text-primary-foreground/80">
                      Only the organizer can view attendees.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-primary-foreground/10 p-4">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <CheckCircleIcon className="size-4" />
                      Simple RSVP status
                    </p>
                    <p className="mt-1 text-xs text-primary-foreground/80">
                      Keep confirmations clear and consistent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 rounded-[2rem] border border-border bg-card p-8 md:p-10">
                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  Organizer dashboard
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                  Edit your events in one place and keep details up to date.
                </p>
                <Link
                  href="/dashboard/events"
                  className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold transition hover:bg-muted"
                >
                  <CalendarIcon className="size-4" />
                  Manage events
                </Link>
              </div>

              <div className="md:col-span-8 rounded-[2rem] border border-border bg-muted/20 p-8 md:p-10">
                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  Built for speed and clarity
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  The UI stays quiet and readable so your event details stand
                  out—on any screen, in any theme.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <SparkIcon className="size-4 text-primary" />
                      Consistent layouts
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Pages look polished without extra effort.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold">
                      <UserIcon className="size-4 text-primary" />
                      Readable by default
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Clean typography and spacing for event content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* About / CTA */}
      <section id="about" className="pb-24">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-10 text-center shadow-sm md:p-16">
              <div className="relative z-10">
                <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-5xl">
                  Make your next event easy to attend.
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Publish the essentials, share a schedule if you have one, and
                  collect RSVPs without turning attendance into a public list.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link
                    href="/events"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-10 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-95"
                  >
                    <ArrowRightIcon className="size-4" />
                    Explore events
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-10 text-sm font-semibold transition hover:bg-muted"
                  >
                    <PlusIcon className="size-4" />
                    Create an account
                  </Link>
                </div>
              </div>

              <div className="pointer-events-none absolute top-0 right-0 size-96 rounded-full bg-primary/10 blur-[120px]" />
              <div className="pointer-events-none absolute bottom-0 left-0 size-96 rounded-full bg-secondary/10 blur-[120px]" />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
