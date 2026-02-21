import { Badge } from "@/components/ui/badge"
import { Code, FileText, MessageSquare, Brain, CheckCircle } from "lucide-react"

export default function TypesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Reference</Badge>
        <h1 className="text-4xl font-bold tracking-tight">TypeScript Types</h1>
        <p className="text-xl text-muted-foreground">
          Complete reference for all TypeScript types and interfaces used throughout the NotebookLLM frontend.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">
          TypeScript types are organized across several modules:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border">
            <code className="text-sm">frontend/lib/types.ts</code>
            <p className="text-sm text-muted-foreground mt-2">General application types</p>
          </div>
          <div className="p-4 rounded-lg border">
            <code className="text-sm">frontend/lib/types-gdrive.ts</code>
            <p className="text-sm text-muted-foreground mt-2">Google Drive integration types</p>
          </div>
          <div className="p-4 rounded-lg border">
            <code className="text-sm">frontend/lib/api/types.ts</code>
            <p className="text-sm text-muted-foreground mt-2">API request/response types</p>
          </div>
        </div>
      </section>

      {/* Core Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Core Application Types
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Source Types</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Source type for documents
type SourceType = "pdf" | "doc" | "image" | "video" | "audio" | "link" | "text" | "file"

// Document processing status
type SourceStatus = "pending" | "processing" | "completed" | "failed"

// Source/document interface
interface Source {
  id: string
  name: string
  type: SourceType
  status?: SourceStatus
  chunkCount?: number
  mimeType?: string
  errorMessage?: string | null
  preview?: string | null
}`}</pre>
          </div>
        </div>
      </section>

      {/* Notebooks */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          Notebook Types
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// RAG settings for a notebook
interface NotebookRAGSettings {
  chunk_size?: number
  chunk_overlap?: number
  top_k_results?: number
  enable_query_fusion?: boolean
  fusion_num_queries?: number
  use_hyde?: boolean
  enable_reranking?: boolean
  reranker_top_n?: number
  default_alpha?: number
  use_sentence_window?: boolean
  sentence_window_size?: number
  response_mode?: "compact" | "tree_summarize" | "refine"
  streaming?: boolean
  prompt_style?: "notebooklm" | "citation" | "conversational" | "neutral"
}

// Notebook interface
interface Notebook {
  id: string
  user_id: string
  title: string
  settings: NotebookRAGSettings
  created_at: string
  updated_at: string
  source_count?: number
}

// Request types
interface CreateNotebookRequest {
  title: string
  settings?: NotebookRAGSettings
}

interface UpdateNotebookRequest {
  title?: string
  settings?: NotebookRAGSettings
}`}</pre>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Document Types
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Document processing status
type DocumentStatus = "pending" | "processing" | "completed" | "failed"

// Document in a notebook
interface Document {
  id: string
  notebook_id: string
  filename: string
  file_path: string
  mime_type: string
  status: DocumentStatus
  error_message: string | null
  chunk_count: number
  preview?: string | null
  created_at: string
}

// Upload response
interface UploadDocumentResponse {
  status: string
  document_id: string
  notebook_id: string
  filename: string
  file_path: string
  mime_type: string
  processing_status: DocumentStatus
  chunk_count: number
  created_at: string
}

// URL for document preview
interface DocumentUrlResponse {
  url: string
  expires_in: number
}`}</pre>
          </div>
        </div>
      </section>

      {/* Chat */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Chat Types
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Messages & Citations</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Citation from document
interface Citation {
  id: string
  message_id: string
  document_id: string
  filename?: string
  text_preview: string
  score: number
  page_number: number | null
}

// Chat message
interface ChatMessage {
  id: string
  notebook_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
  citations: Citation[]
}

// Request/response
interface SendMessageRequest {
  message: string
  stream?: boolean
}

interface ChatResponse {
  role: "assistant"
  content: string
  citations: Citation[]
}`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Suggested Questions</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// AI-generated question
interface SuggestedQuestion {
  id: string
  text: string
  context: string | null
}

// Suggestions response
interface SuggestionsResponse {
  questions: SuggestedQuestion[]
  generated_at: string
  document_count: number
}

// Conversation-based suggestions
interface ConversationSuggestionsResponse {
  questions: string[]
}`}</pre>
          </div>
        </div>
      </section>

      {/* Content Generation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Brain className="w-6 h-6" />
          Content Generation Types
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Content Types</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Available content types
type ContentType = "podcast" | "quiz" | "flashcard" | "mindmap" | "note"

// Generation request
interface GenerateContentRequest {
  content_type: ContentType
  document_ids?: string[] | null
}

// Async generation response
interface AsyncGenerationResponse {
  status: "queued"
  task_id: number
  content_id: string
  message: string
}

// Generated content status
type GeneratedContentStatus = "queued" | "processing" | "completed" | "failed"`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Content Structures</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Flashcard content
interface FlashcardContent {
  id: string
  question: string
  answer: string
}

interface FlashcardDeckContent {
  title: string
  flashcards: FlashcardContent[]
}

// Quiz content
interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

interface QuizContent {
  title: string
  questions: QuizQuestion[]
}

// Mind map content
interface MindmapNode {
  id: string
  label: string
  children: MindmapNode[]
}

interface MindmapContent {
  title: string
  nodes: MindmapNode[]
}

// Podcast content
interface PodcastDialogue {
  speaker: string
  text: string
}

interface PodcastContent {
  title: string
  dialogue: PodcastDialogue[]
}

// Complete generated content
interface GeneratedContent {
  id: string
  notebook_id: string
  content_type: ContentType
  status: GeneratedContentStatus
  content: PodcastContent | QuizContent | FlashcardDeckContent | MindmapContent | null
  audio_url?: string
  created_at: string
}`}</pre>
          </div>
        </div>
      </section>

      {/* Task Queue */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          Task Queue Types
        </h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Task status
type TaskStatus = "todo" | "doing" | "succeeded" | "failed" | "aborted"

// Task status response
interface TaskStatusResponse {
  job_id: number
  status: TaskStatus
  queue_name: string
  task_name: string
  attempts: number
  scheduled_at: string
  error: string | null
  result: unknown | null
}

// Task progress
interface TaskProgressResponse {
  job_id: number
  status: TaskStatus
  progress: number
  message: string
  started_at: string
  updated_at: string
}`}</pre>
          </div>
        </div>
      </section>

      {/* Health Check */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Health Check Types</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`interface HealthResponse {
  status: "healthy" | "unhealthy"
  timestamp: string
  response_time_ms: number
  services: {
    database: { status: string; details?: string }
    vector_database: { status: string; details?: string; vectors_count?: number }
    storage: { status: string; details?: string; provider?: string }
    llm_provider: { status: string; provider?: string; model?: string }
  }
  environment: string
  version: string
}`}</pre>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Feedback Types</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Content types that can be rated
type FeedbackContentType = 
  | "chat_response" 
  | "podcast" 
  | "quiz" 
  | "flashcard" 
  | "mindmap" 
  | "note"

// Rating values
type FeedbackRating = "thumbs_up" | "thumbs_down"

// Feedback request
interface FeedbackCreateRequest {
  content_type: FeedbackContentType
  content_id: string
  rating: FeedbackRating
  comment?: string
}

// Feedback response
interface FeedbackResponse {
  id: string
  user_id: string
  content_type: FeedbackContentType
  content_id: string
  rating: FeedbackRating
  comment: string | null
  created_at: string
  updated_at: string
}

// Feedback status
interface FeedbackStatusResponse {
  has_feedback: boolean
  feedback: FeedbackResponse | null
}`}</pre>
          </div>
        </div>
      </section>

      {/* Google Drive Types */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Google Drive Types</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Google Drive file types
type GoogleDriveFileType = 
  | "folder"
  | "pdf"
  | "doc"
  | "sheet"
  | "slide"
  | "image"
  | "video"
  | "audio"
  | "text"
  | "file"

// Google Drive file
interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  type: GoogleDriveFileType
  size?: string | number
  sizeBytes?: number
  thumbnailUrl?: string | null
  webViewUrl?: string
  createdTime?: string
  modifiedTime?: string
  parents?: string[]
  owner?: { displayName?: string; email?: string }
  indexed?: boolean
  status?: "idle" | "indexing" | "indexed" | "error"
  errorMessage?: string | null
}

// Folder with breadcrumb path
interface GoogleDriveFolder {
  id: string
  name: string
  path: string
}

// Auth status
interface GoogleDriveAuthStatus {
  configured: boolean
  connected: boolean
  email: string | null
}

// Import progress
interface GoogleDriveImportProgress {
  fileId: string
  fileName: string
  status: "pending" | "importing" | "completed" | "failed"
  progress: number
  error?: string
}`}</pre>
          </div>
        </div>
      </section>

      {/* Pagination */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Pagination Types</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// Cursor-based pagination
interface CursorPage<T> {
  items: T[]
  next_cursor: string | null
  previous_cursor: string | null
  total_count: number
  has_more: boolean
}`}</pre>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="flex gap-4 pt-4">
        <a href="/docs/authentication" className="text-primary hover:underline">
          Next: Authentication →
        </a>
      </div>
    </div>
  )
}
