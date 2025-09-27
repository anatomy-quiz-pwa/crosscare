import type { NextConfig } from "next";

// @ts-ignore
import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = withPWAConfig({
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 暫時忽略 TypeScript 錯誤
  },
});

export default nextConfig;
