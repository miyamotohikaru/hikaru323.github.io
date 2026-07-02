import type { Metadata } from "next";
import { IBM_Plex_Mono, Playfair_Display, Shippori_Mincho } from "next/font/google";
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
  title: "Diagnosis. Archive",
  description: "その障害は、いつから障害になったのか。",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${playfair.variable} ${shippori.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
