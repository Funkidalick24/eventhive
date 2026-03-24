import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { Container } from "../components/container";

const SESSION_COOKIE = "eventhive_session";

export default async function DashboardPage() {
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
          </header>

          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Quick links
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="inline-flex h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
              >
                Browse events
              </Link>
              <Link
                href="/organizers"
                className="inline-flex h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
              >
                Organizer info
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
