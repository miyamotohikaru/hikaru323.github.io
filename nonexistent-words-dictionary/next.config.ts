import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
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
