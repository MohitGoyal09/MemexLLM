# API Documentation

Complete REST API reference for the NotebookLLM Backend.

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000/api/v1` (Development)  
**Production URL:** `https://your-domain.com/api/v1`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Health Check Endpoints](#health-check-endpoints)
5. [Authentication Endpoints](#authentication-endpoints)
6. [Notebook Endpoints](#notebook-endpoints)
7. [Document Endpoints](#document-endpoints)
8. [Chat Endpoints](#chat-endpoints)
9. [Content Generation Endpoints](#content-generation-endpoints)
10. [Task Queue Endpoints](#task-queue-endpoints)
11. [Error Responses](#error-responses)
12. [Interactive Documentation](#interactive-documentation)

---

## Overview

The NotebookLLM API is a RESTful service built with **FastAPI** that provides:

- **Document Management**: Upload, process, and manage PDFs, text files, and other documents
- **RAG-Powered Chat**: Contextual Q&A with source citations
- **Content Generation**: Generate podcasts, quizzes, flashcards, and mindmaps
- **Background Processing**: Async task queue for long-running operations
- **Real-time Streaming**: Server-Sent Events (SSE) for chat responses

### Key Features

- ✅ JWT-based authentication via Supabase
- ✅ Rate limiting (configurable)
- ✅ Comprehensive health checks
- ✅ Automatic retry logic
- ✅ CORS security
- ✅ Auto-generated OpenAPI docs

---

## Authentication

All endpoints (except `/health/*`) require authentication via **Supabase JWT token**.

### Request Header

```http
Authorization: Bearer <JWT_TOKEN>
```

### How to Get a Token

1. **Frontend**: Use Supabase Auth SDK to sign in/sign up
2. **Backend**: Extract JWT from session
3. **API Requests**: Include token in `Authorization` header

### User Provisioning

- Users are **automatically created** on first request (JIT provisioning)
- User ID is extracted from JWT claims
- No explicit registration endpoint needed

### Example

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:8000/api/v1/auth/me
```

---

## Rate Limiting

The API implements intelligent rate limiting to prevent abuse and ensure fair resource usage.

### Default Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| **Global** | 100 requests | per minute per IP |
| **Chat Messages** | 20 requests | per minute per IP |
| **Document Uploads** | 10 requests | per hour per IP |

### Configuration

Set `ENABLE_RATE_LIMITING=false` in environment variables to disable rate limiting (not recommended for production).

### Rate Limit Headers

Every API response includes headers indicating your current rate limit status:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705395600
```

### Rate Limit Exceeded Response

**HTTP 429 Too Many Requests**
```json
{
  "error": "Rate limit exceeded",
  "detail": "20 per 1 minute"
}
```

**Retry After**: Check `Retry-After` header for seconds until reset.

---

## Health Check Endpoints

### `GET /api/v1/health`

Comprehensive health check that verifies connectivity to all critical services.

**Authentication:** Not required  
**Rate Limit:** Not applied

#### Success Response (200 OK)

```json
{
  "status": "healthy",
  "timestamp": "2026-01-17T01:30:00Z",
  "response_time_ms": 150,
  "services": {
    "database": {
      "status": "healthy",
      "details": "Database connection successful"
    },
    "vector_database": {
      "status": "healthy",
      "details": "Connected to collection 'notebookllm'",
      "vectors_count": 15234
    },
    "storage": {
      "status": "healthy",
      "details": "Supabase Storage connected, 2 buckets available",
      "provider": "supabase"
    },
    "llm_provider": {
      "status": "healthy",
      "details": "LLM provider 'gemini' configured",
      "provider": "gemini",
      "model": "gemini-2.5-flash"
    }
  },
  "environment": "development",
  "version": "1.0.0"
}
```

#### Unhealthy Response (503 Service Unavailable)

```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-17T01:30:00Z",
  "response_time_ms": 5020,
  "services": {
    "database": {
      "status": "healthy",
      "details": "Database connection successful"
    },
    "vector_database": {
      "status": "unhealthy",
      "error": "Connection timeout",
      "details": "Failed to connect to Qdrant vector database"
    },
    "storage": {
      "status": "healthy",
      "details": "Supabase Storage connected",
      "provider": "supabase"
    },
    "llm_provider": {
      "status": "healthy",
      "provider": "gemini"
    }
  },
  "environment": "production",
  "version": "1.0.0"
}
```

---

### `GET /api/v1/health/liveness`

Simple liveness probe for Kubernetes/Docker health checks.

**Authentication:** Not required

#### Response (200 OK)

```json
{
  "status": "alive",
  "timestamp": "2026-01-17T01:30:00Z"
}
```

---

### `GET /api/v1/health/readiness`

Readiness probe that checks if the application is ready to accept traffic.

**Authentication:** Not required

#### Ready Response (200 OK)

```json
{
  "status": "ready",
  "timestamp": "2026-01-17T01:30:00Z"
}
```

#### Not Ready Response (503 Service Unavailable)

```json
{
  "status": "not_ready",
  "error": "Database connection failed"
}
```

---

## Authentication Endpoints

### `GET /api/v1/auth/me`

Get the current authenticated user's profile.

**Authentication:** Required  
**Rate Limit:** 100/min (global)

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Errors

- **401 Unauthorized**: Missing or invalid token
- **500 Internal Server Error**: Server error

---

## Notebook Endpoints

Notebooks are workspaces for organizing documents and conversations.

### `GET /api/v1/notebooks`

List all notebooks for the authenticated user.

**Authentication:** Required

#### Response (200 OK)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "title": "Research Papers",
    "settings": {
      "theme": "dark"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "title": "Meeting Notes",
    "settings": {},
    "created_at": "2024-01-10T00:00:00Z",
    "updated_at": "2024-01-10T00:00:00Z"
  }
]
```

---

### `POST /api/v1/notebooks`

Create a new notebook.

**Authentication:** Required

#### Request Body

```json
{
  "title": "My New Notebook",
  "settings": {
    "use_hyde": true,
    "default_alpha": 0.5,
    "enable_reranking": true,
    "top_k_results": 10,
    "prompt_style": "conversational"
  }
}
```

**Fields:**
- `title` (required): Notebook title (1-200 characters)
- `settings` (optional): RAG configuration object (see [Notebook Settings Schema](#notebook-settings-schema) below)

#### Notebook Settings Schema

The `settings` field accepts a **NotebookRAGConfig** object with the following optional fields:

```json
{
  "chunk_size": 512,              // 128-2048, size of text chunks
  "chunk_overlap": 50,             // 0-512, overlap between chunks
  "top_k_results": 10,             // 1-50, number of chunks to retrieve
  "enable_query_fusion": true,     // Generate multiple search queries
  "fusion_num_queries": 3,         // 1-5, number of query variations
  "use_hyde": true,                // Enable Hypothetical Document Embeddings
  "enable_reranking": true,        // Enable reranking for better precision
  "reranker_top_n": 5,             // 1-20, number of chunks after reranking
  "default_alpha": 0.5,            // 0.0 = Keyword only, 1.0 = Vector only
  "use_sentence_window": false,    // Use sentence window for context
  "sentence_window_size": 3,       // 1-10, sentence window size
  "response_mode": "compact",      // compact | tree_summarize | refine
  "streaming": true,               // Enable streaming responses
  "prompt_style": "conversational" // citation | conversational | neutral
}
```

**All fields are optional** - unset fields use global configuration defaults

#### Response (201 Created)

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "My New Notebook",
  "settings": {
    "theme": "dark",
    "custom_field": "value"
  },
  "created_at": "2024-01-17T01:30:00Z",
  "updated_at": "2024-01-17T01:30:00Z"
}
```

---

### `GET /api/v1/notebooks/{notebook_id}`

Get a specific notebook by ID.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Research Papers",
  "settings": {},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Errors

- **404 Not Found**: Notebook doesn't exist or belongs to another user
- **403 Forbidden**: Access denied

---

### `PATCH /api/v1/notebooks/{notebook_id}`

Update notebook title and/or settings.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Request Body

```json
{
  "title": "Updated Title",
  "settings": {
    "use_hyde": false,
    "enable_reranking": true,
    "top_k_results": 15,
    "prompt_style": "citation"
  }
}
```

**Note:** Fields are optional. Only provided fields will be updated. Settings are merged with existing configuration.

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Updated Title",
  "settings": {
    "theme": "light",
    "font_size": "large"
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-17T01:35:00Z"
}
```

#### Errors

- **404 Not Found**: Notebook doesn't exist
- **403 Forbidden**: Access denied

---

### `DELETE /api/v1/notebooks/{notebook_id}`

Delete a notebook and **all associated data** (documents, messages, generated content, vector embeddings).

**Authentication:** Required  
**Warning:** This operation is irreversible!

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Response (204 No Content)

No response body.

#### Errors

- **404 Not Found**: Notebook doesn't exist
- **403 Forbidden**: Access denied

---

## Document Endpoints

### `POST /api/v1/documents/upload`

Upload a document to private storage and start background processing.

**Authentication:** Required  
**Rate Limit:** 10/hour  
**Content-Type:** `multipart/form-data`

#### Supported File Types

- **Documents**: PDF, TXT, MD, DOCX, PPTX, XLSX
- **Code**: PY, JS, TS, JAVA, CPP, GO, YAML, JSON
- **Audio**: MP3, WAV, M4A, OGG
- **Video**: MP4, WEBM (audio extraction)
- **Web**: URLs, YouTube links

#### Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | Binary | Yes | File to upload |
| `notebook_id` | UUID | Yes | Target notebook |

#### Request Example

```bash
curl -X POST \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@document.pdf" \
  -F "notebook_id=550e8400-e29b-41d4-a716-446655440000" \
  http://localhost:8000/api/v1/documents/upload
```

#### Response (201 Created)

```json
{
  "status": "uploaded",
  "document_id": "880e8400-e29b-41d4-a716-446655440003",
  "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf",
  "file_path": "notebooks/550e8400.../document.pdf",
  "mime_type": "application/pdf",
  "processing_status": "pending",
  "chunk_count": 0,
  "created_at": "2024-01-16T15:00:00Z"
}
```

#### Processing Status Values

| Status | Description |
|--------|-------------|
| `pending` | Uploaded, waiting for processing |
| `processing` | Currently being processed (chunking, embedding, indexing) |
| `completed` | Successfully processed and indexed |
| `failed` | Processing failed (check `error_message`) |

#### Errors

- **413 Payload Too Large**: File exceeds maximum size (default: 100MB)
- **403 Forbidden**: Notebook not found or access denied
- **400 Bad Request**: Invalid file type or missing fields
- **500 Internal Server Error**: Storage upload failed

---

### `GET /api/v1/documents/{document_id}/url`

Get a temporary **signed URL** to view or download a document.

**Authentication:** Required  
**URL Expiration:** 1 hour

#### Path Parameters

- `document_id` (UUID): Document identifier

#### Response (200 OK)

```json
{
  "url": "https://xyz.supabase.co/storage/v1/object/sign/notebook-private/notebooks/.../document.pdf?token=...",
  "expires_in": 3600
}
```

**Note:** The URL will expire after 1 hour for security reasons.

#### Errors

- **404 Not Found**: Document doesn't exist
- **403 Forbidden**: Access denied
- **500 Internal Server Error**: Failed to generate signed URL

---

### `GET /api/v1/documents/notebook/{notebook_id}`

List all documents in a notebook.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Response (200 OK)

```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "research_paper.pdf",
    "file_path": "notebooks/550e8400.../research_paper.pdf",
    "mime_type": "application/pdf",
    "status": "completed",
    "error_message": null,
    "chunk_count": 42,
    "created_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "notes.txt",
    "file_path": "notebooks/550e8400.../notes.txt",
    "mime_type": "text/plain",
    "status": "processing",
    "error_message": null,
    "chunk_count": 0,
    "created_at": "2024-01-16T14:30:00Z"
  }
]
```

#### Errors

- **404 Not Found**: Notebook doesn't exist
- **403 Forbidden**: Access denied

---

### `DELETE /api/v1/documents/{document_id}`

Delete a document, removing it from storage and vector store.

**Authentication:** Required

#### Path Parameters

- `document_id` (UUID): Document identifier

#### Response (204 No Content)

No response body.

#### Errors

- **404 Not Found**: Document doesn't exist
- **403 Forbidden**: Access denied
- **500 Internal Server Error**: Failed to delete from storage/vector DB

---

## Chat Endpoints

### `POST /api/v1/chat/{notebook_id}/message`

Send a message to the RAG engine and get a response.

**Authentication:** Required  
**Rate Limit:** 20/min

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Request Body

```json
{
  "message": "What are the key findings in this research paper?",
  "stream": false
}
```

**Fields:**
- `message` (required): Chat message (1-10,000 characters)
- `stream` (optional): Enable streaming response (default: `false`)

---

#### Non-Streaming Response (200 OK)

```json
{
  "role": "assistant",
  "content": "Based on the uploaded documents, the key findings are:\n\n1. The study shows a 35% improvement...\n2. Participants experienced...\n3. The methodology involved...",
  "citations": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440007",
      "message_id": "bb0e8400-e29b-41d4-a716-446655440006",
      "document_id": "880e8400-e29b-41d4-a716-4466554400003",
      "filename": "research_paper.pdf",
      "text_preview": "The results demonstrate a statistically significant improvement of 35% (p < 0.01)...",
      "score": 0.89,
      "page_number": 12
    },
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440008",
      "message_id": "bb0e8400-e29b-41d4-a716-446655440006",
      "document_id": "880e8400-e29b-41d4-a716-446655440003",
      "filename": "research_paper.pdf",
      "text_preview": "Participants in the experimental group showed...",
      "score": 0.82,
      "page_number": 15
    }
  ]
}
```

#### Citation Object Schema

Each citation in the `citations` array has the following structure:

```json
{
  "id": "uuid",                    // Citation ID
  "message_id": "uuid",            // Parent message ID
  "document_id": "uuid",           // Source document ID
  "filename": "research.pdf",      // Document filename for display
  "text_preview": "...",           // Text excerpt (max ~200 characters)
  "score": 0.89,                   // Relevance score (0.0-1.0, from reranker)
  "page_number": 12                // Page number (null if not available)
}
```

---

#### Streaming Response (stream: true)

**Content-Type:** `text/event-stream`

```
data: Based on

data:  the uploaded

data:  documents

data: , the key

data:  findings

data:  are:

data: \n\n1. The study

data:  shows a

data:  35% improvement...
```

**Note:** Citations are sent at the end of the stream in a special event.

---

#### Errors

- **404 Not Found**: Notebook doesn't exist
- **403 Forbidden**: Access denied
- **400 Bad Request**: Message too long or empty
- **500 Internal Server Error**: Processing failed

---

### `GET /api/v1/chat/{notebook_id}/history`

Get chat history for a notebook.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Query Parameters

- `limit` (optional): Maximum messages to return (default: 50, max: 100)

#### Response (200 OK)

```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "user",
    "content": "What is this document about?",
    "created_at": "2024-01-16T10:00:00Z",
    "citations": []
  },
  {
    "id": "bb0e8400-e29b-41d4-a716-446655440006",
    "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "assistant",
    "content": "This document discusses machine learning techniques for...",
    "created_at": "2024-01-16T10:00:05Z",
    "citations": [
      {
        "id": "ee0e8400-e29b-41d4-a716-446655440009",
        "message_id": "bb0e8400-e29b-41d4-a716-446655440006",
        "document_id": "880e8400-e29b-41d4-a716-446655440003",
        "filename": "research_paper.pdf",
        "text_preview": "Machine learning techniques such as...",
        "score": 0.91,
        "page_number": 3
      }
    ]
  }
]
```

**Note:** Messages are returned in **chronological order** (oldest first).

#### Errors

- **404 Not Found**: Notebook doesn't exist
- **403 Forbidden**: Access denied

---

### `DELETE /api/v1/chat/{notebook_id}/history`

Delete all chat messages for a notebook.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Response (204 No Content)

No response body.

#### Errors

- **404 Not Found**: Notebook doesn't exist or no messages found
- **403 Forbidden**: Access denied

---

## Suggestion Endpoints

### `GET /api/v1/chat/{notebook_id}/suggestions`

Generate contextual suggested questions based on notebook content.

**Authentication:** Required  
**Rate Limit:** 10/min  
**Cache:** Results cached for 5 minutes

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Response (200 OK)

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "What are the key findings regarding the algorithm's efficiency?",
      "context": "Based on: research_paper.pdf"
    },
    {
      "id": "q2",
      "text": "How does the proposed method compare to existing baselines?",
      "context": "Based on: evaluation_results.csv"
    }
  ],
  "generated_at": "2024-01-26T12:00:00Z",
  "document_count": 5
}
```

