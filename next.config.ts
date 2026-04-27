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

  transpilePackages: [
    "@solana/wallet-adapter-base",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-phantom",
    "@solana/wallet-adapter-solflare",
  ],

  // Webpack: handle WASM for ZK prover circuits and enforce single wallet-adapter instance
  webpack: (config, { isServer }) => {
    // Force single instances of wallet adapter to fix Context duplication in Next.js 15
    config.resolve.alias = {
      ...config.resolve.alias,
      "@solana/wallet-adapter-react": require.resolve("@solana/wallet-adapter-react"),
    };

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
