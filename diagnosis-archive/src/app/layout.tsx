import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Playfair_Display, Shippori_Mincho } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import { LangProvider } from "@/lib/i18n";
import { STATS, YEAR_MAX, YEAR_MIN } from "@/lib/meta";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

const shippori = Shippori_Mincho({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mincho",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Diagnosis Archive.",
    template: "%s — Diagnosis Archive.",
  },
  description: "精神医学の診断名151件を、歴史的・批評的にアーカイブする図鑑。",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#e8e5dd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${playfair.variable} ${shippori.variable} ${plexMono.variable} antialiased`}>
        <LangProvider>
          <SiteHeader />
          <main className="min-h-[calc(100dvh-3.5rem)]">{children}</main>
          <footer className="border-t da-hairline pb-16 sm:pb-0">
            <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 py-6 sm:px-6">
              <p className="font-display text-sm italic">
                Diagnosis Archive<span className="text-da-accent">.</span> — ISSUE 01
              </p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-da-muted">
                {STATS.entries} ENTRIES · {YEAR_MIN}—{YEAR_MAX}
              </p>
            </div>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
