import type { Metadata } from "next";
import { Inter, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} ${geistMono.variable} min-h-dvh bg-background text-foreground antialiased`}
      >
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
