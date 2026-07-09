# こすくまくん危機一髪 (kosukuma-kikiippatsu) — 設計書

月に刺さった「こすくまくん」を、世界中のみんなで危機一髪。1000個の穴のうち1つだけが「あたり」。
あたりを刺した人はこすくまくんを宇宙へ飛ばし、名前が永久にトロフィーホールへ刻まれる。
飛んだら次の代のこすくまくんが降ってきて、永遠に続く (MSCHF "The Pressiah" 構造の連続版)。

## 世界観・アートディレクション

- **やわらかい玩具的な宇宙**。深い紺の宇宙 (#0a0e2a) に、淡いグレーの月、クリーム色のこすくまくん。
- 任天堂的な「さわって気持ちいい」を最優先: バネのあるアニメーション(squash & stretch)、
  押した瞬間に鳴る音、期待させる「間」、結果の誇張。
- UIは丸ゴシック(M PLUS Rounded 1c、CSS変数 `--font-game`)、角丸大きめ、太いラベル。
  ひらがな多めのやさしい文言(「〜だよ」「〜してね」)。
- パレットは `src/lib/config.ts` の `COLORS` / `globals.css` のCSS変数を使う。

## ゲームフロー(フェーズ機械は `src/game/store.ts` が正)

```
boot → title → idle ⇄ confirming → stabbing → suspense → safe → idle
                                              └→ launch → name-entry → trophy → new-round → idle
観客: idle → launch → new-round → idle (poll で roundNo が進んだとき)
```

- **idle**: ドラッグで月を回し、穴をタップ。cooldown中はトースト。
- **confirming**: カメラが穴に寄る。「ここに刺す？」
- **stabbing** (T_STAB=1100ms): 剣が現れ構え(0-55%)、突き刺す(55-100%)。
- **suspense** (T_SUSPENSE=1600ms): 月が小刻みに震え、こすくまくんがプルプル。鼓動音。
- **safe** (T_SAFE=2200ms): 土煙、こすくまくんが安堵のバウンス、「セーフ！」。剣は残る。
- **launch** (T_LAUNCH=6500ms): 白フラッシュ→スローで飛び出し→星の尾を引いて上昇→上空で花火。
- **name-entry**: 勝者のみ。名前入力モーダル(12文字)。
- **trophy** (T_TROPHY=4500ms): トロフィーが台座からせり上がり、名前が刻まれ、紙吹雪。
- **new-round** (T_NEW_ROUND=3500ms): 新しいこすくまくんがビームで降臨「第N代 こすくまくん」。

## モジュール境界(各担当は自分のファイルだけを書く)

| 担当 | ファイル | 内容 |
|---|---|---|
| 共有(済) | `src/lib/*`, `src/game/store.ts`, `src/game/events.ts`, `src/app/{layout,page,globals}` | 定数・型・状態機械・イベントバス |
| A: バックエンド | `src/server/*`, `src/app/api/**/route.ts` | Neon Postgres + メモリfallback |
| C: 3Dシーン | `src/game/scene/{GameCanvas,Moon,Holes,Swords,Kosukuma,Starfield,Earth,CameraRig}.tsx` | месяц・穴・剣・こすくま・カメラ |
| D: エフェクト | `src/game/scene/effects/*` | 刺し/発射/降臨の粒子・フラッシュ |
| E: UI | `src/ui/{TitleScreen,Hud,NameModal,Toast,HelpModal,CooldownPill,Feed}.tsx`, `src/ui/ui.css` | HUD・タイトル・モーダル |
| F: トロフィー | `src/lib/trophy.ts`, `src/game/trophy/*`, `src/app/trophies/page.tsx`, `src/ui/TrophyHall.tsx` | 手続き生成トロフィーとホール |
| G: 音 | `src/game/audio/{sfx,ambient}.ts`, `src/game/audio/AudioDirector.tsx` | WebAudio合成のSFX/環境音 |

## 主要な契約

- 状態の読み方: `useGameStore((s) => s.phase)` など。フェーズ開始時刻は `s.phaseAt` (Date.now)。
- 単発イベント(音・パーティクル起動)は `onGameEvent(cb)` を購読 (`src/game/events.ts`)。
- 穴の位置: `getHolePoints()` (`src/lib/holes.ts`)。index = holeId。月ローカル座標。
- 刺さり状態: `s.mask` (Uint8Array) を `getBit(mask, holeId)` で読む。
- 3D→store: ホバー `s.hoverHole(id|null)`、タップ `s.selectHole(id)`。
- UI→store: `s.start()`, `s.cancelSelect()`, `s.confirmStab()`, `s.submitName(name)`。
- サーバーAPI形: `src/lib/types.ts` が正。あたり穴 `winning_hole` は絶対にレスポンスに含めない。

## シーンレイアウト

- 月: 半径5、原点。こすくまくん(GLB `/models/kosukuma.glb`、高さ2units・Y-up・原点足元)は
  北極に下半身が埋まって刺さっている(scale≈1.7、腰まで埋め、8°ほど傾ける、ゆっくり呼吸)。
- 穴: 1000個 (`getHolePoints()`)、北極34°は除外済み。刺さった穴には剣(手続きローポリ)。
- 背景: 星空(Points)、遠くに小さな地球、たまに流れ星。
- カメラ: フェーズ駆動 (CameraRig)。title=ゆっくり周回 / idle=ユーザー操作 /
  confirming〜suspense=穴へズーム / launch=こすくまくんを追って上昇 / trophy以降=引き。

## パフォーマンス/コスト原則

- 音声・画像アセットは追加しない(全部コードで合成/生成)。外部API課金なし。
- 穴と剣は InstancedMesh。DPRは max 2。モバイル優先。
- `/api/state` はCDNキャッシュ(s-maxage=3)+関数内キャッシュでDB負荷を抑える。
