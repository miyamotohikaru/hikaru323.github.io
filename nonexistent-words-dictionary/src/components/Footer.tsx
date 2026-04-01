"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-title">
          {t("footer.title")} —{" "}
          <span className="footer-en">FICTIONARY</span>
        </p>
        <p className="footer-sub">{t("footer.sub")}</p>
        <nav className="footer-nav">
          <Link href="/about">{t("footer.about")}</Link>
          <Link href="/privacy">{t("footer.privacy")}</Link>
        </nav>
      </div>
    </footer>
  );
}
