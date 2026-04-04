import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/app/components/container";
import { EditEventForm } from "@/app/events/[id]/edit/edit-event-form";
import { DeleteEventButton } from "@/app/events/[id]/delete-event-button";
import { TaskManager } from "./task-manager";

export default async function DashboardEditEventPage({
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

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) notFound();

  if (event.organizer_id !== payload.sub) {
    redirect("/dashboard/events");
  }

  const tasks = await prisma.task.findMany({
    where: { event_id: eventId },
    orderBy: { created_at: "asc" },
  });

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
              Edit event
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update details guests will see on the event page.
            </p>
          </header>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <EditEventForm
              eventId={eventId}
              initialName={event.name}
              initialDate={event.date}
              initialTime={event.time ?? ""}
              initialLocation={event.location ?? ""}
              initialDescription={event.description ?? ""}
              initialSchedule={event.schedule ?? ""}
              cancelHref="/dashboard/events"
            />
            <div className="mt-6 border-t border-border pt-6">
              <DeleteEventButton eventId={eventId} redirectTo="/dashboard/events" />
            </div>
          </div>

          <TaskManager
            eventId={eventId}
            initialTasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              is_completed: task.is_completed,
            }))}
          />
        </div>
      </Container>
    </main>
  );
}

