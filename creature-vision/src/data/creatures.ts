export interface Creature {
  id: string;
  name: string;
  en: string;
  cat: string;
  color: string;
  filterType: string;
  fp: Record<string, unknown>;
  desc: string;
  detail: string;
  bio: string;
}

export const CREATURES: Creature[] = [
  { id:"kosukuma", name:"こすくまくん", en:"Kosukuma", cat:"special", color:"#F0EDD0", filterType:"kosukuma", fp:{}, desc:"", detail:"", bio:"こすくまくんはクマだから、色は2色しか見えないんです。赤は見えない。でも世界がほんのり金平糖みたいな色をしてるのは、こすくまくんの気分のせいかもしれない。時間がゆっくり流れてて、激しいものはぜんぶやわらかくなる。「まあいっか」って思える世界。嗅覚は人間の何千倍もあるから、実は世界の7割を鼻で見てるんだよ。" },
  { id:"human", name:"人間", en:"Human", cat:"special", color:"#FFCC88", filterType:"human", fp:{}, desc:"", detail:"", bio:"人間の目は赤・緑・青の3種類の細胞で約1,000万色を見分けられるんです。すごそうでしょ？でも実は、光の全体（電磁スペクトル）のたった0.0035%しか見えてないんだよ。紫外線も赤外線も電波も見えない。この世界は「ほんのちょっとだけ見えてる世界」なんです。" },
  { id:"dog", name:"犬", en:"Dog", cat:"land", color:"#D4935A", filterType:"dichro", fp:{channels:[[255,204,0],[0,77,255]]}, desc:"", detail:"", bio:"犬の目には色を見分ける細胞が2種類しかなくて、「黄色」と「青」の世界なんです。赤いボールを芝生に投げると、犬にはどっちも同じ黄土色に見えてるんだよ。でも暗いところでは人間の5倍見えるし、鼻は人間の1億倍。色がなくても全然平気。" },
  { id:"cat", name:"猫", en:"Cat", cat:"land", color:"#808080", filterType:"nightvision", fp:{tint:[77,230,102],brightness:1.8}, desc:"", detail:"", bio:"猫の目の奥には「タペタム」っていう鏡みたいな層があるんです。これで光を2回使えるから、暗いところでも人間の6倍見える。瞳孔が縦に細くなるスリット型で、明るさの調節幅は人間の135倍。昼と夜、両方の世界を持ってるんだね。" },
  { id:"horse", name:"馬", en:"Horse", cat:"land", color:"#A0764A", filterType:"panorama", fp:{}, desc:"", detail:"", bio:"馬の目は顔の横についてるから、なんと視野が約350度もあるんです。見えないのは鼻の真正面と真後ろだけ。ライオンに狙われてもすぐ気づける設計なんだね。でも色は2色しか見えなくて、世界は黄色と青で出来てるんだよ。" },
  { id:"goat", name:"ヤギ", en:"Goat", cat:"land", color:"#B8925E", filterType:"horizoneye", fp:{}, desc:"", detail:"", bio:"ヤギの瞳孔は丸じゃなくて、横に長い長方形なんです。これで水平方向はものすごく広く見えるけど、上下は狭い。草原で天敵がどこから来ても気づけるように、地平線全体を一度に見られる設計なんだよ。しかも頭を下げて草を食べてる時も、瞳孔が回転して常に水平を保つんです。" },
  { id:"panda", name:"パンダ", en:"Panda", cat:"land", color:"#FFFFFF", filterType:"dichro", fp:{channels:[[179,153,38],[38,102,217]]}, desc:"", detail:"", bio:"パンダも2色覚で赤が見えないんです。じゃあ目の周りの黒い模様は何のため？実はあれ、竹林の木漏れ日の中でカモフラージュするためなんだよ。人間にはド派手に見えるパンダも、2色覚の天敵の目には竹林に溶け込んで見えるんです。" },
  { id:"chameleon", name:"カメレオン", en:"Chameleon", cat:"reptile", color:"#5CBF50", filterType:"dualeye", fp:{}, desc:"", detail:"", bio:"カメレオンの左右の目はバラバラに動くんです。右目で前を見ながら左目で後ろを見る、なんてことができる。獲物を見つけた瞬間、両目をガッとそろえて「望遠鏡モード」に切り替え。距離を測って、舌をビュッ！この切り替えがカッコいいんだよ。" },
  { id:"frog", name:"カエル", en:"Frog", cat:"reptile", color:"#5CBF50", filterType:"motion", fp:{movR:0.5,movG:1.5,movB:0.3,bgDim:0.25,bgR:0.3,bgG:0.5,bgB:0.3}, desc:"", detail:"", bio:"カエルの目には「バグディテクター」という特別な神経があるんです。動いてるものだけに反応して、止まったものは見えなくなる。だから虫が止まった瞬間、カエルの世界からその虫は「消える」。動いたものだけが「存在する」世界なんだね。" },
  { id:"eagle", name:"ワシ", en:"Eagle", cat:"sky", color:"#8B6914", filterType:"sharp", fp:{saturation:1.8,sharpness:2.0,foveaZoom:1.4}, desc:"", detail:"", bio:"ワシの目には「中心窩」っていう超高解像度エリアが2つもあるんです。人間の4〜8倍の視力で、2km先のウサギも見つけられる。空の上から地上を見る時、まるで望遠鏡がついてるみたいに中央だけグーッとズームできるんだよ。" },
  { id:"kestrel", name:"チョウゲンボウ", en:"Kestrel", cat:"sky", color:"#C87830", filterType:"uvtrail", fp:{}, desc:"", detail:"", bio:"チョウゲンボウは空から獲物を探す鳥なんだけど、すごいのは「ネズミのおしっこの跡」が紫外線で光って見えること。ネズミが走った道が地面に黄色い光の線として浮かび上がるんです。だからネズミがいなくても「ここを通ったな」ってわかる。地面に見えない地図があるんだよ。" },
  { id:"owl", name:"フクロウ", en:"Owl", cat:"sky", color:"#B08050", filterType:"nightvision", fp:{tint:[25,255,38],brightness:2.5}, desc:"", detail:"", bio:"フクロウの目は暗いところで人間の100倍も見えるんです。月のあかりの10分の1でもネズミを見つけられる。目が大きすぎて眼球を動かせないから、首を270度ぐるっと回して補ってるんだよ。" },
  { id:"bat", name:"コウモリ", en:"Bat", cat:"sky", color:"#4A4A5A", filterType:"sonar", fp:{tint:[153,77,230],bg:[5,3,13],ringColor:[140,80,220],ringGap:60}, desc:"", detail:"", bio:"コウモリは「エコーロケーション」で世界を見てるんです。超音波を出して、跳ね返ってきた音で周りの形がわかる。飛んでる蛾の羽ばたきまで聞き分けられるくらい正確。音が「目」になるって、すごくない？" },
  { id:"dragonfly", name:"トンボ", en:"Dragonfly", cat:"insect", color:"#6BC060", filterType:"compound", fp:{hexSize:5,uvShift:0.5,gridOpacity:0.3}, desc:"", detail:"", bio:"トンボの目は約3万個の小さな目（個眼）が集まった「複眼」なんです。視野はほぼ360度で、しかも1秒間に200コマも見える（人間は18コマ）。だから飛んでる虫をキャッチする成功率は95%以上。時間がスローモーションに見えてるんだね。" },
  { id:"bee", name:"ミツバチ", en:"Honeybee", cat:"insect", color:"#FFD030", filterType:"compound", fp:{hexSize:8,uvShift:0.8,gridOpacity:0.3}, desc:"", detail:"", bio:"ミツバチには赤色が見えないんです。でもその代わり「紫外線（UV）」が見える。人間には白く見える花に、ミツバチにはUVの模様が浮かび上がってるんです。まるで空港の滑走路みたいに「蜜はこっちだよ！」って光ってるの。" },
  { id:"cockroach", name:"ゴキブリ", en:"Cockroach", cat:"insect", color:"#8B5A2B", filterType:"compound", fp:{hexSize:6,uvShift:0.3,gridOpacity:0.3}, desc:"", detail:"", bio:"ゴキブリの複眼は時間を人間の6倍のスローモーションで見てるんです。人間が新聞紙を振り下ろしても、ゴキブリにはゆーっくり迫ってくるように見える。さらに視野はほぼ360度。だからあんなに素早く逃げられるんだよ。" },
  { id:"fly", name:"ハエ", en:"Fly", cat:"insect", color:"#556B2F", filterType:"compound", fp:{hexSize:7,uvShift:0.3,gridOpacity:0.3}, desc:"", detail:"", bio:"ハエの目は時間を人間の4倍遅く見てるんです。人間がパチンと手を叩いても、ハエにとってはスローモーション。約4,000個の個眼でできた複眼で、動くものを超素早くキャッチ。だから叩こうとしても逃げられちゃうんだよ。" },
  { id:"spider", name:"クモ", en:"Spider", cat:"insect", color:"#5A4A6A", filterType:"multieye", fp:{}, desc:"", detail:"", bio:"クモには目が8つもあるんです。でも全部同じ役割じゃない。前の2つ（主眼）は高解像度カメラみたいに獲物をハッキリ見る用。残りの6つは「動きセンサー」で、横や後ろの動きを見張ってるんです。チームプレーで世界を見てるんだね。" },
  { id:"jumpingspider", name:"ハエトリグモ", en:"Jumping Spider", cat:"insect", color:"#4A8A50", filterType:"multilayer", fp:{}, desc:"", detail:"", bio:"ハエトリグモの主眼には網膜が4層も重なってるんです。それぞれの層のピントが違うから、「どの層がボケてるか」で獲物までの距離がわかる。カメラのオートフォーカスと同じ原理を、5億年前から使ってるんだよ。しかも体長1cmなのに人間並みの解像度を持ってるんです。" },
  { id:"snail", name:"カタツムリ", en:"Snail", cat:"land", color:"#C8A070", filterType:"lowres", fp:{pixels:12,levels:3,tint:[230,179,128],vignette:true}, desc:"", detail:"", bio:"カタツムリの目は触角の先っぽについてるけど、ぼんやりとした光と影しか見えないんです。形はほとんどわからない。でも面白いのは「時間の感じ方」。人間よりずっとゆっくり世界を見てるから、速い動きは「止まってる」ように見えるんだよ。これを「知覚モーメント」って呼ぶんです。" },
  { id:"dolphin", name:"イルカ", en:"Dolphin", cat:"ocean", color:"#5CC8D9", filterType:"mono", fp:{tint:[38,166,217],boost:1.2}, desc:"", detail:"", bio:"イルカの目には色を見分ける細胞が1種類しかないんです。だから世界は青緑の1色だけ。でも水の中では人間の10倍もよく見える。さらに「エコーロケーション」という超音波で、目を使わずに周りの形がわかるんです。音で「見てる」んだね。" },
  { id:"shark", name:"サメ", en:"Shark", cat:"ocean", color:"#7A8B99", filterType:"electro", fp:{rMul:0.3,gMul:0.5,bMul:1.2,fieldColor:[74,144,217]}, desc:"", detail:"", bio:"サメの顔には「ロレンチーニ器官」という特別なセンサーがあるんです。これで生き物の筋肉が出す、ものすごーく弱い電気を感じ取れる。砂の中に隠れた魚も「電気の気配」でバレバレ。人間には絶対見えない世界だね。" },
  { id:"octopus", name:"タコ", en:"Octopus", cat:"ocean", color:"#E07070", filterType:"polarized", fp:{rShift:0.3,bShift:0.5}, desc:"", detail:"", bio:"タコは色が1色しか見えないのに、体の色を自由に変えられる不思議な生き物。実は「偏光」っていう光の振動の向きが見えるんです。透明なエビも偏光の違いで丸見え。さらに皮膚にも光を感じるセンサーがあって、体全体が「目」みたいなもの。" },
  { id:"foureyedfish", name:"ヨツメウオ", en:"Four-eyed Fish", cat:"ocean", color:"#6A9B70", filterType:"spliteye", fp:{}, desc:"", detail:"", bio:"ヨツメウオの目は水面で上下に分かれてるんです。上半分で空を飛ぶ鳥を見張りながら、下半分で水中のエサを探す。しかもレンズの上と下で光の曲がり方が違うんだよ。空気と水、2つの世界を同時に見る目ってすごくない？" },
  { id:"deepsea", name:"深海魚", en:"Deep-sea Fish", cat:"ocean", color:"#1A2A4A", filterType:"biolum", fp:{glowR:77,glowG:153,glowB:255}, desc:"", detail:"", bio:"太陽の光が届かない深海では、自分で光るしかないんです。深海魚の目は「光の粒1つ」でも感じ取れるくらい超高感度。真っ暗な世界で、生き物たちの光だけがポツポツ浮かぶ。まるで宇宙にいるみたい。" },
  { id:"platypus", name:"カモノハシ", en:"Platypus", cat:"special", color:"#6B4226", filterType:"electro", fp:{rMul:0.2,gMul:0.7,bMul:0.9,fieldColor:[0,210,211]}, desc:"", detail:"", bio:"カモノハシは水に潜ると目も耳も鼻も全部閉じちゃうんです。じゃあどうやって獲物を見つけるの？答えはくちばし。4万個の電気センサーがついていて、エビの筋肉が出す電気を感じ取る。哺乳類でこれができるのはカモノハシだけ。" },
  { id:"snake", name:"ヘビ", en:"Snake", cat:"reptile", color:"#5CBF50", filterType:"thermal", fp:{}, desc:"", detail:"", bio:"ヘビの顔にある「ピット器官」という穴で、赤外線を感じ取れるんです。暗闇でも獲物の体温が赤や黄色の色として「見える」。0.003度の温度差もわかるんだよ。しかも普通の目で見る映像と赤外線の映像を、脳の中で合体させてるんです。" },
  { id:"mshrimp", name:"シャコ", en:"Mantis Shrimp", cat:"ocean", color:"#FF5588", filterType:"tetra", fp:{saturation:2.2,uvTint:[102,51,204],uvStrength:0.8,sharp:1.5}, desc:"", detail:"", bio:"シャコの目には色を感じる細胞が16種類もあるんです（人間は3つだけ）。紫外線も見えるし、「円偏光」っていう特殊な光も見える。でも研究でわかったのは、色を「比べる」んじゃなくて「パッと判別する」方式なんだって。豊かさより確実さを選んだ目なんだね。" },
  { id:"starfish", name:"ヒトデ", en:"Starfish", cat:"ocean", color:"#F5C518", filterType:"lowres", fp:{pixels:14,levels:4,tint:[255,153,77],vignette:true}, desc:"", detail:"", bio:"ヒトデの5本の腕の先っぽに、1つずつ小さな目（眼点）があるんです。見えるのは約200ピクセルのぼんやりした光と影だけ。でもこれだけでサンゴ礁の大きな形を見分けて、ちゃんと家に帰れるんだよ。「確実さ」があれば「豊かさ」はいらないんだね。" },
  { id:"mole", name:"モグラ", en:"Mole", cat:"land", color:"#5A3018", filterType:"lowres", fp:{pixels:6,levels:2,tint:[128,77,51],vignette:true,pixelate:true}, desc:"", detail:"", bio:"モグラの目は皮膚に埋もれた超ちっちゃい目で、光があるかないかしかわからないんです。でもその代わり鼻に「アイマー器官」っていう超高感度の触覚センサーがあって、左右の鼻で匂いの方向までわかる「ステレオ嗅覚」を持ってるんだよ。" },
  { id:"blindcavefish", name:"洞窟魚", en:"Blind Cavefish", cat:"special", color:"#8A8A8A", filterType:"lowres", fp:{pixels:3,levels:1,tint:[77,77,77],vignette:true,pixelate:true}, desc:"", detail:"", bio:"洞窟魚は何万年も暗い洞窟で暮らすうちに、目が完全になくなっちゃったんです。でも代わりに体の横に「側線」っていう水の振動を感じるセンサーが発達して、全身が「目」みたいになった。味を感じる細胞も全身にあるんだよ。見ることを「やめた」進化なんです。" },
];
