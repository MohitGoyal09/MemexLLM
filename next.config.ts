import type { NextConfig } from "next";

// Security headers configuration
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // HSTS - only in production to avoid issues with localhost
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ]
    : []),
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' and 'unsafe-eval' for script execution
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      // Allow connections to self, backend API (localhost in dev), and Supabase domains
      "connect-src 'self' http://localhost:8000 https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
      "font-src 'self' data:",
      "media-src 'self' blob: https://*.supabase.co https://*.supabase.in",  // Critical for audio playback
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

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

  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

