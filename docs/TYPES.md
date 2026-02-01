# TypeScript Types Documentation

Complete reference for all TypeScript types in the MemexLLM frontend.

## Overview

Types are organized by domain and shared across components, hooks, and API clients. All types are exported from `lib/api/types.ts` and `lib/types.ts`.

## Core Types

### Source Types

**File:** `lib/types.ts`

```typescript
export type SourceType = "pdf" | "doc" | "image" | "video" | "audio" | "link" | "text" | "file";

export type SourceStatus = "pending" | "processing" | "completed" | "failed";

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  status?: SourceStatus;
  chunkCount?: number;
  mimeType?: string;
  errorMessage?: string | null;
  preview?: string | null;
}
```

---

## User Types

**File:** `lib/api/types.ts`

```typescript
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}
```

---

## Notebook Types

### NotebookRAGSettings

Configuration for RAG behavior per notebook.

```typescript
export interface NotebookRAGSettings {
  chunk_size?: number;              // Text chunk size (default: 1000)
  chunk_overlap?: number;           // Chunk overlap (default: 200)
  top_k_results?: number;           // Chunks to retrieve (default: 30)
  enable_query_fusion?: boolean;    // Enable query expansion
  fusion_num_queries?: number;      // Number of query variations
  use_hyde?: boolean;               // Use HyDE for retrieval
  enable_reranking?: boolean;       // Enable result reranking
  reranker_top_n?: number;          // Chunks to rerank
  default_alpha?: number;           // Hybrid search balance (0-1)
  use_sentence_window?: boolean;    // Use sentence window retrieval
  sentence_window_size?: number;    // Window size in sentences
  response_mode?: "compact" | "tree_summarize" | "refine";
  streaming?: boolean;              // Enable streaming responses
  prompt_style?: "notebooklm" | "citation" | "conversational" | "neutral";
}
```

### Notebook

```typescript
export interface Notebook {
  id: string;
  user_id: string;
  title: string;
  settings: NotebookRAGSettings;
  created_at: string;
  updated_at: string;
  source_count?: number;  // Computed field for UI
}
```

### Notebook Requests

```typescript
export interface CreateNotebookRequest {
  title: string;
  settings?: NotebookRAGSettings;
}

export interface UpdateNotebookRequest {
  title?: string;
  settings?: NotebookRAGSettings;
}
```

---

## Document Types

```typescript
export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
  id: string;
  notebook_id: string;
  filename: string;
  file_path: string;
  mime_type: string;
  status: DocumentStatus;
  error_message: string | null;
  chunk_count: number;
  preview?: string | null;  // First 500 chars for UI
  created_at: string;
}

export interface UploadDocumentResponse {
  status: string;
  document_id: string;
  notebook_id: string;
  filename: string;
  file_path: string;
  mime_type: string;
  processing_status: DocumentStatus;
  chunk_count: number;
  created_at: string;
}

export interface DocumentUrlResponse {
  url: string;
  expires_in: number;  // Seconds until URL expires
}

export interface ProcessUrlRequest {
  url: string;
  notebook_id: string;
}

export interface ProcessUrlResponse {
  status: string;
  document_id: string;
  processing_status: DocumentStatus;
}
```

---

## Chat Types

### Core Chat Types

```typescript
export interface Citation {
  id: string;
  message_id: string;
  document_id: string;
  filename?: string;  // May be missing from older docs
  text_preview: string;
  score: number;      // Relevance score (0-1)
  page_number: number | null;
}

export interface ChatMessage {
  id: string;
  notebook_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  citations: Citation[];
}

export interface SendMessageRequest {
  message: string;
  stream?: boolean;
}

export interface ChatResponse {
  role: "assistant";
  content: string;
  citations: Citation[];
}
```

### Suggested Questions

```typescript
export interface SuggestedQuestion {
  id: string;
  text: string;
  context: string | null;  // e.g., "Based on: document.pdf"
}

export interface SuggestionsResponse {
  questions: SuggestedQuestion[];
  generated_at: string;
  document_count: number;
}

// Conversation-based suggestions
export interface ConversationSuggestionsRequest {
  last_user_message: string;
  last_assistant_message: string;
}

export interface ConversationSuggestionsResponse {
  questions: string[];
}
```

---

## Content Generation Types

### Content Types

```typescript
export type ContentType = "podcast" | "quiz" | "flashcard" | "mindmap" | "note";

export type ContentStatus = "pending" | "processing" | "completed" | "failed";
```

### Podcast

```typescript
export interface PodcastDialogueTurn {
  speaker: "Host" | "Expert";
  text: string;
}

export interface PodcastScript {
  title: string;
  introduction: string;
  dialogue: PodcastDialogueTurn[];
  conclusion: string;
}

export interface PodcastContent extends GeneratedContent {
  content_type: "podcast";
  content: PodcastScript;
  audio_url: string | null;
}
```

### Quiz

```typescript
export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface QuizContent extends GeneratedContent {
  content_type: "quiz";
  content: Quiz;
}
```

### Flashcards

