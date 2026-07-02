"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { UI, useLang } from "@/lib/i18n";
import { STATS } from "@/lib/meta";
import SearchOverlay from "@/components/SearchOverlay";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`font-display px-1 py-2 text-[15px] italic transition-colors hover:text-da-accent ${
        active ? "text-da-ink underline decoration-da-accent decoration-2 underline-offset-4" : "text-da-muted"
      }`}
    >
      {label}
    </Link>
  );
}

function DesktopNav({ view }: { view: string | null }) {
  const { tx } = useLang();
  const pathname = usePathname();
  return (
    <nav className="ml-auto hidden items-center gap-4 sm:flex" aria-label="Main">
      <NavLink
        href="/"
        label={tx(UI.navIndex)}
        active={(pathname === "/" && view !== "lineage") || pathname.startsWith("/entry")}
      />
      <NavLink href="/?view=lineage" label={tx(UI.navLineage)} active={pathname === "/" && view === "lineage"} />
      <NavLink href="/about" label={tx(UI.navAbout)} active={pathname === "/about"} />
    </nav>
  );
}

function MobileTabs({ view }: { view: string | null }) {
  const { lang, tx } = useLang();
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: tx(UI.backToIndex), active: pathname === "/" && !view },
    { href: "/?view=timeline", label: lang === "ja" ? "年表" : "Timeline", active: pathname === "/" && view === "timeline" },
    { href: "/?view=lineage", label: lang === "ja" ? "系譜" : "Lineage", active: pathname === "/" && view === "lineage" },
    { href: "/about", label: "About", active: pathname === "/about" },
  ];
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t da-hairline bg-da-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm sm:hidden"
    >
      {tabs.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          onClick={(e) => {
            // すでに開いているタブをもう一度タップ → ページ先頭へ戻る
            if (item.active) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`font-mincho flex-1 border-t-2 py-3 text-center text-[13px] transition-colors ${
            item.active ? "border-da-accent text-da-ink" : "border-transparent text-da-muted active:text-da-accent"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopNavWithParams() {
  const view = useSearchParams().get("view");
  return <DesktopNav view={view} />;
}

function MobileTabsWithParams() {
  const view = useSearchParams().get("view");
  return <MobileTabs view={view} />;
}

export default function SiteHeader() {
  const { lang, setLang, tx } = useLang();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b da-hairline bg-da-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-display text-xl font-semibold italic tracking-tight">
              Diagnosis Archive<span className="text-da-accent">.</span>
            </span>
            <span className="hidden font-mono text-[10px] tracking-[0.25em] text-da-muted sm:inline">
              {tx(UI.archive)} · {STATS.entries} {tx(UI.entries)}
            </span>
          </Link>

          <Suspense fallback={<DesktopNav view={null} />}>
            <DesktopNavWithParams />
          </Suspense>

          <div className="ml-auto flex items-center gap-1 border-l da-hairline pl-3 sm:ml-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={tx(UI.search)}
              className="grid h-10 w-10 place-items-center rounded-full text-da-ink transition-colors hover:bg-da-ink/8"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path d="m13.2 13.2 3.6 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setLang(lang === "ja" ? "en" : "ja")}
              className="rounded px-2.5 py-2.5 font-mono text-[11px] tracking-[0.2em] transition-colors hover:bg-da-ink/8"
              aria-label={lang === "ja" ? "Switch to English" : "日本語に切り替え"}
            >
              {lang === "ja" ? "JA" : "EN"} ▾
            </button>
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      <Suspense fallback={<MobileTabs view={null} />}>
        <MobileTabsWithParams />
      </Suspense>
    </>
  );
}
