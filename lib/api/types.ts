// === User ===
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// === Notebooks ===
export interface NotebookRAGSettings {
  chunk_size?: number;
  chunk_overlap?: number;
  top_k_results?: number;
  enable_query_fusion?: boolean;
  fusion_num_queries?: number;
  use_hyde?: boolean;
  enable_reranking?: boolean;
  reranker_top_n?: number;
  default_alpha?: number;
  use_sentence_window?: boolean;
  sentence_window_size?: number;
  response_mode?: "compact" | "tree_summarize" | "refine";
  streaming?: boolean;
  prompt_style?: "notebooklm" | "citation" | "conversational" | "neutral";
}

export interface Notebook {
  id: string;
  user_id: string;
  title: string;
  settings: NotebookRAGSettings;
  created_at: string;
  updated_at: string;
  source_count?: number;
}

export interface CreateNotebookRequest {
  title: string;
  settings?: NotebookRAGSettings;
}

export interface UpdateNotebookRequest {
  title?: string;
  settings?: NotebookRAGSettings;
}

// === Documents ===
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
  expires_in: number;
}

// === Chat ===
export interface Citation {
  id: string;
  message_id: string;
  document_id: string;
  filename?: string;  // Optional - may be missing from older indexed documents
  text_preview: string;
  score: number;
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

// === Suggested Questions ===
export interface SuggestedQuestion {
  id: string;
  text: string;
  context: string | null;
}

export interface SuggestionsResponse {
  questions: SuggestedQuestion[];
  generated_at: string;
  document_count: number;
}

// === Conversation-Based Suggestions (Option B) ===
export interface ConversationSuggestionsRequest {
  last_user_message: string;
  last_assistant_message: string;
}

export interface ConversationSuggestionsResponse {
  questions: string[];
}

// === Content Generation ===
export type ContentType = "podcast" | "quiz" | "flashcard" | "mindmap" | "note";

export interface GenerateContentRequest {
  content_type: ContentType;
  document_ids?: string[] | null;
}

export interface FlashcardContent {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  children: MindmapNode[];
}

export interface PodcastDialogue {
  speaker: string;
  text: string;
}

export interface PodcastContent {
  title: string;
  dialogue: PodcastDialogue[];
}

export interface QuizContent {
  title: string;
  questions: QuizQuestion[];
}

export interface FlashcardDeckContent {
  title: string;
  flashcards: FlashcardContent[];
}

export interface MindmapContent {
  title: string;
  nodes: MindmapNode[];
}

export interface GeneratedContent {
  id: string;
  notebook_id: string;
  content_type: ContentType;
  status: "queued" | "processing" | "completed" | "failed";
  content: PodcastContent | QuizContent | FlashcardDeckContent | MindmapContent | null;
  audio_url?: string;
  created_at: string;
}

export interface AsyncGenerationResponse {
  status: "queued";
  task_id: number;
  content_id: string;
  message: string;
}

// === Task Queue ===
export type TaskStatus = "todo" | "doing" | "succeeded" | "failed" | "aborted";

export interface TaskStatusResponse {
  job_id: number;
  status: TaskStatus;
  queue_name: string;
  task_name: string;
  attempts: number;
  scheduled_at: string;
  error: string | null;
  result: unknown | null;
}

export interface TaskProgressResponse {
  job_id: number;
  status: TaskStatus;
  progress: number;
  message: string;
  started_at: string;
  updated_at: string;
}

// === Health ===
export interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  response_time_ms: number;
  services: {
    database: { status: string; details?: string };
    vector_database: { status: string; details?: string; vectors_count?: number };
    storage: { status: string; details?: string; provider?: string };
    llm_provider: { status: string; provider?: string; model?: string };
  };
  environment: string;
  version: string;
}

// === Feedback ===
export type FeedbackContentType =
  | "chat_response"
  | "podcast"
  | "quiz"
  | "flashcard"
  | "mindmap"
  | "note";

export type FeedbackRating = "thumbs_up" | "thumbs_down";

export interface FeedbackCreateRequest {
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
  updated_at: string;
}

export interface FeedbackStatusResponse {
  has_feedback: boolean;
  feedback: FeedbackResponse | null;
}
