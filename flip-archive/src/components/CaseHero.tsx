"use client";

import { useState } from "react";
import Plate from "@/components/Plate";
import type { Case } from "@/data/types";

/**
 * 詳細ページの図版。
 * 初期表示では《変容前》、ホバー／タップで《配置操作》が走る。
 */
export default function CaseHero({ c }: { c: Case }) {
  const [on, setOn] = useState(false);

  return (
    <div className="select-none">
      <button
        type="button"
        onMouseEnter={() => setOn(true)}
        onMouseLeave={() => setOn(false)}
        onFocus={() => setOn(true)}
        onBlur={() => setOn(false)}
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className="block w-full cursor-pointer"
      >
        <Plate c={c} active={on} className="block aspect-[1/1.38] w-full" />
      </button>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="label">
          <span className={on ? "" : "!text-ink"}>変容前</span>
          <span className="mx-1.5 opacity-50">／</span>
          <span className={on ? "!text-ink" : ""}>実行後</span>
        </p>
        <p className="label opacity-70">HOVER</p>
      </div>
      <p className="label mt-2 leading-[1.9] opacity-70">
        本図鑑が生成した配置図。実物の写真ではない。
      </p>
    </div>
  );
}
