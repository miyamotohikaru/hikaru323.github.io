/** UIラベル・分類名の英訳辞書（本文はJAのみ）。サーバー/クライアント両方から参照可 */
export const dict = {
  status: {
    extinct: "Extinct",
    transformed: "Transformed",
    ongoing: "Ongoing",
  } as Record<string, string>,
  category: {
    前近代の世界: "Premodern world",
    江戸の日本: "Edo Japan",
    産業革命の世界: "Industrial Revolution",
    "明治〜昭和の日本": "Meiji–Showa Japan",
    "20世紀の世界": "20th-century world",
    平成の日本: "Heisei Japan",
    消滅進行中: "Vanishing now",
  } as Record<string, string>,
  region: {
    日本: "Japan",
    英: "UK",
    欧: "Europe",
    米: "US",
    世界: "World",
    中東: "Middle East",
    北欧: "Nordic",
    中南米: "Latin America",
  } as Record<string, string>,
  cause: {
    1: "Electrification",
    2: "Communication & digital",
    3: "AI & algorithms",
    4: "Lifestyle & infrastructure",
    5: "Law & institutions",
    6: "Medicine & science",
    7: "Media & entertainment",
  } as Record<number, string>,
};
