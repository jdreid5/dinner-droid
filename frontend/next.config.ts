import type { NextConfig } from "next";

const API_BACKEND = process.env.API_BASE_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
