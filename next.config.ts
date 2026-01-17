import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack (use stable Webpack instead due to Turbopack crashes)
  // experimental: {
  //   turbo: {},
  // },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false, // Enable image optimization
  },
  
  // Enable component caching
  cacheComponents: true,
};

export default nextConfig;

