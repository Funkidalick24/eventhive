import Link from "next/link";
import { Container } from "../components/container";
import { getPublishedOrganizerCards } from "@/lib/db";

export default function OrganizersPage() {
  const organizerCards = getPublishedOrganizerCards();

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
          {organizerCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center shadow-sm">
              <h2 className="font-heading text-xl font-semibold tracking-tight md:text-2xl">
                Start organizing your first event
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Create an event to unlock organizer tools like guest management,
                RSVP tracking, and task checklists.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {organizerCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <h2 className="font-heading text-xl font-semibold tracking-tight">
                    {card.headline}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {card.body}
                  </p>
                  {card.example ? (
                    <p className="mt-4 rounded-xl bg-muted/35 px-4 py-3 text-sm text-foreground/90">
                      Example: {card.example}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
