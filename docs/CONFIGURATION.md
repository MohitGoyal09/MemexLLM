# Configuration Documentation

Environment variables and configuration options for the MemexLLM frontend.

## Overview

Configuration is managed through environment variables. Next.js automatically loads `.env.local` in development and production.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | `eyJhbG...` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | - |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key | - |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics ID | - |

## Configuration Files

### Next.js Config

**File:** `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration options
};

export default nextConfig;
```

### Tailwind Config

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        synapse: {
          50: "#fff8f0",
          100: "#ffeed6",
          200: "#ffdaa8",
          300: "#ffc06a",
          400: "#ff9c2a",
          500: "#ff8200",
          600: "#f06300",
          700: "#c74a00",
          800: "#9e3a08",
          900: "#7f320d",
          950: "#451705",
        },
        // Surface colors for dark theme
        surface: {
          0: "#0a0a0a",
          1: "#141414",
          2: "#1f1f1f",
          3: "#2a2a2a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Consolas", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### TypeScript Config

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Jest Config

**File:** `jest.config.ts`

```typescript
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
```

### ESLint Config

**File:** `eslint.config.mjs`

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

## Environment Setup

### Development

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

### Production

Set environment variables in your hosting platform:

**Vercel:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_API_URL
```

**Environment-specific values:**

| Environment | NEXT_PUBLIC_API_URL |
|-------------|---------------------|
| Development | `http://localhost:8000` |
| Staging | `https://api-staging.memexllm.app` |
| Production | `https://api.memexllm.app` |

## Feature Flags

Feature flags can be implemented via environment variables:

```env
NEXT_PUBLIC_ENABLE_FEEDBACK=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_STREAMING=true
```

Usage in code:

```typescript
const enableFeedback = process.env.NEXT_PUBLIC_ENABLE_FEEDBACK === "true";

{enableFeedback && <FeedbackButton />}
```

## Security Considerations

1. **Public Variables Only**: Only use `NEXT_PUBLIC_` prefix for variables needed in browser
2. **Server Variables**: Without prefix = server-only (API routes, Server Components)
3. **Secrets**: Never commit secrets to version control
4. **Validation**: Validate env vars at startup

```typescript
// lib/config.ts
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_API_URL",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
```

## Build Configuration

### Output Options

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: "standalone", // For Docker deployment
  // or
  output: "export",     // For static export
};
```

### Image Optimization

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    domains: ["supabase.co", "localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};
```

### Rewrites/Redirects

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};
```

## Debugging Configuration

### Source Maps

Enabled by default in development. For production:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
};
```

### React Strict Mode

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
};
```

## Performance Configuration

### Bundle Analysis

```bash
# Install
npm install -D @next/bundle-analyzer

# Run
ANALYZE=true npm run build
```

### Compression

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  compress: true,
};
```

## Troubleshooting

### Environment Variables Not Loading

1. Check variable names start with `NEXT_PUBLIC_` for client access
2. Restart dev server after changing `.env.local`
3. Clear `.next` cache: `rm -rf .next`

### TypeScript Path Aliases

Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### CORS Issues

Configure backend CORS to allow frontend origin:

```env
# Backend .env
CORS_ORIGINS=http://localhost:3000,https://your-frontend.com
```
