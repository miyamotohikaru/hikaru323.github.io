import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ふりっぷ一覧 | 株式会社こす.くま",
  description:
    "ふりっぷ【名】日常を、ほんの少しひっくり返すきっかけ。こす.くまがつくった小さなあそびと実験の一覧です。",
  openGraph: {
    title: "ふりっぷ一覧 | 株式会社こす.くま",
    description: "日常を、ほんの少しひっくり返すきっかけ。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
