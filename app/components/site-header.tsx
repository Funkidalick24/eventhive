import Link from "next/link";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { getUserById } from "@/lib/db";
import { CalendarIcon } from "./icons";
import { Container } from "./container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/organizers", label: "Organizers" },
] as const;

const SESSION_COOKIE = "eventhive_session";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  const payload = token ? verifyJwt(token) : null;
  const user = payload ? getUserById(payload.sub) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <CalendarIcon className="size-5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              EventHive
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {user ? (
            <details className="relative">
              <summary className="inline-flex h-10 list-none items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold shadow-sm transition hover:bg-muted [&::-webkit-details-marker]:hidden">
                <span className="max-w-[10rem] truncate">{user.name}</span>
                <span className="text-muted-foreground" aria-hidden="true">
                  ▾
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Dashboard
                </Link>
                <Link
                  href="/api/auth/logout"
                  className="block px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-muted"
                >
                  Logout
                </Link>
              </div>
            </details>
          ) : (
            <Link
              href="/signin"
              className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
            >
              Login
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}