```typescript
export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardDeck {
  title: string;
  cards: Flashcard[];
}

export interface FlashcardContent extends GeneratedContent {
  content_type: "flashcard";
  content: FlashcardDeck;
}
```

### Mind Map

```typescript
export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface MindMap {
  title: string;
  root: MindMapNode;
}

export interface MindMapContent extends GeneratedContent {
  content_type: "mindmap";
  content: MindMap;
}
```

### Generic Content Types

```typescript
export interface GeneratedContent {
  id: string;
  notebook_id: string;
  document_id: string | null;
  content_type: ContentType;
  status: ContentStatus;
  content: PodcastScript | Quiz | FlashcardDeck | MindMap | NoteContent;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentListResponse {
  items: GeneratedContent[];
  total: number;
}

export interface GenerateContentRequest {
  content_type: ContentType;
  document_ids?: string[] | null;
}

export interface GenerateContentResponse {
  id: string;
  content_type: ContentType;
  status: ContentStatus;
  message: string;
}
```

---

## Note Types

```typescript
export interface Note {
  id: string;
  notebook_id: string;
  title: string;
  content: string;  // HTML or Markdown
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  notebookId: string;
  title?: string;
  content?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

interface NoteContent {
  title: string;
  content: string;
}
```

---

## Task Types

```typescript
export interface TaskProgress {
  id: string;
  job_id: number;
  user_id: string | null;
  notebook_id: string | null;
  document_id: string | null;
  content_id: string | null;
  progress_percent: number;  // 0-100
  message: string | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}
```

---

## Feedback Types

```typescript
export type FeedbackContentType = 
  | "chat_response" 
  | "podcast" 
  | "quiz" 
  | "flashcard" 
  | "mindmap" 
  | "note";

export type FeedbackRating = "thumbs_up" | "thumbs_down";

export interface FeedbackRequest {
  content_type: FeedbackContentType;
  content_id: string;
  rating: FeedbackRating;
  comment?: string;
}

export interface FeedbackResponse {
  id: string;
  user_id: string;
  content_type: FeedbackContentType;
  content_id: string;
  rating: FeedbackRating;
  comment: string | null;
  created_at: string;
}
```

---

## Health Types

```typescript
export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
}

export interface ServiceHealth {
  status: "healthy" | "unhealthy";
  message?: string;
}

export interface DetailedHealthStatus {
  status: "healthy" | "unhealthy";
  services: {
    database: ServiceHealth;
    qdrant: ServiceHealth;
    storage: ServiceHealth;
  };
  timestamp: string;
}
```

---

## API Error Types

```typescript
export interface ApiErrorResponse {
  detail: string;
  status?: number;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  detail: ValidationError[];
}
```

---

## Component Prop Types

### Chat Panel

```typescript
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

interface LastChatTurn {
  userMessage: string;
  assistantMessage: string;
}

interface ChatPanelProps {
  messages: Message[];
  sourceCount: number;
  notebookId: string | null;
  onSendMessage: (content: string) => void;
  onOpenSettings?: () => void;
  onDeleteHistory?: () => void;
  onViewSource?: (documentId: string, pageNumber?: number | null) => void;
  lastChatTurn?: LastChatTurn | null;
  onNoteSaved?: () => void;
}
```

### Notebook Card

```typescript
interface NotebookCardProps {
  notebook: {
    id: string;
    title: string;
    category: string;
    date: string;
    sources: number;
    isPublic: boolean;
  };
  variant?: "featured" | "recent";
  onUpdate?: (id: string, newTitle: string) => void;
}
```

---

## Type Guards

Helper functions for type narrowing:

```typescript
// Check if content is a podcast
export function isPodcastContent(
  content: GeneratedContent
): content is PodcastContent {
  return content.content_type === "podcast";
}

// Check if content is a quiz
export function isQuizContent(
  content: GeneratedContent
): content is QuizContent {
  return content.content_type === "quiz";
}

// Check if content is flashcards
export function isFlashcardContent(
  content: GeneratedContent
): content is FlashcardContent {
  return content.content_type === "flashcard";
}

// Check if content is a mind map
export function isMindMapContent(
  content: GeneratedContent
): content is MindMapContent {
  return content.content_type === "mindmap";
}
```

---

## Best Practices

1. **Use Strict Types**: Avoid `any`, use `unknown` when type is truly unknown
2. **Export Types**: All types should be exported for reuse
3. **Document Fields**: Add JSDoc comments for complex fields
4. **Use Unions**: Use discriminated unions for variant types
5. **Null vs Undefined**: Be explicit about optional vs nullable
6. **Readonly**: Use `readonly` for immutable data
7. **Branded Types**: Use for type-safe IDs

```typescript
// Branded type example
type NotebookId = string & { __brand: "NotebookId" };
type DocumentId = string & { __brand: "DocumentId" };

function getNotebook(id: NotebookId): Notebook;
function getDocument(id: DocumentId): Document;

// Prevents mixing up IDs
const notebookId = "uuid" as NotebookId;
getDocument(notebookId); // Type error!
```
