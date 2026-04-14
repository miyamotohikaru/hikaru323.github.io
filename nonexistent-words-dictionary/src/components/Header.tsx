"use client";

import Link from "next/link";
import RandomWordButton from "@/components/RandomWordButton";
import { useI18n, SUPPORTED_LANGS } from "@/lib/i18n";
import { useState } from "react";

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-center">
          <Link href="/" className="header-logo-group">
            <span className="header-logo">存在しない言葉辞典</span>
            <span className="header-logo-en">FICTIONARY</span>
          </Link>
        </div>
        <nav className="header-nav">
          <Link href="/" className="header-link">
            {t("nav.register")}
          </Link>
          <Link href="/browse" className="header-link">
            {t("nav.dictionary")}
          </Link>
          <Link href="/ranking" className="header-link">
            {t("nav.ranking")}
          </Link>
          <RandomWordButton />
          <div className="lang-switcher">
            <button
              className="lang-switcher-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              title="Language"
            >
              {SUPPORTED_LANGS.find((l) => l.code === lang)?.label.slice(0, 2) || "ja"}
            </button>
            {showLangMenu && (
              <div className="lang-menu">
                {SUPPORTED_LANGS.map((l) => (
                  <button
                    key={l.code}
                    className={`lang-menu-item ${lang === l.code ? "active" : ""}`}
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