#### Errors

- **404 Not Found**: Notebook doesn't exist
- **500 Internal Server Error**: Generation failed

---

### `POST /api/v1/chat/{notebook_id}/suggestions`

Generate follow-up question suggestions based on the last conversation turn.

**Authentication:** Required  
**Rate Limit:** 20/min

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Request Body

```json
{
  "last_user_message": "Explain the transformer architecture.",
  "last_assistant_message": "The Transformer architecture, introduced by Vaswani et al., relies entirely on attention mechanisms..."
}
```

#### Response (200 OK)

```json
{
  "questions": [
    "How does the self-attention mechanism work specifically?",
    "What is the role of positional encodings?",
    "How does it differ from RNNs?"
  ]
}
```

#### Errors

- **404 Not Found**: Notebook doesn't exist
- **500 Internal Server Error**: Generation failed

---

## Content Generation Endpoints

### `POST /api/v1/generation/{notebook_id}/generate`

Generate content (podcast, quiz, flashcard, or mindmap) from documents.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Query Parameters

- `async_mode` (optional): If `true`, queue task and return immediately (default: `false`)

#### Request Body

```json
{
  "content_type": "podcast",
  "document_ids": ["880e8400-e29b-41d4-a716-446655440003"]
}
```

**Fields:**
- `content_type` (required): One of `podcast`, `quiz`, `flashcard`, `mindmap`
- `document_ids` (optional): List of document UUIDs. If `null`, uses all documents in notebook

