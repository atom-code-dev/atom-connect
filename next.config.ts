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
  // Allow cross-origin requests from Z.ai preview
  allowedDevOrigins: [
    'preview-chat-ee94d2ac-0501-41f0-b15e-6f29f8d45aa0.space.z.ai',
    'localhost:3000'
  ],
};

export default nextConfig;
