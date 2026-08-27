import BreakText from "./BreakText";

/**
 * 和文の本文を組む。
 *
 * ■ 折らない。行を最後まで埋めて、端を揃える
 *   以前ここで句読点や助詞を見て機械的に折っていたが、行末が
 *   7字・17字・12字…とばらつき（欄354pxに対して最大175pxの凸凹）、
 *   かえって読みにくくなった。ユーザー指摘で作り直した。
 *
 *   日本語の本文は、本でも新聞でもWebでも「行を埋めて端を揃える」のが本来。
 *   行のどこで文字が変わるかは組版側の仕事で、書き手が決めることではない。
 *   禁則（、。」を行頭に置かない）はブラウザが自前でやってくれる。
 *
 * ■ Chrome専用の機能を使わない
 *   `word-break: auto-phrase` は Chrome にしか無い。
 *   手元のChromeで直しても、iPhone の Safari では何も変わらない。
 *   端を揃える組みは `text-align: justify` で、どのブラウザでも同じに出る。
 *
 * ■ 手で折りたいときだけ記号を使う
 *   短い見出しや注記など、意図して2行に割りたい場所には
 *   ◆（携帯だけ）／◇（両方）を本文に埋める。BreakText が開く。
 *   長い本文には使わない。
 *
 * ■ 見出しだけは意味の切れ目で折る（byClause）
 *   短い見出しを自然折り返しに任せると「背景をぼかして透かす。板／が
 *   浮いている」「機械の速さを、左右対称／の階段と扇で」のように
 *   助詞が行頭に来る。大きな字だとこれが目立つ。
 *   句点と読点で切れば必ず意味の切れ目になるので、見出しにだけ使う。
 *
 *   **本文には使わない。** 本文でやると行末が7字・17字・12字…と
 *   ばらついて、直す前の読みにくい状態に戻る。
 */
export default function Jp({
  text,
  className,
  byClause = false,
}: {
  text: string;
  className?: string;
  /** 句点・読点で改行する。短い見出し専用 */
  byClause?: boolean;
}) {
  if (!byClause) {
    return (
      <p className={className}>
        <BreakText text={text} />
      </p>
    );
  }
  const lines = text.split(/(?<=[。、])/).filter(Boolean);
  return (
    <p className={className}>
      {lines.map((l, i) => (
        <span key={i} className="jp-s">
          <BreakText text={l} />
        </span>
      ))}
    </p>
  );
}
