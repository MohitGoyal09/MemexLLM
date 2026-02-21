import { Badge } from "@/components/ui/badge"

export default function DatabasePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Architecture</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Database Schema</h1>
        <p className="text-xl text-muted-foreground">
          Overview of the database models and relationships.
        </p>
      </div>

      {/* Database Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Database Overview</h2>
        <p className="text-muted-foreground">
          Uses SQLModel (Pydantic + SQLAlchemy) with PostgreSQL as the primary database
          and Qdrant for vector storage.
        </p>
      </section>

      {/* Core Models */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Core Models</h2>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">User</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Represents a user in the system. Users are provisioned automatically on first authentication.
            </p>
            <div className="text-sm">
              <strong>Fields:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>id (UUID) - Primary key</li>
                <li>email - Unique email address</li>
                <li>is_active - Account status</li>
                <li>created_at - Registration timestamp</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Notebook</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A container for documents, chat history, and generated content.
            </p>
            <div className="text-sm">
              <strong>Fields:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>id (UUID) - Primary key</li>
                <li>user_id (UUID) - Foreign key to User</li>
                <li>title - Notebook name</li>
                <li>settings (JSON) - RAG configuration</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Document</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Represents an uploaded file or external source.
            </p>
            <div className="text-sm">
              <strong>Fields:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>id (UUID) - Primary key</li>
                <li>notebook_id (UUID) - Foreign key to Notebook</li>
                <li>filename - Original file name</li>
                <li>status - PENDING, PROCESSING, COMPLETED, FAILED</li>
                <li>chunk_count - Number of text chunks</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">ChatMessage</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Individual messages in a notebook's chat history.
            </p>
            <div className="text-sm">
              <strong>Fields:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>id (UUID) - Primary key</li>
                <li>notebook_id (UUID) - Foreign key to Notebook</li>
                <li>role - USER or ASSISTANT</li>
                <li>content - Message text</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">GeneratedContent</h3>
            <p className="text-sm text-muted-foreground mb-3">
              AI-generated content like podcasts, quizzes, flashcards, and mind maps.
            </p>
            <div className="text-sm">
              <strong>Fields:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>id (UUID) - Primary key</li>
                <li>notebook_id (UUID) - Foreign key to Notebook</li>
                <li>content_type - PODCAST, QUIZ, FLASHCARD, MINDMAP</li>
                <li>status - Processing state</li>
                <li>content (JSON) - Generated content data</li>
                <li>audio_url - URL for generated audio</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Relationships */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Relationships</h2>
        <div className="p-4 rounded-lg border bg-muted/50">
          <ul className="list-disc list-inside text-sm space-y-2">
            <li>User → Notebooks (one-to-many)</li>
            <li>Notebook → Documents (one-to-many, cascade delete)</li>
            <li>Notebook → ChatMessages (one-to-many, cascade delete)</li>
            <li>Notebook → GeneratedContent (one-to-many, cascade delete)</li>
Document → Citations            <li> (one-to-many)</li>
            <li>ChatMessage → Citations (one-to-many)</li>
          </ul>
        </div>
      </section>

      {/* Vector Store */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Vector Store (Qdrant)</h2>
        <p className="text-muted-foreground">
          Qdrant stores document embeddings for semantic search. Each vector includes
          metadata for filtering by user_id, notebook_id, and document_id.
        </p>
      </section>

      <div className="flex gap-4 pt-4">
        <a href="/docs/api-layer" className="text-primary hover:underline">
          Next: API Layer →
        </a>
      </div>
    </div>
  )
}
