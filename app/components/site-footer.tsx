import Link from "next/link";
import { Container } from "./container";
import { CalendarIcon, LockIcon, SparkIcon } from "./icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="font-heading text-lg font-semibold">
              EventHive
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              A calmer way to discover events, RSVP, and stay organized—without
              the noise.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                <CalendarIcon className="size-4 text-primary" />
                Explore
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="/events">
                    Browse events
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/#why">
                    Why EventHive
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/organizers">
                    For organizers
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                <SparkIcon className="size-4 text-primary" />
                Product
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="/#faq">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/contact">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                <LockIcon className="size-4 text-primary" />
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link className="hover:text-foreground" href="/privacy">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-foreground" href="/terms">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border/70 py-6 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} EventHive. All rights reserved.</p>
          <p>Made for events that feel worth leaving home for.</p>
        </div>
      </Container>
    </footer>
  );
}
