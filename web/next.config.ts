import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/contrib-fyi' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
