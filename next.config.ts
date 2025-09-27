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
});

export default nextConfig;
