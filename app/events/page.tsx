import Link from "next/link";
import { Container } from "../components/container";

export default function EventsPage() {
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
              Events go here. Add filters, search, and real listings when your
              data source is ready.
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="aspect-video bg-muted/40" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-24 rounded-full bg-muted/50" />
                  <div className="h-6 w-3/4 rounded-full bg-muted/50" />
                  <div className="h-4 w-1/2 rounded-full bg-muted/50" />
                  <div className="pt-2">
                    <div className="h-10 w-32 rounded-full bg-muted/50" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}

