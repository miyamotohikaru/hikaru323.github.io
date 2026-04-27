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
        <Link href="/" className="header-logo-group">
          <span className="header-logo">{t("home.title")}</span>
          <span className="header-logo-en">FICTIONARY</span>
        </Link>
        <nav className="header-nav">
          <Link href="/" className="header-link header-link--bordered">
            {t("nav.register")}
          </Link>
          <Link href="/browse" className="header-link">
            {t("nav.dictionary")}
          </Link>
          <Link href="/ranking" className="header-link">
            {t("nav.ranking")}
          </Link>
          <RandomWordButton />
          <span className="header-divider" />
          <div className="lang-switcher">
            <button
              className="lang-switcher-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              title="Language"
            >
              {SUPPORTED_LANGS.find((l) => l.code === lang)?.label || "日本語"} ▾
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
