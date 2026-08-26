import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 図版の撮影に開発用の丸バッジが写り込むため落としている
  devIndicators: false,
};

export default nextConfig;
