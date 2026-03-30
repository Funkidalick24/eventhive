import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://eventhive.app"),
  title: {
    default: "EventHive",
    template: "%s | EventHive",
  },
  description: "Discover events and manage your RSVPs in one place.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EventHive",
    description: "Discover events and manage your RSVPs in one place.",
    url: "https://eventhive.app",
    siteName: "EventHive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventHive",
    description: "Discover events and manage your RSVPs in one place.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
  try {
    const theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.classList.add(theme);
    }
  } catch {}
})();`}
        </Script>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
