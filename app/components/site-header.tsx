import Link from "next/link";
import { CalendarIcon } from "./icons";
import { Container } from "./container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/organizers", label: "Organizers" },
  { href: "/signin", label: "Sign in" },
  { href: "/signup", label: "Sign up" },
] as const;

export function SiteHeader() {
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

          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
          >
            Create account
          </Link>
        </div>
      </Container>
    </header>
  );
}
