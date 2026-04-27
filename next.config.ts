import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Image optimization config
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  // Webpack: handle WASM for ZK prover circuits
  webpack: (config, { isServer }) => {
    // Required for @umbra-privacy/web-zk-prover WASM circuits
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Disable webpack cache for WASM chunks to avoid stale circuit files
    if (!isServer) {
      config.output = {
        ...config.output,
        webassemblyModuleFilename: "static/wasm/[modulehash].wasm",
      };
    }

    return config;
  },

  // Headers: security hardening
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
