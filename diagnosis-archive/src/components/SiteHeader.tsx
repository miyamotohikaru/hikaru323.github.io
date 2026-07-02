"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UI, useLang } from "@/lib/i18n";
import { STATS } from "@/lib/meta";
import SearchOverlay from "@/components/SearchOverlay";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`font-display text-[15px] italic transition-colors hover:text-da-accent ${
        active ? "text-da-ink underline decoration-da-accent decoration-2 underline-offset-4" : "text-da-muted"
      }`}
    >
      {label}
    </Link>
  );
}

export default function SiteHeader() {
  const { lang, setLang, tx } = useLang();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b da-hairline bg-da-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-3 outline-none">
            <span className="font-display text-xl font-semibold italic tracking-tight">
              Diagnosis<span className="text-da-accent">.</span>
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.25em] text-da-muted sm:inline">
              {tx(UI.archive)} · {STATS.entries} {tx(UI.entries)}
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-5 sm:flex" aria-label="Main">
            <NavLink href="/" label={tx(UI.navIndex)} active={pathname === "/" || pathname.startsWith("/entry")} />
            <NavLink href="/?view=lineage" label={tx(UI.navLineage)} active={false} />
            <NavLink href="/about" label={tx(UI.navAbout)} active={pathname === "/about"} />
          </nav>

          <div className="ml-auto flex items-center gap-1 border-l da-hairline pl-3 sm:ml-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={tx(UI.search)}
              className="grid h-8 w-8 place-items-center rounded-full text-da-ink transition-colors hover:bg-da-ink/8"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path d="m13.2 13.2 3.6 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setLang(lang === "ja" ? "en" : "ja")}
              className="rounded px-2 py-1 font-mono text-[11px] tracking-[0.2em] transition-colors hover:bg-da-ink/8"
              aria-label={lang === "ja" ? "Switch to English" : "日本語に切り替え"}
            >
              {lang === "ja" ? "JA" : "EN"} ▾
            </button>
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* モバイル下部タブ */}
      <nav
        aria-label="Mobile"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t da-hairline bg-da-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:hidden"
      >
        {[
          { href: "/", label: tx(UI.backToIndex) },
          { href: "/?view=timeline", label: lang === "ja" ? "年表" : "Timeline" },
          { href: "/?view=lineage", label: lang === "ja" ? "系譜" : "Lineage" },
          { href: "/about", label: "About" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-mincho flex-1 py-3 text-center text-[13px] text-da-ink transition-colors active:text-da-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
