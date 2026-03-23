"use client";

import { useState, useEffect, useMemo } from "react";

interface DictionaryPageProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClosed?: () => void;
}

export default function DictionaryPage({ isOpen, children, onClosed }: DictionaryPageProps) {
  const [state, setState] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const pageNumber = useMemo(() => Math.floor(Math.random() * 900) + 100, []);

  useEffect(() => {
    if (isOpen && (state === "closed" || state === "closing")) {
      setState("opening");
      const t = setTimeout(() => setState("open"), 1050);
      return () => clearTimeout(t);
    }
    if (!isOpen && (state === "open" || state === "opening")) {
      setState("closing");
      const t = setTimeout(() => {
        setState("closed");
        onClosed?.();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (state === "closed") return null;

  const isAnimating = state === "opening";

  return (
    <div className={`dict-page dict-page--${state}`}>
      <div className="dict-page__paper">
        {/* Binding shadow (left edge) */}
        <div className="dict-page__binding" />

        {/* Ruled lines decoration */}
        <div className="dict-page__lines">
          <div className="dict-page__line" />
          <div className="dict-page__line" />
          <div className="dict-page__line" />
          <div className="dict-page__line" />
        </div>

        {/* Page number */}
        <span className="dict-page__number">p.{pageNumber}</span>

        {/* Content with ink reveal */}
        <div className={`dict-page__content ${isAnimating ? "dict-page__content--revealing" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
