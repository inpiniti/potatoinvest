import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,

  webpack: (config, { isServer }) => {
    // Worker 지원 설정
    if (!isServer) {
      config.output.globalObject = "self";

      // Worker 파일 로더 설정
      config.module.rules.push({
        test: /\.worker\.js$/,
        loader: "worker-loader",
        options: {
          name: "static/chunks/[id].worker.js",
          publicPath: "/_next/",
        },
      });
    }

    return config;
  },
};

export default nextConfig;
