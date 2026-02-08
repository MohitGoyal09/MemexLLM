# Frontend Architecture

System design and architectural patterns for the MemexLLM frontend.

## Overview

The frontend is built with **Next.js 14** using the App Router pattern. It follows a component-based architecture with clear separation of concerns between UI, state management, and API integration.

## Architecture Diagram

![MemexLLM Frontend Architecture](/architecture.png)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Landing   │  │    Home     │  │      Notebook       │  │
│  │    Page     │  │    Page     │  │       Page          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Chat     │  │  Document   │  │    Studio Panel     │  │
│  │   Panel     │  │   Upload    │  │  (Generation)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Notes     │  │   Sources   │  │  Notebook Header    │  │
│  │   Panel     │  │   Panel     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Hooks Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  useNotes   │  │  useStudio  │  │ useSuggestedQuestions│  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Client Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ notebooksApi│  │   chatApi   │  │   documentsApi      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ generationApi│  │   notesApi  │  │    authApi          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                     │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

### App Router (`app/`)

Next.js 14 App Router structure with nested layouts:

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing page
├── globals.css             # Global styles
├── auth/                   # Auth routes group
│   ├── callback/          # OAuth callback
│   ├── confirm/           # Email confirmation
│   ├── login/             # Login page
│   ├── sign-up/           # Registration
│   └── update-password/   # Password reset
├── home/                   # Dashboard
│   └── page.tsx
├── notebook/               # Notebook workspace
│   ├── [id]/              # Dynamic notebook page
│   │   ├── page.tsx
│   │   └── notebook-content.tsx
│   └── new/               # Create notebook
└── settings/              # User settings
    └── page.tsx
```

### Components (`components/`)

Organized by feature and reusability:

```
components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── landing/               # Landing page sections
│   ├── landing-hero.tsx
│   ├── landing-features.tsx
│   └── ...
├── chat-panel.tsx         # Main chat interface
├── sources-panel.tsx      # Document sources
├── notes-panel.tsx        # Notes management
├── studio-panel.tsx       # Content generation
├── notebook-card.tsx      # Notebook list item
└── ...
```

### Hooks (`hooks/`)

Custom React hooks for stateful logic:

```
hooks/
├── use-notes.ts           # Notes CRUD + auto-save
├── use-studio.ts          # Content generation state
├── use-suggested-questions.ts  # AI suggestions
└── use-scroll-reveal.tsx  # Animation hook
```

### Library (`lib/`)

Utilities and configurations:

```
lib/
├── api/                   # API clients
│   ├── client.ts         # Base HTTP client
│   ├── types.ts          # API types
│   ├── notebooks.ts      # Notebook API
│   ├── chat.ts           # Chat API
│   ├── documents.ts      # Document API
│   ├── generation.ts     # Generation API
│   ├── notes.ts          # Notes API
│   ├── auth.ts           # Auth API
│   ├── feedback.ts       # Feedback API
│   └── rate-limit.ts     # Rate limiting
├── supabase/             # Supabase clients
│   ├── client.ts         # Browser client
│   └── server.ts         # Server client
├── analytics/            # Analytics providers
│   ├── PostHogProvider.tsx
│   └── PostHogPageView.tsx
├── types.ts              # Shared types
└── utils.ts              # Utilities
```

## Design Patterns

### 1. Server Components (Default)

Most pages use Server Components for better performance:

```typescript
// app/notebook/[id]/page.tsx
export default async function NotebookPage({ params }: { params: { id: string } }) {
  // Server-side data fetching
  return <NotebookContent notebookId={params.id} />;
}
```

### 2. Client Components (When Needed)

Interactive components use `"use client"`:

```typescript
"use client";

import { useState } from "react";

