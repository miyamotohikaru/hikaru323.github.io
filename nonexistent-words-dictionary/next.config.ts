import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  turbopack: {
    root: process.cwd(),
  },
  // 型チェック・Lintをビルドで有効化（以前は両方 ignore で握り潰していた）。
  // 型エラー/Lintエラーがあるとビルドが失敗するので、不具合の作り込みを防げる。
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "firebase-admin/app": "commonjs firebase-admin/app",
        "firebase-admin/firestore": "commonjs firebase-admin/firestore",
      });
    }
    return config;
  },
};

export default nextConfig;
