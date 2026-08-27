import { Fragment } from "react";
import MobileBreak from "./MobileBreak";

/**
 * 地の文に埋め込んだ改行の記号を、実際の改行に開く。
 *
 *   ◆ … 携帯のときだけ改行する
 *   ◇ … 携帯でもパソコンでも改行する
 *
 * JSXの構造を意識せず、文章に記号を1つ打つだけで折り位置を決められる。
 * 文字列で持っている文（data配下）にもそのまま使えるのが要点。
 *
 * この2記号は、このサイトの地の文には元から出てこないことを確認して選んだ。
 */
export default function BreakText({ text }: { text: string }) {
  const parts = text.split(/([◆◇])/);
  return (
    <>
      {parts.map((s, i) => {
        if (s === "◆") return <MobileBreak key={i} />;
        if (s === "◇") return <br key={i} />;
        return <Fragment key={i}>{s}</Fragment>;
      })}
    </>
  );
}
