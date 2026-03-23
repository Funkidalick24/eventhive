import Image from "next/image";
import Link from "next/link";
import { Container } from "./components/container";

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-bg.svg"
            alt=""
            aria-hidden="true"
            fill
            priority
            className="object-cover opacity-80 dark:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>

        <Container>
          <div className="flex min-h-[72vh] items-center justify-center py-20 md:min-h-[80vh] md:py-28">
            <div className="mx-auto max-w-4xl space-y-8 text-center">
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-6 py-2 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
                  The Future of Event Management
                </span>
              </div>

              <h1 className="font-heading text-6xl font-semibold leading-[0.95] tracking-tight text-foreground md:text-8xl lg:text-9xl">
                Events, Simplified
              </h1>

              <p className="mx-auto max-w-3xl text-lg leading-8 text-muted-foreground md:text-2xl md:leading-10">
                Plan smarter. Manage better. Deliver unforgettable experiences.
              </p>

              <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row sm:items-center">
                <Link
                  href="/events"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-base font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                >
                  Browse Events
                </Link>
                <Link
                  href="/organizers"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-border bg-background/60 px-10 text-base font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-muted"
                >
                  Become an Organizer
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="why" className="border-t border-border/70 py-16 md:py-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Why EventHive
              </h2>
              <p className="max-w-prose text-muted-foreground">
                Built for people who attend—and those who create.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/events"
                className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold shadow-sm transition hover:bg-muted"
              >
                Browse events
              </Link>
              <Link
                href="/organizers"
                className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
              >
                For organizers
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm md:p-8">
              <p className="text-sm font-semibold text-primary">For Attendees</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                Find your next event fast
              </h3>
              <div className="mt-6 grid gap-4">
                {[
                  {
                    title: "Find events that actually interest you",
                    body: "No clutter—just relevant events, easy to explore.",
                  },
                  {
                    title: "Join in seconds",
                    body: "No complicated steps. Just quick, simple registration.",
                  },
                  {
                    title: "Stay in the loop",
                    body: "Get clear updates, schedules, and changes in one place.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm md:p-8">
              <p className="text-sm font-semibold text-primary">For Organizers</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                Launch, manage, and scale confidently
              </h3>
              <div className="mt-6 grid gap-4">
                {[
                  {
                    title: "Launch polished event pages instantly",
                    body: "Create and share professional event pages with zero hassle.",
                  },
                  {
                    title: "Manage attendees with ease",
                    body: "Track who’s coming and keep everything organized.",
                  },
                  {
                    title: "Scale without stress",
                    body: "From small meetups to large events—same simple workflow.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-7 shadow-sm md:p-8">
            <h3 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Built for trust and clarity
            </h3>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Clear event info, reliable updates, and a smooth experience for
              everyone.
            </p>
          </div>

          <div className="mt-14 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
                  Featured events
                </h3>
                <p className="text-sm text-muted-foreground">
                  Featured events go here.
                </p>
              </div>
              <Link
                href="/events"
                className="hidden h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold shadow-sm transition hover:bg-muted sm:flex"
              >
                View all
              </Link>
            </div>

            <div
              aria-label="Featured events carousel"
              className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={index}
                  className="w-[18.5rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="aspect-[16/10] bg-muted/40" />
                  <div className="space-y-2 p-5">
                    <div className="h-4 w-24 rounded-full bg-muted/50" />
                    <div className="h-6 w-4/5 rounded-full bg-muted/50" />
                    <div className="h-4 w-1/2 rounded-full bg-muted/50" />
                    <div className="pt-2">
                      <div className="h-10 w-32 rounded-full bg-muted/50" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="faq" className="border-t border-border/70 py-16 md:py-20">
        <Container>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-3">
              <h2 className="font-heading text-3xl font-semibold tracking-tight">
                FAQ
              </h2>
              <p className="text-muted-foreground">
                A few quick answers to the most common questions.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "Do I need an account to browse events?",
                  a: "No—browse freely. You’ll only sign in when you RSVP.",
                },
                {
                  q: "How do RSVP confirmations work?",
                  a: "After you RSVP, your confirmation appears instantly with a QR code and event details.",
                },
                {
                  q: "Can organizers customize their pages?",
                  a: "Yes. Start with a polished default theme, then adjust brand colors, images, and sections.",
                },
              ].map((row) => (
                <details
                  key={row.q}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm"
                >
                  <summary className="cursor-pointer list-none font-semibold">
                    {row.q}
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {row.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
