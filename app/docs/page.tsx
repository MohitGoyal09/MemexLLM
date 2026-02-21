import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  FileText,
  Layers,
  MessageSquare,
  Mic,
  Brain,
  Sparkles,
} from "lucide-react"

export default function DocsPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <Badge variant="secondary" className="mb-2">
          Documentation v1.0
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to NotebookLLM
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          A powerful AI-powered notebook that transforms your documents into interactive learning experiences.
          Generate podcasts, quizzes, flashcards, and more from your PDFs, videos, and web content.
        </p>
        <div className="flex gap-3 pt-4">
          <Link href="/docs/quick-start">
            <Button className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/docs/architecture">
            <Button variant="outline">Learn Architecture</Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <FeatureCard
          icon={FileText}
          title="Document Processing"
          description="Upload PDFs, DOCX, TXT, and more. Automatic text extraction and chunking for optimal retrieval."
        />
        <FeatureCard
          icon={MessageSquare}
          title="RAG-Powered Chat"
          description="Ask questions about your documents with citations. Hybrid search with semantic and keyword retrieval."
        />
        <FeatureCard
          icon={Mic}
          title="Podcast Generation"
          description="Transform documents into engaging podcast scripts with AI-generated dialogue between hosts."
        />
        <FeatureCard
          icon={Brain}
          title="Quiz & Flashcards"
          description="Automatically generate quizzes and flashcards for effective learning and retention."
        />
        <FeatureCard
          icon={Layers}
          title="Mind Maps"
          description="Visual concept maps automatically generated from your study materials."
        />
        <FeatureCard
          icon={Sparkles}
          title="Smart Suggestions"
          description="AI-powered question suggestions based on your document content."
        />
      </div>

      {/* Tech Stack */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Technology Stack</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <TechSection
            title="Backend"
            icon={Database}
            items={[
              "FastAPI - High-performance Python web framework",
              "PostgreSQL - Primary relational database",
              "Qdrant - Vector database for semantic search",
              "Supabase - Auth, Storage, and Database",
              "LlamaIndex - RAG framework",
              "Procrastinate - Background task queue",
            ]}
          />
          <TechSection
            title="Frontend"
            icon={Code2}
            items={[
              "Next.js 14 - React framework with App Router",
              "TypeScript - Type-safe JavaScript",
              "Tailwind CSS - Utility-first styling",
              "shadcn/ui - Beautiful, accessible components",
              "React Query - Server state management",
              "next-themes - Dark/light mode support",
            ]}
          />
          <TechSection
            title="AI/ML"
            icon={Brain}
            items={[
              "Google Gemini - Primary LLM",
              "Cohere - Reranking for better retrieval",
              "Sentence Transformers - Embeddings",
              "Kokoro TTS - Text-to-speech for podcasts",
              "Langfuse - LLM observability",
            ]}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Explore the Docs</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/docs/architecture"
            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5" />
              System Architecture
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Understand how the frontend, backend, and AI services work together.
            </p>
          </Link>
          <Link
            href="/docs/backend-services"
            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Backend Services
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Deep dive into RAG pipeline, content generation, and task processing.
            </p>
          </Link>
          <Link
            href="/docs/frontend-architecture"
            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Frontend Architecture
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Learn about the Next.js app structure, components, and hooks.
            </p>
          </Link>
          <Link
            href="/docs/configuration"
            className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors group"
          >
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Configuration Guide
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set up environment variables and configure your deployment.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function TechSection({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: string[]
}) {
  return (
    <div className="p-4 rounded-lg border">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