---

#### Synchronous Response (200 OK)

**Podcast:**
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440007",
  "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
  "content_type": "podcast",
  "status": "completed",
  "content": {
    "title": "Deep Dive: Machine Learning Research",
    "dialogue": [
      {
        "speaker": "Host (Jane)",
        "text": "Welcome to today's discussion! We're diving into a fascinating research paper on machine learning. Let's get started!"
      },
      {
        "speaker": "Expert (Mike)",
        "text": "Thanks for having me, Jane. This paper presents some groundbreaking findings..."
      }
    ]
  },
  "audio_url": "https://xyz.supabase.co/storage/v1/object/public/notebook-public/podcasts/cc0e8400.../podcast.mp3",
  "created_at": "2024-01-16T15:00:00Z"
}
```

**Quiz:**
```json
{
  "id": "dd0e8400-e29b-41d4-a716-446655440008",
  "notebook_id": "550e8400-e29b-41d4-a716-446655440000",
  "content_type": "quiz",
  "status": "completed",
  "content": {
    "title": "Machine Learning Research Quiz",
    "questions": [
      {
        "question": "What was the primary improvement shown in the study?",
        "options": [
          "35% accuracy improvement",
          "50% speed improvement",
          "25% cost reduction",
          "10% energy savings"
        ],
        "correct_answer": 0,
        "explanation": "The study demonstrated a 35% improvement in model accuracy, as stated on page 12."
      }
    ]
  },
  "created_at": "2024-01-16T15:05:00Z"
}
```

---

#### Asynchronous Response (async_mode=true)

**HTTP 201 Created**
```json
{
  "status": "queued",
  "task_id": 12345,
  "content_id": "ee0e8400-e29b-41d4-a716-446655440009",
  "message": "Podcast generation queued. Poll /api/v1/tasks/12345 for progress."
}
```

**Next Steps:**
1. Poll `GET /api/v1/tasks/12345` to check status
2. When status is `completed`, fetch content using `content_id`

---

#### Errors

- **404 Not Found**: Notebook or documents don't exist
- **403 Forbidden**: Access denied
- **400 Bad Request**: Invalid content type or document IDs
- **500 Internal Server Error**: Generation failed

---

### `DELETE /api/v1/generation/{notebook_id}/content/{content_id}`

Delete a specific generated content item.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier
- `content_id` (UUID): Content identifier

#### Response (204 No Content)

No response body.

#### Errors

- **404 Not Found**: Notebook or content doesn't exist
- **403 Forbidden**: Access denied

---

### `DELETE /api/v1/generation/{notebook_id}`

Delete all generated content for a notebook, with optional filters.

**Authentication:** Required

#### Path Parameters

- `notebook_id` (UUID): Notebook identifier

#### Query Parameters

- `content_type` (required): Filter by type (`podcast`, `quiz`, `flashcard`, `mindmap`)
- `document_id` (optional): Filter by source document

#### Response (204 No Content)

No response body.

#### Errors

- **404 Not Found**: No content found matching criteria
- **403 Forbidden**: Access denied
- **400 Bad Request**: `content_type` is required

---

## Task Queue Endpoints

### `GET /api/v1/tasks/{job_id}`

Get the status of a background task.

**Authentication:** Required

#### Path Parameters

- `job_id` (integer): Procrastinate job ID

#### Response (200 OK)

```json
{
  "job_id": 12345,
  "status": "doing",
  "queue_name": "high",
  "task_name": "generate_podcast_task",
  "attempts": 1,
  "scheduled_at": "2024-01-16T15:00:00Z",
  "error": null,
  "result": null
}
```

**Status Values:**
- `todo`: Queued, not started
- `doing`: Currently processing
- `succeeded`: Completed successfully
- `failed`: Failed after retries
- `aborted`: Cancelled by user

#### Errors

- **404 Not Found**: Task doesn't exist
- **403 Forbidden**: Task belongs to another user

---

### `GET /api/v1/tasks/{job_id}/progress`

Get detailed progress of a background task.

**Authentication:** Required

#### Path Parameters

- `job_id` (integer): Job ID

#### Response (200 OK)

```json
{
  "job_id": 12345,
  "status": "doing",
  "progress": 65,
  "message": "Generating TTS for dialogue turn 5/8...",
  "started_at": "2024-01-16T15:00:00Z",
  "updated_at": "2024-01-16T15:01:30Z"
}
```

#### Progress Messages by Task Type

Different tasks report different progress messages:

**Document Processing:**
- "Downloading file from storage..." (0-10%)
- "Parsing PDF content..." (10-30%)
- "Chunking text into segments..." (30-50%)
- "Generating embeddings..." (50-80%)
- "Indexing chunks in vector database..." (80-100%)

**Podcast Generation:**
- "Generating podcast script..." (0-20%)
- "Creating TTS audio for dialogue turn 1/10..." (20-80%)
- "Creating TTS audio for dialogue turn 2/10..." (continuing)
- "Concatenating audio segments..." (80-95%)
- "Uploading final audio to storage..." (95-100%)

**Quiz Generation:**
- "Analyzing document content..." (0-30%)
- "Generating quiz questions..." (30-70%)
- "Validating question format..." (70-90%)
- "Finalizing quiz structure..." (90-100%)

**Flashcard Generation:**
- "Extracting key concepts..." (0-40%)
- "Generating flashcard pairs..." (40-80%)
- "Organizing into deck..." (80-100%)

**Mindmap Generation:**
- "Identifying main topics..." (0-30%)
- "Building hierarchical structure..." (30-70%)
- "Creating node relationships..." (70-100%)

#### Errors

- **403 Forbidden**: Access denied
- **404 Not Found**: No progress information available

---

### `POST /api/v1/tasks/{job_id}/cancel`

Request cancellation of a background task.

**Authentication:** Required

#### Path Parameters

- `job_id` (integer): Job ID

#### Response (200 OK)

```json
{
  "message": "Cancellation requested. Task will abort at next checkpoint.",
  "job_id": 12345
}
```

**Note:** Cancellation is **cooperative**. The worker will check the abort flag and stop at the next safe point.

#### Errors

- **404 Not Found**: Task doesn't exist or already completed
- **403 Forbidden**: Access denied

---

## Error Responses

All errors follow a consistent JSON format:

```json
{
  "detail": "Descriptive error message explaining what went wrong"
}
```

### HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| **200** | OK | Request succeeded |
| **201** | Created | Resource created successfully |
| **204** | No Content | Request succeeded, no content to return |
| **400** | Bad Request | Invalid request data or parameters |
| **401** | Unauthorized | Missing or invalid authentication token |
| **403** | Forbidden | Authenticated but not authorized (e.g., accessing another user's resource) |
| **404** | Not Found | Resource not found |
| **413** | Payload Too Large | File exceeds maximum size (default: 100MB) |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error (logged for debugging) |
| **503** | Service Unavailable | Health check failed, service temporarily unavailable |

### Common Error Examples

**401 Unauthorized**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden**
```json
{
  "detail": "Notebook not found or access denied"
}
```

**404 Not Found**
```json
{
  "detail": "Document not found"
}
```

**429 Rate Limit Exceeded**
```json
{
  "error": "Rate limit exceeded",
  "detail": "20 per 1 minute"
}
```

---

## Interactive Documentation

FastAPI automatically generates **interactive API documentation** with built-in testing capabilities:

### Swagger UI (Recommended)

**URL:** `http://localhost:8000/docs`

