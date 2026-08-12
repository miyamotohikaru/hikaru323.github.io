import { FLIPS, type Flip } from "@/data/flips";
import { canOpen, isOpen, jpDate } from "./util";

/**
 * ふりっぷ一覧表。
 *
 * 罫は会社HPの表と同じ（本物 home.css の #home .cont02 table）。
 *   border: solid 2px yellowgreen / border-style: inset / background: #fff
 *   th はまんなか寄せ、td は左寄せ、border-collapse は指定しない
 * ここは同じ会社のページである印なので1つも変えない。
 *
 * 中身のほうは「リンク集」の作り。まだできていないものには当時の言い方で「工事中」を出す。
 * GIFの工事中マークが手元に無いので、黄色地に黒枠の札を字と罫だけで作る。
 *
 * 見出しの行を <thead> ではなく <tbody> の1行目に置いてあるのは、
 * flip と打つと表がまるごとひっくり返る仕掛け（Tricks.tsx）が
 * tBodies[0].rows を裏返すため。ここを thead にすると見出しが回らない。
 */
export default function FlipTable() {
  return (
    <table>
      <tbody>
        <tr>
          <th className="head t-no">No.</th>
          <th className="head t-ttl">ふりっぷの名前</th>
          <th className="head">どんなもの</th>
          <th className="head t-date">公開日</th>
          <th className="head t-own">担当</th>
          <th className="head t-state">ぐあい</th>
        </tr>
        {FLIPS.map((flip, i) => (
          <Row key={flip.slug} flip={flip} n={i + 1} />
        ))}
      </tbody>
    </table>
  );
}

function Row({ flip, n }: { flip: Flip; n: number }) {
  const open = isOpen(flip);
  const press = canOpen(flip);

  return (
    <tr>
      <td className="t-no">{String(n)}</td>
      <td className="t-ttl">
        {press ? (
          <a href={flip.url} target="_blank" rel="noopener noreferrer">
            {flip.title}
          </a>
        ) : (
          /* 行き先が空の3件。押せないので、字だけ置いて灰色にしておく */
          <span className="nolink">{flip.title}</span>
        )}
      </td>
      {/* 内容はシートの言葉のまま。空のものは昔の表と同じで「―」 */}
      <td>{flip.desc ? flip.desc : "―"}</td>
      <td className="t-date">{jpDate(flip.date)}</td>
      <td className="t-own">{flip.owner}</td>
      <td className="t-state">
        {open ? <span className="open">公開中</span> : <span className="kouji">工事中</span>}
      </td>
    </tr>
  );
}
