# MemexLLM Frontend

<div align="center">

**Modern React Frontend for AI-Powered Document Intelligence**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Next.js 14 application with TypeScript, Tailwind CSS, and shadcn/ui for the MemexLLM AI research assistant.

[Backend Repo](https://github.com/MohitGoyal09/MemexLLM-backend) • [Features](#features) • [Architecture](#%EF%B8%8F-architecture) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Deployment](#deployment)

</div>

---

## 🎯 Overview

The frontend provides a modern, responsive interface for interacting with the MemexLLM backend. It supports document upload, AI-powered chat with citations, content generation, and notebook management.

Built for production with server-side rendering, real-time streaming, and enterprise-grade authentication.

---

## 🏛️ Architecture

<p align="center">
  <img src="https://raw.githubusercontent.com/MohitGoyal09/MemexLLM/main/public/architecture.png" alt="MemexLLM Frontend Architecture" width="900">
</p>

The frontend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│         (Landing, Home, Notebook Pages)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│    (Chat Panel, Sources Panel, Studio Panel, etc.)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Hooks Layer                             │
│         (useNotes, useStudio, useChat, etc.)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Client Layer                         │
│    (notebooksApi, chatApi, documentsApi, etc.)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

- **Server Components**: Default Next.js 14 App Router pattern for optimal performance
- **Client Components**: Interactive UI components with React hooks
- **Custom Hooks**: Reusable stateful logic (useNotes, useStudio, useChat)
- **API Client Pattern**: Type-safe REST API integration with SSE streaming
- **Authentication**: JWT-based auth with Supabase Auth SSR support

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

---

## ✨ Features

- **Authentication**: Supabase Auth with SSR support
- **Document Management**: Upload and manage research documents (PDF, TXT, DOCX, audio, YouTube, web pages)
- **AI Chat**: Contextual Q&A with source citations and streaming responses
- **Content Generation**: Create podcasts, quizzes, flashcards, and mindmaps from documents
- **Notebook Organization**: Organize research into notebooks with chat history and notes
- **Real-time**: Server-Sent Events (SSE) for streaming chat responses
- **Responsive**: Mobile-first design with dark/light mode

---

## 🛠️ Tech Stack

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
| Analytics | PostHog + Sentry |

---

## 🚀 Quick Start

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

---

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages (login, signup, etc.)
│   ├── home/              # Home/dashboard page
│   ├── notebook/          # Notebook workspace pages
│   ├── settings/          # User settings page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── landing/          # Landing page sections
│   ├── chat-panel.tsx    # Main chat interface
│   ├── sources-panel.tsx # Document sources panel
│   ├── notes-panel.tsx   # Notes management
│   ├── studio-panel.tsx  # Content generation
│   └── ...
├── hooks/                # Custom React hooks
│   ├── use-notes.ts      # Notes CRUD + auto-save
│   ├── use-studio.ts     # Content generation
│   └── use-suggested-questions.ts
├── lib/                  # Utilities and API
│   ├── api/             # API clients
│   │   ├── client.ts    # Base HTTP client
│   │   ├── types.ts     # API types
│   │   ├── notebooks.ts
│   │   ├── chat.ts
│   │   ├── documents.ts
│   │   └── ...
│   ├── supabase/        # Supabase clients
│   ├── analytics/       # Analytics providers
│   ├── types.ts         # Shared types
│   └── utils.ts         # Utilities
├── public/              # Static assets
├── docs/                # Documentation
└── __tests__/           # Test files
```

---

## 📚 Documentation

See the [docs/](docs/) directory for detailed documentation:

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design, data flows, and architectural patterns |
| [API Client](docs/API_CLIENT.md) | Backend API integration |
| [Components](docs/COMPONENTS.md) | UI components documentation |
| [Configuration](docs/CONFIGURATION.md) | Environment variables and setup |
| [Hooks](docs/HOOKS.md) | Custom React hooks |
| [Types](docs/TYPES.md) | TypeScript type definitions |

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |

---

## 🔑 Key Components

### ChatPanel
Main chat interface with streaming support, citations, and suggested questions.

### SourcesPanel
Document management with upload, status tracking, and preview.

### NotesPanel
Rich text notes with auto-save using TipTap editor.

### StudioPanel
AI content generation interface for podcasts, quizzes, flashcards, and mindmaps.

---

## 🔌 API Integration

The frontend communicates with the backend via REST API and Server-Sent Events:

```typescript
import { chatApi } from "@/lib/api";

// Send message with streaming
await chatApi.sendMessageStream(
  notebookId,
  "What is this document about?",
  (token) => setMessage(prev => prev + token),
  (citations) => setCitations(citations),
  () => setIsStreaming(false)
);
```

---

## 🔐 Authentication

Uses Supabase Auth with cookie-based sessions:

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
```

---

## 🎨 Styling

Uses Tailwind CSS with custom brand colors:

```css
/* Primary brand color */
.bg-synapse-500    /* #ff8200 */

/* Surface colors for dark theme */
.bg-surface-0      /* #0a0a0a */
.bg-surface-1      /* #141414 */
```

---

## 🌍 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | No | Frontend app URL |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry error tracking |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog analytics |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript strict mode
3. Write tests for new features
4. Update documentation

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## 📜 License

MIT License
