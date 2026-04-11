import Link from "next/link";
import { Container } from "../components/container";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  PlusIcon,
  SparkIcon,
  UserIcon,
} from "../components/icons";

type OrganizerCardItem = Awaited<
  ReturnType<typeof prisma.organizerCard.findMany>
>[number];

export default async function OrganizersPage() {
  const organizerCards: OrganizerCardItem[] = await prisma.organizerCard.findMany({
    where: { is_published: true },
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
  });

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
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium shadow-sm transition hover:bg-muted"
              >
                <ArrowLeftIcon className="size-4" />
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
                { label: "Create event", Icon: PlusIcon },
                { label: "Set RSVP", Icon: UserIcon },
                { label: "Publish", Icon: SparkIcon },
                { label: "Check-in", Icon: CheckCircleIcon },
                { label: "Post-event follow-up", Icon: CalendarIcon },
              ].map((step, index) => (
                <li
                  key={step.label}
                  className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur"
                >
                  <p className="text-sm font-semibold text-primary">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
                    <step.Icon className="size-4 text-primary" />
                    {step.label}
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
                No organizer cards published yet
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Add organizer cards in the database and they will appear here automatically.
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
