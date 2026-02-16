import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore
    reactCompiler: true,
  },
};

export default nextConfig;
