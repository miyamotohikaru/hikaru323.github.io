"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { stats } from "@/data/jobs";

const nav = [
  { href: "/", label: "索引" },
  { href: "/timeline", label: "年表" },
  { href: "/lineage", label: "系譜" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/jobs") : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-vja-line bg-vja-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-logo text-lg font-bold italic tracking-wide md:text-xl">
            Vanished Jobs Archive.
          </span>
          <span className="font-mono-label hidden text-[10px] tracking-[0.2em] text-vja-ink-soft sm:inline">
            ARCHIVE · {stats.total} ENTRIES
          </span>
        </Link>
        <nav className="hidden items-baseline gap-6 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`pb-0.5 text-sm tracking-[0.3em] ${
                isActive(n.href)
                  ? "border-b border-vja-ink font-semibold"
                  : "text-vja-ink-soft hover:text-vja-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <span className="font-mono-label rounded-full border border-vja-line px-2.5 py-0.5 text-[10px] tracking-widest text-vja-ink-soft">
            JA
          </span>
        </nav>
      </div>
    </header>
  );
}
