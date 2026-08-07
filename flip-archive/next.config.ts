import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 開発中のオーバーレイは図版の見え方の確認を邪魔するので消す
  devIndicators: false,
};

export default nextConfig;
