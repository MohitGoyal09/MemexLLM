"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { NotebookCard } from "@/components/notebook-card"
import { NotebookListItem } from "@/components/notebook-list-item"
import { NeuralLoader } from "@/components/neural-loader"
import { Plus, LayoutGrid, List, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { notebooksApi } from "@/lib/api"
import type { Notebook } from "@/lib/api/types"

// Transform API notebook to display format
function transformNotebook(notebook: Notebook) {
  return {
    id: notebook.id,
    title: notebook.title,
    category: "Notebook",
    date: new Date(notebook.updated_at).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    sources: notebook.source_count ?? 0,
    isPublic: false,
  }
}

export default function HomePage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  useEffect(() => {
    const fetchNotebooks = async () => {
      try {
        setLoading(true)
        const data = await notebooksApi.list()
        setNotebooks(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch notebooks:", err)
        if (err instanceof Error && err.message.includes("authenticated")) {
          router.push("/auth/login")
          return
        }
        setError("Failed to load notebooks. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotebooks()
  }, [router])

  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNew = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const notebook = await notebooksApi.create({ title: "Untitled notebook" })
      router.push(`/notebook/${notebook.id}`)
    } catch (err) {
      console.error("Failed to create notebook:", err)
      setIsCreating(false)
    }
  }

  // Transform notebooks for display
  const allNotebooks = notebooks.map(transformNotebook)

  // Get 3 most recent notebooks
  const recentNotebooks = allNotebooks.slice(0, 3)

  // Handle notebook update (e.g. title rename)
  const handleNotebookUpdate = (id: string, newTitle: string) => {
    setNotebooks(prev => prev.map(n => n.id === id ? { ...n, title: newTitle } : n))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <NeuralLoader message="Loading your notebooks..." size="lg" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Gradient mesh background - subtle in light mode, more visible in dark */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-100"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 10% 20%, oklch(0.65 0.17 68 / 0.10) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 90% 80%, oklch(0.55 0.11 185 / 0.06) 0%, transparent 50%)
          `
        }}
      />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
           <h2 className="text-2xl font-semibold">My Notebooks</h2>
           <div className="flex items-center bg-surface-2 rounded-lg p-1 border border-border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === "grid" ? "bg-surface-4 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === "list" ? "bg-surface-4 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
            {/* Create New Card - Always First */}
            <div
              onClick={handleCreateNew}
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-border hover:border-primary/50 bg-transparent hover:bg-card/50 rounded-xl flex flex-col items-center justify-center p-8 min-h-[220px] group ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                {isCreating ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Plus className="w-6 h-6 text-primary" />}
              </div>
              <p className="font-medium text-foreground">Create New Notebook</p>
              <p className="text-xs text-muted-foreground mt-1">Start a new knowledge workspace</p>
            </div>

            {/* Notebook Cards */}
            {allNotebooks.map((notebook, index) => (
              <Link
                href={`/notebook/${notebook.id}`}
                key={notebook.id}
                className="animate-diagonal-slide-in hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NotebookCard notebook={notebook} onUpdate={handleNotebookUpdate} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-surface-2 rounded-xl border border-border overflow-hidden shadow-sm animate-fade-up">
            <div className="grid grid-cols-[1fr_120px_140px_40px] items-center gap-4 px-6 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Title</span>
              <span>Sources</span>
              <span>Created</span>
              <span className="sr-only">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {allNotebooks.map((notebook, index) => (
                <Link
                  href={`/notebook/${notebook.id}`}
                  key={notebook.id}
                  className="block animate-fade-up hover:bg-surface-3 transition-colors"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <NotebookListItem notebook={notebook} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
