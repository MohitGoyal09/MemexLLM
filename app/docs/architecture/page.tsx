import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Architecture</Badge>
        <h1 className="text-4xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-xl text-muted-foreground">
          Understanding how NotebookLLM's frontend, backend, and AI services work together.
        </p>
      </div>

      {/* Architecture Diagram */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">High-Level Architecture</h2>
        <div className="p-6 rounded-lg border bg-card">
          <div className="relative w-full aspect-video">
            <Image
              src="/architecture.png"
              alt="NotebookLLM System Architecture Diagram"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Technology Stack</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-3">Backend</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• FastAPI - Web framework</li>
              <li>• PostgreSQL - Database</li>
              <li>• Qdrant - Vector store</li>
              <li>• Supabase - Auth & Storage</li>
              <li>• LlamaIndex - RAG framework</li>
              <li>• Procrastinate - Task queue</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-3">Frontend</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Next.js 14 - React framework</li>
              <li>• TypeScript - Type safety</li>
              <li>• Tailwind CSS - Styling</li>
              <li>• shadcn/ui - Components</li>
              <li>• React Query - State</li>
              <li>• next-themes - Theming</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-semibold mb-3">AI/ML</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Google Gemini - LLM</li>
              <li>• Cohere - Reranking</li>
              <li>• Sentence Transformers</li>
              <li>• Kokoro TTS - Audio</li>
              <li>• Langfuse - Observability</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Flow</h2>
        
        <div className="space-y-6">
          <div className="p-4 rounded-lg border bg-muted/50">
            <h3 className="font-semibold mb-3">Document Ingestion Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>User uploads file via frontend</li>
              <li>File stored in Supabase (private bucket)</li>
              <li>Background worker processes document</li>
              <li>Text extracted, chunked, and embedded</li>
              <li>Vectors stored in Qdrant</li>
              <li>Document status updated to COMPLETED</li>
            </ol>
          </div>
          
          <div className="p-4 rounded-lg border bg-muted/50">
            <h3 className="font-semibold mb-3">Chat Query Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>User sends message via chat interface</li>
              <li>Backend retrieves relevant document chunks (hybrid search)</li>
              <li>Chunks reranked using Cohere</li>
              <li>LLM generates response with citations</li>
              <li>Response streamed to frontend</li>
              <li>Message and citations saved to database</li>
            </ol>
          </div>
          
          <div className="p-4 rounded-lg border bg-muted/50">
            <h3 className="font-semibold mb-3">Content Generation Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>User requests content (podcast/quiz/flashcards)</li>
              <li>LLM generates content using document context</li>
              <li>For podcasts: TTS converts script to audio</li>
              <li>Generated content stored in database</li>
              <li>Audio files uploaded to public bucket</li>
              <li>Content available in Studio panel</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Key Components */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Key Components</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">RAG Pipeline</h3>
            <p className="text-sm text-muted-foreground">
              Retrieval-Augmented Generation powered by LlamaIndex. Combines semantic and keyword search
              with reranking for accurate, cited responses.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Content Generation</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered generation of podcasts, quizzes, flashcards, and mind maps using
              structured outputs for reliable results.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Background Processing</h3>
            <p className="text-sm text-muted-foreground">
              Procrastinate-based task queue handles long-running operations like document
              processing and content generation.
            </p>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Supabase Auth with JWT validation. Users provisioned automatically on first login.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <div className="flex gap-4 pt-4">
        <a href="/docs/backend-services" className="text-primary hover:underline">
          Next: Backend Services →
        </a>
      </div>
    </div>
  )
}
