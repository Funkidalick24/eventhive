import Link from "next/link";
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
                ? "Your published events will appear here. Start with the organizer flow to add your first listing."
                : "No events are available yet. Check back soon or explore organizer examples while listings are being added."}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={isOrganizer ? "/organizers" : "/dashboard?role=attendee"}
                className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
              >
                {isOrganizer ? "Open organizer guide" : "Go to dashboard"}
              </Link>
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
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              No event data yet
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              {isOrganizer
                ? "Publish your first event to populate this page, then track signups and updates from one place."
                : "Once organizers publish events, you’ll be able to browse schedules and RSVP from this page."}
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
