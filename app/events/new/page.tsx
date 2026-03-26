import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyJwt } from "@/lib/auth";
import { Container } from "@/app/components/container";
import { NewEventForm } from "./new-event-form";

export default async function NewEventPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("eventhive_session")?.value;

  if (!token || !verifyJwt(token)) {
    redirect("/signin");
  }

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-xl space-y-6">
          <header>
            <Link
              href="/events"
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Back to events
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Create a new event
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill in the details below. Once created, you can start adding guests.
            </p>
          </header>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <NewEventForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
