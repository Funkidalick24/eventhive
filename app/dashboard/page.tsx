import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { Container } from "../components/container";

const SESSION_COOKIE = "eventhive_session";
type UserRole = "attendee" | "organizer";

function getRoleFromQuery(roleParam?: string): UserRole {
  return roleParam === "organizer" ? "organizer" : "attendee";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect("/signin");
  }

  const payload = verifyJwt(token);

  if (!payload) {
    redirect("/signin");
  }

  const user = getUserById(payload.sub);

  if (!user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const role = getRoleFromQuery(params.role);
  const isOrganizer = role === "organizer";
  const eventsHref = `/events?role=${role}`;

  return (
    <main className="py-14 md:py-20">
      <Container>
        <div className="mx-auto grid max-w-3xl gap-6">
          <header className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-sm font-semibold text-primary">Dashboard</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Signed in as {user.email}.
            </p>
            <p className="mt-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {isOrganizer ? "Organizer view" : "Attendee view"}
            </p>
          </header>

          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Your activity
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Your upcoming events and recent activity will appear here once you start{" "}
              {isOrganizer ? "publishing events." : "browsing and RSVPing to events."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {isOrganizer ? (
                <>
                  <Link
                    href="/organizers"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                  >
                    Review organizer workflow
                  </Link>
                  <Link
                    href={eventsHref}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                  >
                    Preview event listings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={eventsHref}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                  >
                    Browse events
                  </Link>
                  <Link
                    href="/organizers"
                    className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                  >
                    Learn organizer tools
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
