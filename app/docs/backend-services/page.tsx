import { Badge } from "@/components/ui/badge"

export default function BackendServicesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Architecture</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Backend Services</h1>
        <p className="text-xl text-muted-foreground">
          Deep dive into the backend service architecture and key components.
        </p>
      </div>

      {/* Service Architecture */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Service Layer Architecture</h2>
        <p className="text-muted-foreground">
          The backend follows a layered architecture pattern separating concerns between
          API routes, business logic, and data access.
        </p>
        <div className="p-4 rounded-lg border bg-muted/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium">API Layer</div>
            <div className="flex-1 text-sm text-muted-foreground">FastAPI routers handle HTTP requests</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium">Services</div>
            <div className="flex-1 text-sm text-muted-foreground">Business logic and orchestration</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium">Repositories</div>
            <div className="flex-1 text-sm text-muted-foreground">Data access abstraction</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium">Database</div>
            <div className="flex-1 text-sm text-muted-foreground">PostgreSQL + Qdrant</div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Core Services</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">ChatService</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Handles chat conversations and RAG-powered responses.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Streaming and non-streaming responses</li>
              <li>Automatic citation extraction</li>
              <li>Context-aware suggestions</li>
              <li>Chat history management</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">GenerationService</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Orchestrates AI content generation.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Podcast generation with TTS</li>
              <li>Quiz and flashcard generation</li>
              <li>Mind map creation</li>
              <li>Background task management</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">QueryEngineService</h3>
            <p className="text-sm text-muted-foreground mb-3">
              RAG query execution using LlamaIndex.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Hybrid search (semantic + keyword)</li>
              <li>Query fusion for better retrieval</li>
              <li>HyDE for improved relevance</li>
              <li>Cohere reranking</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">StorageService</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Abstracts file storage operations.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Streaming uploads (memory-safe)</li>
              <li>Supabase Storage integration</li>
              <li>Signed URLs for private files</li>
              <li>Public CDN for generated content</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">IngestionPipeline</h3>
            <p className="text-sm text-muted-foreground mb-3">
              End-to-end document processing.
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Document parsing (PDF, DOCX, TXT)</li>
              <li>Audio transcription</li>
              <li>Web content extraction</li>
              <li>YouTube transcript ingestion</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Task Queue */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Background Processing</h2>
        <p className="text-muted-foreground">
          Uses Procrastinate for PostgreSQL-based task queuing.
        </p>
        <div className="p-4 rounded-lg border bg-muted/50">
          <ul className="list-disc list-inside text-sm space-y-2">
            <li>Document processing tasks</li>
            <li>Content generation tasks</li>
            <li>Priority queues (CRITICAL, HIGH, STANDARD)</li>
            <li>Embedded or standalone worker modes</li>
          </ul>
        </div>
      </section>

      {/* Next Steps */}
      <div className="flex gap-4 pt-4">
        <a href="/docs/database" className="text-primary hover:underline">
          Next: Database Schema →
        </a>
      </div>
    </div>
  )
}
