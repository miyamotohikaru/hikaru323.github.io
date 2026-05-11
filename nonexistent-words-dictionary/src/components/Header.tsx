"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RandomWordButton from "@/components/RandomWordButton";
import { useI18n, SUPPORTED_LANGS } from "@/lib/i18n";
import { useState, useCallback, useEffect } from "react";

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="header-logo-group">
          <span className="header-logo">{t("home.title")}</span>
          <span className="header-logo-en">FICTIONARY</span>
        </Link>

        {/* PC nav */}
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

        {/* Mobile hamburger button */}
        <button
          className="mobile-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="メニューを開く"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={closeMenu} />
      )}

      {/* Mobile slide-down menu */}
      <div data-no-scroll-convert className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`}>
        <div className="mobile-menu-header">
          <span className="header-logo">{t("home.title")}</span>
          <button
            className="mobile-close"
            onClick={closeMenu}
            aria-label="メニューを閉じる"
          >
            <span className="close-line close-line-1" />
            <span className="close-line close-line-2" />
          </button>
        </div>
        <nav className="mobile-menu-nav">
          <Link href="/" className="mobile-menu-link" onClick={closeMenu}>
            {t("nav.register")}
          </Link>
          <Link href="/browse" className="mobile-menu-link" onClick={closeMenu}>
            {t("nav.dictionary")}
          </Link>
          <Link href="/ranking" className="mobile-menu-link" onClick={closeMenu}>
            {t("nav.ranking")}
          </Link>
          <div className="mobile-menu-link" style={{ cursor: "default" }}>
            <RandomWordButton />
          </div>
          <div className="mobile-menu-lang">
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l.code}
                className={`mobile-lang-item ${lang === l.code ? "active" : ""}`}
                onClick={() => {
                  setLang(l.code);
                  closeMenu();
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