export function ChatPanel() {
  const [messages, setMessages] = useState([]);
  // Client-side interactivity
}
```

### 3. Custom Hooks

Encapsulate reusable stateful logic:

```typescript
// hooks/use-notes.ts
export function useNotes({ notebookId }: UseNotesOptions) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch, create, update, delete logic
  
  return { notes, loading, createNote, updateNote, deleteNote };
}
```

### 4. API Client Pattern

Centralized API clients with type safety:

```typescript
// lib/api/notebooks.ts
export const notebooksApi = {
  list: () => apiClient<Notebook[]>("/notebooks"),
  get: (id: string) => apiClient<Notebook>(`/notebooks/${id}`),
  create: (data: CreateNotebookRequest) => 
    apiClient<Notebook>("/notebooks", { method: "POST", body: JSON.stringify(data) }),
  // ...
};
```

### 5. Streaming Pattern

Server-Sent Events for real-time chat:

```typescript
// lib/api/chat.ts
sendMessageStream: async (
  notebookId: string,
  message: string,
  onToken: (token: string) => void,
  onCitations?: (citations: Citation[]) => void,
  // ...
) => {
  const response = await fetch(`/api/v1/chat/${notebookId}/message`, {
    method: "POST",
    body: JSON.stringify({ message, stream: true }),
  });
  
  const reader = response.body?.getReader();
  // Read and process SSE stream
};
```

## State Management

### Local State (useState)

For component-specific state:

```typescript
const [isOpen, setIsOpen] = useState(false);
const [query, setQuery] = useState("");
```

### Server State (API + Hooks)

For data from the backend:

```typescript
const { notes, loading, createNote } = useNotes({ notebookId });
const { messages, sendMessage } = useChat({ notebookId });
```

### URL State (useSearchParams)

For shareable UI state:

```typescript
const searchParams = useSearchParams();
const activeTab = searchParams.get("tab") || "chat";
```

## Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   Supabase   │────▶│   Backend    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │ 1. Login/Signup    │                    │
       │───────────────────▶│                    │
       │                    │ 2. JWT Token       │
       │◀───────────────────│                    │
       │                    │                    │
       │ 3. API Request     │                    │
       │ with Authorization │                    │
       │─────────────────────────────────────────▶│
       │                    │                    │ 4. Validate
       │                    │                    │    JWT
       │ 5. Response        │                    │
       │◀─────────────────────────────────────────│
```

## Data Flow

### Document Upload Flow

```
User selects file
       │
       ▼
┌──────────────┐
│ documentsApi │
│   .upload()  │
└──────────────┘
       │
       ▼
┌──────────────┐
│   Backend    │
│   Uploads    │
│   to Storage │
└──────────────┘
       │
       ▼
┌──────────────┐
│   Document   │
│   Processing │
│   (Async)    │
└──────────────┘
       │
       ▼
┌──────────────┐
│   Frontend   │
│   Polls for  │
│   Status     │
└──────────────┘
```

### Chat Flow

```
User sends message
       │
       ▼
┌──────────────┐
│   chatApi    │
│.sendMessage() │
└──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│   Backend    │────▶│  RAG Query   │
│   Receives   │     │   Engine     │
│   Message    │     │              │
└──────────────┘     └──────────────┘
       │                    │
       │  SSE Stream        │
       │◀───────────────────│
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│   Frontend   │     │   LLM        │
│   Displays   │◀────│   Response   │
│   Tokens     │     │              │
└──────────────┘     └──────────────┘
```

## Component Hierarchy

### Notebook Page

```
NotebookPage (Server)
└── NotebookContent (Client)
    ├── NotebookHeader
    │   ├── LuminaLogo
    │   └── NotebookSettingsModal
    ├── ResizablePanel
    │   ├── SourcesPanel
    │   │   └── AddSourcesModal
    │   ├── ChatPanel
    │   │   ├── MessageList
    │   │   ├── CitationPreview
    │   │   └── ChatInput
    │   ├── NotesPanel
    │   │   └── NoteEditor
    │   └── StudioPanel
    │       ├── AudioPlayerView
    │       ├── QuizView
    │       ├── FlashcardView
    │       └── MindMapView
    └── StatusBar
```

## Performance Optimizations

1. **Server Components**: Reduce client-side JavaScript
2. **Streaming**: Progressive rendering for chat
3. **Image Optimization**: Next.js Image component
4. **Code Splitting**: Automatic route-based splitting
5. **Caching**: SWR/React Query for server state
6. **Lazy Loading**: Dynamic imports for heavy components

## Security Considerations

1. **JWT Tokens**: Stored in memory, not localStorage
2. **CORS**: Configured for specific origins
3. **Rate Limiting**: Respects backend rate limits
4. **Input Validation**: Zod schemas for forms
5. **XSS Protection**: React's built-in escaping

## Error Handling

```typescript
// API client error handling
try {
  const data = await notebooksApi.get(id);
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Redirect to login
        router.push("/auth/login");
        break;
      case 429:
        // Show rate limit message
        toast.error("Too many requests. Please wait.");
        break;
      default:
        toast.error(error.detail);
    }
  }
}
```
