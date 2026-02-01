# API Client Documentation

Complete reference for backend API integration in the MemexLLM frontend.

## Overview

The API client layer provides type-safe HTTP communication with the backend. It handles authentication, rate limiting, error handling, and streaming responses.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   client    │  │    auth     │  │   rate-limit    │  │
│  │   (base)    │  │   (token)   │  │   (handling)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Domain APIs                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ notebooks│ │  chat    │ │documents │ │generation│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  notes   │ │  tasks   │ │ feedback │ │   auth   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Base Client

**File:** `lib/api/client.ts`

### Configuration

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3;
```

### Error Classes

```typescript
// Generic API error
class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public rateLimitStatus?: RateLimitStatus
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

// Rate limit specific error
class RateLimitError extends ApiError {
  constructor(
    public retryAfterSeconds: number | null,
    public rateLimitStatus: RateLimitStatus,
    detail: string = "Too many requests. Please try again later."
  ) {
    super(429, detail, rateLimitStatus);
    this.name = "RateLimitError";
  }
}
```

### Core API Client

```typescript
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T>
```

**Features:**
- Automatic JWT token injection
- JSON parsing
- Error handling
- Rate limit tracking
- Request timeout
- Retry logic

### Usage

```typescript
import { apiClient, ApiError } from "@/lib/api/client";

try {
  const data = await apiClient<Notebook[]>('/notebooks');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.detail}`);
  }
}
```

### File Upload

```typescript
async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T>
```

**Usage:**

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("notebook_id", notebookId);

const result = await apiUpload<UploadDocumentResponse>(
  "/documents/upload",
  formData
);
```

### Streaming (SSE)

```typescript
async function getStreamingHeaders(): Promise<HeadersInit>
function getApiBaseUrl(): string
```

**Usage:**

```typescript
const headers = await getStreamingHeaders();
const response = await fetch(`${getApiBaseUrl()}/api/v1/chat/${notebookId}/message`, {
  method: "POST",
  headers,
  body: JSON.stringify({ message, stream: true }),
});

