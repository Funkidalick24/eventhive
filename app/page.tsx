import Link from "next/link";
import { Container } from "./components/container";

const attendeePoints = [
  "Discover relevant events quickly",
  "RSVP in a few clicks",
  "Get clear updates in one place",
] as const;

const organizerPoints = [
  "Publish clean event pages fast",
  "Manage attendees without busywork",
  "Run events with a consistent workflow",
] as const;

const faqItems = [
  {
    q: "Do I need an account to browse events?",
    a: "No. You only need to sign in when you RSVP.",
  },
  {
    q: "How do RSVP confirmations work?",
    a: "Your confirmation appears immediately with event details.",
  },
  {
    q: "Can organizers customize event pages?",
    a: "Yes. Start with a clean default and adjust branding as needed.",
  },
] as const;

function BenefitList({
  title,
  points,
}: {
  title: string;
  points: readonly string[];
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 md:p-7">
      <h3 className="font-heading text-xl font-semibold tracking-tight">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-muted-foreground md:text-base">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Home() {
  return (
    <main>
      <section className="border-b border-border/70 py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              EventHive
            </p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-6xl">
              A cleaner way to run and attend events
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Event discovery and event management in one focused workspace—no
              clutter, no noise.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
              >
                Browse events
              </Link>
              <Link
                href="/organizers"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Start organizing
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <BenefitList title="For attendees" points={attendeePoints} />
            <BenefitList title="For organizers" points={organizerPoints} />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 md:p-7">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Featured events
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              New and popular events will appear here.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <article
                  key={index}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="h-28 rounded-lg bg-muted/60" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-20 rounded-full bg-muted/70" />
                    <div className="h-5 w-4/5 rounded-full bg-muted/70" />
                    <div className="h-4 w-1/2 rounded-full bg-muted/70" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border/70 py-14 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-6">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              FAQ
            </h2>
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="rounded-xl border border-border bg-card px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-semibold">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