Features:
- Try out endpoints directly in the browser
- View request/response schemas
- Authentication support (click "Authorize" button)
- Example values for all models

### ReDoc

**URL:** `http://localhost:8000/redoc`

Features:
- Clean, documentation-focused interface
- Printable format
- Search functionality
- Code samples in multiple languages

### OpenAPI Schema

**URL:** `http://localhost:8000/openapi.json`

Raw OpenAPI 3.0 specification for:
- Code generation (using tools like `openapi-generator`)
- API client libraries
- Integration with API gateways

---

## Best Practices

### 1. **Always Include Authorization Header**
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8000/api/v1/notebooks
```

### 2. **Handle Rate Limits Gracefully**
```python
import time

response = requests.get(url, headers=headers)
if response.status_code == 429:
    retry_after = int(response.headers.get("Retry-After", 60))
    time.sleep(retry_after)
    response = requests.get(url, headers=headers)  # Retry
```

### 3. **Use Async Mode for Long Tasks**
```python
# Start generation
response = requests.post(
    f"{base_url}/generation/{notebook_id}/generate",
    json={"content_type": "podcast"},
    params={"async_mode": True}
)
task_id = response.json()["task_id"]

# Poll for completion
while True:
    status = requests.get(f"{base_url}/tasks/{task_id}")
    if status.json()["status"] in ["succeeded", "failed"]:
        break
    time.sleep(5)
```

### 4. **Stream Chat Responses for Better UX**
```python
response = requests.post(
    f"{base_url}/chat/{notebook_id}/message",
    json={"message": "Summarize this", "stream": True},
    stream=True
)

for line in response.iter_lines():
    if line:
        token = line.decode('utf-8').replace('data: ', '')
        print(token, end='', flush=True)
```

### 5. **Monitor Health Checks**
```bash
# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /api/v1/health/liveness
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

# Readiness probe
readinessProbe:
  httpGet:
    path: /api/v1/health/readiness
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Versioning

The API uses **URL path versioning**: `/api/v1`

Future versions will use `/api/v2`, etc. This allows:
- Gradual migration
- Backward compatibility
- Clear deprecation paths

---

## Support

- **Issues**: Report bugs on GitHub Issues
- **Documentation**: Check [backend/docs/](../README.md)
- **OpenAPI Spec**: `http://localhost:8000/openapi.json`

---

**Last Updated:** 2026-01-17  
**API Version:** 1.0.0