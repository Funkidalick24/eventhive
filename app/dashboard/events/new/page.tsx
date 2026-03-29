import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifyJwt } from "@/lib/auth";
import { Container } from "@/app/components/container";
import { CreateEventForm } from "@/app/events/new/create-event-form";

const SESSION_COOKIE = "eventhive_session";

export default async function DashboardNewEventPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = token ? verifyJwt(token) : null;

  if (!payload) {
    redirect("/signin");
  }

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-xl space-y-6">
          <header>
            <Link
              href="/dashboard/events"
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Back to your events
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Create event
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add details and schedule cards. You can edit or delete the event later.
            </p>
          </header>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <CreateEventForm cancelHref="/dashboard/events" />
          </div>
        </div>
      </Container>
    </main>
  );
}