const reader = response.body?.getReader();
// Process SSE stream
```

---

## Notebooks API

**File:** `lib/api/notebooks.ts`

```typescript
export const notebooksApi = {
  list: () => apiClient<Notebook[]>("/notebooks"),
  
  get: (id: string) => apiClient<Notebook>(`/notebooks/${id}`),
  
  create: (data: CreateNotebookRequest) =>
    apiClient<Notebook>("/notebooks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: UpdateNotebookRequest) =>
    apiClient<Notebook>(`/notebooks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    apiClient<void>(`/notebooks/${id}`, { method: "DELETE" }),
};
```

### Types

```typescript
interface Notebook {
  id: string;
  user_id: string;
  title: string;
  settings: NotebookRAGSettings;
  created_at: string;
  updated_at: string;
  source_count?: number;
}

interface CreateNotebookRequest {
  title: string;
  settings?: NotebookRAGSettings;
}

interface UpdateNotebookRequest {
  title?: string;
  settings?: NotebookRAGSettings;
}
```

---

## Chat API

**File:** `lib/api/chat.ts`

```typescript
export const chatApi = {
  getHistory: (notebookId: string, limit = 50) =>
    apiClient<ChatMessage[]>(`/chat/${notebookId}/history?limit=${limit}`),
  
  deleteHistory: (notebookId: string) =>
    apiClient<void>(`/chat/${notebookId}/history`, { method: "DELETE" }),
  
  getSuggestions: (notebookId: string) =>
    apiClient<SuggestionsResponse>(`/chat/${notebookId}/suggestions`),
  
  getConversationSuggestions: async (
    notebookId: string,
    lastUserMessage: string,
    lastAssistantMessage: string
  ): Promise<string[]>,
  
  sendMessage: (notebookId: string, message: string) =>
    apiClient<ChatResponse>(`/chat/${notebookId}/message`, {
      method: "POST",
      body: JSON.stringify({ message, stream: false }),
    }),
  
  sendMessageStream: async (
    notebookId: string,
    message: string,
    onToken: (token: string) => void,
    onCitations?: (citations: Citation[]) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void,
    signal?: AbortSignal
  ): Promise<void>,
};
```

### Streaming Example

```typescript
await chatApi.sendMessageStream(
  notebookId,
  "What is this document about?",
  (token) => {
    // Append token to message
    setMessage((prev) => prev + token);
  },
  (citations) => {
    // Store citations for display
    setCitations(citations);
  },
  () => {
    // Stream complete
    setIsStreaming(false);
  },
  (error) => {
    // Handle error
    console.error(error);
  },
  abortSignal // Optional abort controller
);
```

---

## Documents API

**File:** `lib/api/documents.ts`

```typescript
export const documentsApi = {
  list: (notebookId: string) =>
    apiClient<Document[]>(`/documents/notebook/${notebookId}`),
  
  upload: (notebookId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notebook_id", notebookId);
    return apiUpload<UploadDocumentResponse>("/documents/upload", formData);
  },
  
  processUrl: (notebookId: string, url: string) =>
    apiClient<ProcessUrlResponse>("/documents/url", {
      method: "POST",
      body: JSON.stringify({ notebook_id: notebookId, url }),
    }),
  
  getUrl: (documentId: string) =>
    apiClient<DocumentUrlResponse>(`/documents/${documentId}/url`),
  
  delete: (documentId: string) =>
    apiClient<void>(`/documents/${documentId}`, { method: "DELETE" }),
};
```

---

## Generation API

**File:** `lib/api/generation.ts`

```typescript
export const generationApi = {
  list: (notebookId: string, contentType?: ContentType) =>
    apiClient<ContentListResponse>(
      `/generation/${notebookId}/content${contentType ? `?content_type=${contentType}` : ""}`
    ),
  
  generatePodcast: (notebookId: string, documentIds?: string[]) =>
    apiClient<GenerateContentResponse>(`/generation/${notebookId}/podcast`, {
      method: "POST",
      body: JSON.stringify({ document_ids: documentIds }),
    }),
  
  generateQuiz: (notebookId: string, documentIds?: string[], numQuestions?: number) =>
    apiClient<GenerateContentResponse>(`/generation/${notebookId}/quiz`, {
      method: "POST",
      body: JSON.stringify({ document_ids: documentIds, num_questions: numQuestions }),
    }),
  
  generateFlashcards: (notebookId: string, documentIds?: string[], numCards?: number) =>
    apiClient<GenerateContentResponse>(`/generation/${notebookId}/flashcards`, {
      method: "POST",
      body: JSON.stringify({ document_ids: documentIds, num_cards: numCards }),
    }),
  
  generateMindmap: (notebookId: string, documentIds?: string[]) =>
    apiClient<GenerateContentResponse>(`/generation/${notebookId}/mindmap`, {
      method: "POST",
      body: JSON.stringify({ document_ids: documentIds }),
    }),
  
  getContent: (contentId: string) =>
    apiClient<GeneratedContent>(`/generation/content/${contentId}`),
  
  deleteContent: (contentId: string) =>
    apiClient<void>(`/generation/content/${contentId}`, { method: "DELETE" }),
};

export const tasksApi = {
  get: (taskId: string) =>
    apiClient<TaskProgress>(`/tasks/${taskId}`),
};
```

---

## Notes API

**File:** `lib/api/notes.ts`

```typescript
export const notesApi = {
  list: (notebookId: string) =>
    apiClient<Note[]>(`/notebooks/${notebookId}/notes`),
  
  create: (data: CreateNoteRequest) =>
    apiClient<Note>(`/notebooks/${data.notebookId}/notes`, {
      method: "POST",
      body: JSON.stringify({ title: data.title, content: data.content }),
    }),
  
  get: (noteId: string) =>
    apiClient<Note>(`/notes/${noteId}`),
  
  update: (noteId: string, data: UpdateNoteRequest) =>
    apiClient<Note>(`/notes/${noteId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  
  delete: (noteId: string) =>
    apiClient<void>(`/notes/${noteId}`, { method: "DELETE" }),
};
```

---

## Auth API

**File:** `lib/api/auth.ts`

```typescript
export const authApi = {
  me: () => apiClient<User>("/auth/me"),
};

export const healthApi = {
  check: () => apiClient<HealthStatus>("/health"),
  detailed: () => apiClient<DetailedHealthStatus>("/health/detailed"),
};
```

---

## Feedback API

**File:** `lib/api/feedback.ts`

```typescript
export async function submitFeedback(
  contentType: FeedbackContentType,
  contentId: string,
  rating: FeedbackRating,
  comment?: string
): Promise<void>

export async function getFeedback(contentId: string): Promise<FeedbackResponse>
```

---

## Rate Limiting

**File:** `lib/api/rate-limit.ts`

The client automatically handles rate limiting:

```typescript
interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Automatic retry with exponential backoff
function calculateBackoffDelay(
  retryCount: number,
  retryAfterSeconds?: number | null
): number

// Check if endpoint is currently rate limited
function isRateLimited(endpoint: string): boolean

// Get time until rate limit resets
function getRateLimitResetTime(endpoint: string): number | null
```

### Rate Limit Headers

The client reads these headers from responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
Retry-After: 60
```

---

## Error Handling

### Authentication Errors (401/403)

```typescript
function handleAuthError(status: number, endpoint: string): void {
  if (status === 401 && typeof window !== "undefined") {
    // Log and redirect to login
    window.location.href = "/auth/login";
  }
}
```

### Global Error Pattern

```typescript
try {
  const data = await apiClient<Notebook[]>('/notebooks');
} catch (error) {
  if (error instanceof RateLimitError) {
    // Show retry countdown
    const retryAfter = error.retryAfterSeconds;
    toast.error(`Rate limited. Retry in ${retryAfter}s`);
  } else if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        router.push('/auth/login');
        break;
      case 403:
        toast.error('Access denied');
        break;
      case 404:
        toast.error('Not found');
        break;
      case 500:
        toast.error('Server error');
        break;
      default:
        toast.error(error.detail);
    }
  } else {
    toast.error('Network error');
  }
}
```

---

## Best Practices

1. **Type Safety**: Always provide generic type parameter
2. **Error Handling**: Use `ApiError` for typed error handling
3. **Cancellation**: Pass `AbortSignal` for cancellable requests
4. **Rate Limits**: Respect rate limits with backoff
5. **Auth**: Client automatically adds JWT token
6. **Uploads**: Use `apiUpload` for multipart/form-data
7. **Streaming**: Use SSE for real-time updates
