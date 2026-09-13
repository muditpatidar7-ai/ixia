import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/frontend-1.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
