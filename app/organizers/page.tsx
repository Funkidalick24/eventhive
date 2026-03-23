import Link from "next/link";
import { Container } from "../components/container";

export default function OrganizersPage() {
  return (
    <main>
      <section className="border-b border-border/70 bg-muted/20 py-12 md:py-16">
        <Container>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">Organizers</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Built for organizers
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              Create polished event pages, manage RSVPs, and keep attendees
              informed—without juggling multiple tools.
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
          <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-sm md:p-10">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                How it works
              </h2>
              <p className="max-w-2xl text-muted-foreground">
                A simple flow from idea to check-in.
              </p>
            </div>

            <ol className="grid gap-4 md:grid-cols-5">
              {[
                "Create event",
                "Set RSVP",
                "Publish",
                "Check-in",
                "Post-event follow-up",
              ].map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur"
                >
                  <p className="text-sm font-semibold text-primary">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 font-heading text-lg font-semibold tracking-tight">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              "Create your event page",
              "Manage attendees and RSVPs",
              "Keep attendees informed",
            ].map((title) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Placeholder content — replace with real organizer details and
                  flows.
                </p>
                <div className="mt-5 h-10 w-36 rounded-full bg-muted/40" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
