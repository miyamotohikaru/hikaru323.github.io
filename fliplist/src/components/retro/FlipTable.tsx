import { FLIPS, type Flip } from "@/data/flips";
import { canOpen, isOpen, jpDate, NEW_SLUGS } from "./util";

/**
 * ふりっぷの一覧。
 * 本物のHPの会社概要の表と同じ組み（home.css の #home .cont02 table）。
 *   border: solid 2px yellowgreen / border-style: inset / background: #fff
 *   th はまんなか寄せ、td は左寄せ
 * border-collapse を指定しないので、セルが1つずつ立体の枠を持つ。
 * 行の頭には昔のリンク集と同じ arrow_list.gif を置く。
 */
export default function FlipTable() {
  return (
    <table>
      <tbody>
        <tr>
          <th className="head t-no">No.</th>
          <th className="head t-ttl">ふりっぷの名前</th>
          <th className="head">内容</th>
          <th className="head t-date">公開日</th>
          <th className="head t-own">担当</th>
          <th className="head t-state">状態</th>
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
  const isNew = NEW_SLUGS.includes(flip.slug);

  return (
    <tr>
      <td className="t-no">{String(n)}</td>
      <td className="t-ttl">
        {press ? (
          <a href={flip.url} target="_blank" rel="noopener noreferrer">
            {flip.title}
            {isNew ? (
              <span className="new">
                <img src="/hp/new.gif" alt="new" width={29} height={17} />
              </span>
            ) : null}
          </a>
        ) : (
          <span className="soon">{flip.title}</span>
        )}
      </td>
      {/* 内容はシートの言葉のまま。空のものは昔の表と同じで「―」 */}
      <td>{flip.desc ? flip.desc : "―"}</td>
      <td className="t-date">{jpDate(flip.date)}</td>
      <td className="t-own">{flip.owner}</td>
      <td className={`t-state ${open ? "state-open" : "state-soon"}`}>
        {open ? "公開中" : "準備中"}
      </td>
    </tr>
  );
}
