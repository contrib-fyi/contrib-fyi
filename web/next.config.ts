import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const outputMode =
  process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : undefined;

const nextConfig: NextConfig = {
  ...(outputMode ? { output: outputMode } : {}),
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  images: {
    unoptimized: outputMode === 'export',
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath ?? '',
  },
};

export default nextConfig;
