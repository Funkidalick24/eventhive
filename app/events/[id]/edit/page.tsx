import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifyJwt } from "@/lib/auth";
import { getEventById } from "@/lib/db";
import { Container } from "@/app/components/container";
import { EditEventForm } from "./edit-event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("eventhive_session")?.value;
  const payload = token ? verifyJwt(token) : null;

  if (!payload) {
    redirect("/signin");
  }

  const { id } = await params;
  const eventId = Number(id);
  if (isNaN(eventId)) notFound();

  const event = getEventById(eventId);
  if (!event) notFound();

  if (event.organizer_id !== payload.sub) {
    redirect(`/events/${eventId}`);
  }

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-xl space-y-6">
          <header>
            <Link
              href={`/events/${eventId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Back to event
            </Link>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Edit event
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the event details below. Only the event owner can make changes.
            </p>
          </header>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <EditEventForm
              eventId={eventId}
              initialName={event.name}
              initialDate={event.date}
              initialLocation={event.location ?? ""}
              initialDescription={event.description ?? ""}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
