import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orderly/types"],
};

export default nextConfig;
