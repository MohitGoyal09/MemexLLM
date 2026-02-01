# MemexLLM Frontend Documentation

Next.js 14 application with TypeScript, Tailwind CSS, and shadcn/ui for the MemexLLM AI research assistant.

## Overview

The frontend provides a modern, responsive interface for interacting with the MemexLLM backend. It supports document upload, AI-powered chat with citations, content generation, and notebook management.

## Documentation Index (A-Z)

### Getting Started
| Document | Description |
|----------|-------------|
| [API Client](API_CLIENT.md) | Backend API integration |
| [Architecture](ARCHITECTURE.md) | Frontend architecture and design patterns |
| [Components](COMPONENTS.md) | UI components documentation |
| [Configuration](CONFIGURATION.md) | Environment variables and setup |
| [Hooks](HOOKS.md) | Custom React hooks |
| [Types](TYPES.md) | TypeScript type definitions |

### Development
| Document | Description |
|----------|-------------|
| [Contributing](../CONTRIBUTING.md) | Contribution guidelines |

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Backend API running

### Installation

```bash
cd frontend
pnpm install
```

### Environment Setup

Create `.env.local`:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| State | React hooks + Context |
| Auth | Supabase Auth |
| API | REST + Server-Sent Events |
| Testing | Jest + React Testing Library |

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── home/              # Home/dashboard page
│   ├── notebook/          # Notebook pages
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── landing/          # Landing page sections
│   └── *.tsx             # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API
│   ├── api/             # API clients
│   ├── supabase/        # Supabase clients
│   ├── analytics/       # Analytics providers
│   ├── types.ts         # Type definitions
│   └── utils.ts         # Utilities
├── public/              # Static assets
└── __tests__/           # Test files
```

## Features

- **Authentication**: Supabase Auth with SSR support
- **Document Management**: Upload and manage research documents
- **AI Chat**: Contextual Q&A with source citations
- **Content Generation**: Podcasts, quizzes, flashcards, mindmaps
- **Real-time**: SSE streaming for chat responses
- **Responsive**: Mobile-first design
- **Dark Mode**: System-aware theming

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |

## License

MIT License
