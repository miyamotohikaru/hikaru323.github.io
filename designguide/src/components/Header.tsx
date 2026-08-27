"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "図鑑", en: "Atlas" },
  { href: "/build", label: "プロンプトを組む", en: "Build" },
  { href: "/recipes", label: "レシピ", en: "Recipes" },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="sa-header">
      <div className="shell sa-header__in">
        <Link href="/" className="sa-mark" aria-label="STYLE ATLAS トップへ">
          <span className="sa-mark__glyph" aria-hidden>▚</span>
          <span className="sa-mark__text">STYLE&nbsp;ATLAS</span>
        </Link>

        <nav className="sa-nav">
          {NAV.map((n) => {
            const on = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className="sa-nav__a" data-on={on || undefined}>
                <span className="sa-nav__ja">{n.label}</span>
                <span className="sa-nav__en">{n.en}</span>
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
