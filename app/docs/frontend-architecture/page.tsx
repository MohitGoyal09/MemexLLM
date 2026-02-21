import { Badge } from "@/components/ui/badge"

export default function FrontendArchitecturePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Frontend</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Frontend Architecture</h1>
        <p className="text-xl text-muted-foreground">
          Overview of the Next.js frontend application structure.
        </p>
      </div>

      {/* Directory Structure */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Directory Structure</h2>
        <div className="p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
          <pre className="text-muted-foreground">{`frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── docs/              # Documentation pages
│   ├── home/              # Authenticated home
│   ├── notebook/[id]/     # Notebook pages
│   └── settings/          # Settings page
├── components/             # React components
│   ├── ui/               # shadcn/ui components
│   ├── docs/             # Docs-specific components
│   └── landing/           # Landing page components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── api/              # API client functions
│   └── analytics/         # Analytics integrations
└── public/               # Static assets`}</pre>
        </div>
      </section>

      {/* App Router */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Next.js App Router</h2>
        <p className="text-muted-foreground">
          The frontend uses Next.js 14 with the App Router for React Server Components,
          Server-Side Rendering, and Static Site Generation.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Server Components</h3>
            <p className="text-sm text-muted-foreground">
              Default for pages. Data fetched on server for better performance and SEO.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Client Components</h3>
            <p className="text-sm text-muted-foreground">
              Use 'use client' for interactive components with state and hooks.
            </p>
          </div>
        </div>
      </section>

      {/* State Management */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">State Management</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Server State</h3>
            <p className="text-sm text-muted-foreground">
              React Query (TanStack Query) for managing server state like notebooks,
              documents, and chat messages.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Client State</h3>
            <p className="text-sm text-muted-foreground">
              React useState/useReducer for UI state, localStorage for preferences.
            </p>
          </div>
        </div>
      </section>

      {/* Theming */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Theming</h2>
        <p className="text-muted-foreground">
          Dark/Light mode support using next-themes with CSS variables.
          The theme is configurable in Tailwind and persists across sessions.
        </p>
      </section>

      {/* Authentication */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Authentication</h2>
        <p className="text-muted-foreground">
          Supabase Auth integration with session management. Uses HTTP-only cookies
          for secure token storage with automatic refresh.
        </p>
      </section>

      {/* API Communication */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">API Communication</h2>
        <p className="text-muted-foreground">
          REST API calls through typed functions in lib/api/. Supports both
          regular and streaming requests for chat responses.
        </p>
      </section>

      <div className="flex gap-4 pt-4">
        <a href="/docs/components" className="text-primary hover:underline">
          Next: Components →
        </a>
      </div>
    </div>
  )
}
