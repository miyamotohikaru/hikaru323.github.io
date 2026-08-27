"use client";

import { useEffect, useState } from "react";

/**
 * 昼と夜の切り替え。
 * 初期値はサーバでは決められない（localStorage と OS 設定を見るため）。
 * 描く前に layout の script が data-theme を貼っているので、
 * ここでは貼られた値を読むだけにして、ちらつきを起こさない。
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setTheme(t === "dark" ? "dark" : "light");
  }, []);

  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("sa-theme", next);
    } catch {
      /* プライベートブラウズでは保存できない。切り替え自体は効くのでよい */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="sa-theme"
      onClick={flip}
      aria-label={theme === "dark" ? "昼の表示にする" : "夜の表示にする"}
      title={theme === "dark" ? "昼にする" : "夜にする"}
    >
      {/* 中身は CSS で描く。文字を出すと言語で幅が変わる */}
      <span aria-hidden />
    </button>
  );
}
