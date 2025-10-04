import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove standalone output for development
  // output: 'standalone',
  // Ensure proper asset handling
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Enable trailing slash for consistent routing
  trailingSlash: false,
};

export default nextConfig;
