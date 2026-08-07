"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const NAV = [
  { href: "/", label: "CASES", ja: "図版" },
  { href: "/index", label: "INDEX", ja: "索引" },
  { href: "/about", label: "ABOUT", ja: "方針" },
];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    document.body.classList.toggle("locked", isHome);
    document.body.classList.toggle("scrollable", !isHome);
    return () => {
      document.body.classList.remove("locked");
      document.body.classList.remove("scrollable");
    };
  }, [isHome]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-wrap items-baseline gap-x-7 gap-y-2 px-4 py-3.5 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="pointer-events-auto group flex items-baseline gap-2"
        >
          <span className="text-13 font-medium tracking-[-0.01em]">
            世界のFLIP図鑑
          </span>
          <span className="label hidden sm:inline">
            WORLD FLIP ARCHIVE<sup className="text-[0.62em] align-super">®</sup>
          </span>
        </Link>

        <nav className="pointer-events-auto flex items-baseline gap-4 sm:gap-6">
          {NAV.map((n) => {
            const active =
              n.href === "/" ? isHome : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="group relative block"
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`label transition-colors duration-300 ${
                    active ? "!text-ink" : "group-hover:!text-ink"
                  }`}
                >
                  {n.label}
                </span>
                <span
                  className={`absolute -bottom-1 left-0 block h-px bg-ink transition-all duration-500 ease-out ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </header>

      {children}

      {/* 図版ビューにフッターは置かない。版面を固定要素で汚さないため。 */}
      {!isHome && (
        <footer className="mx-auto mt-24 flex max-w-[68rem] items-end justify-between border-t border-line px-4 py-5 sm:px-6">
          <span className="label">
            KOSU.KUMA<span className="hidden sm:inline"> / INTERNAL WORKING DRAFT</span>
          </span>
          <span className="label hidden sm:inline">収録・編集方針 v0.2</span>
        </footer>
      )}
    </>
  );
}
