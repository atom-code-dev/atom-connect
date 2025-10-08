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
  // Add security headers for LinkedIn OAuth
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.linkedin.com https://www.linkedin.com; frame-src 'self' https://www.linkedin.com; form-action 'self'; base-uri 'self'; frame-ancestors 'none';",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  // Add LinkedIn domains for image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/dms/**',
      },
      {
        protocol: 'https',
        hostname: 'www.linkedin.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
