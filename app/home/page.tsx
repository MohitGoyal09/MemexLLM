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
      <div className="min-h-screen bg-black text-white">
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
    <div className="min-h-screen bg-black text-white relative">
      {/* Gradient mesh background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 10% 20%, oklch(0.65 0.17 68 / 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 90% 80%, oklch(0.55 0.11 185 / 0.08) 0%, transparent 50%)
          `
        }}
      />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* Header Controls */}
        <div className="flex items-center justify-end gap-4 mb-8 animate-fade-up">
          <div className="flex items-center bg-neutral-900/50 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === "grid" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                viewMode === "list" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleCreateNew}
            disabled={isCreating}
            className="gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-semibold h-9 text-xs px-4 cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isCreating ? "Creating..." : "Create new"}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {allNotebooks.length === 0 ? (
          /* Enhanced Empty State with Neural Maximalism */
          <div className="relative flex flex-col items-center justify-center h-[60vh] text-center animate-fade-up">
            {/* Neural network background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Animated icon with glow-pulse */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center mb-8 animate-lumina-pulse">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
              <Sparkles className="w-12 h-12 text-amber-400 relative z-10" />
            </div>

            {/* Gradient text headline */}
            <h2 className="text-3xl font-display font-bold mb-4 bg-gradient-to-r from-amber-400 via-white to-teal-400 bg-clip-text text-transparent">
              Your Research Command Center
            </h2>
            <p className="text-neutral-400 mb-10 max-w-md text-lg">
              Create your first notebook to start transforming documents into actionable insights with AI-powered analysis
            </p>

            {/* CTA button with glow */}
            <Button
              onClick={handleCreateNew}
              disabled={isCreating}
              className="relative gap-3 rounded-full px-8 h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105"
            >
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {isCreating ? "Creating..." : "Create your first notebook"}
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Recent Notebooks Section - Only in Grid View */}
            {viewMode === "grid" && recentNotebooks.length > 0 && (
              <section className="animate-fade-up">
                <h2 className="text-xl font-display font-semibold mb-6">Recent notebooks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentNotebooks.map((notebook, index) => (
                    <Link
                      href={`/notebook/${notebook.id}`}
                      key={notebook.id}
                      className="animate-diagonal-slide-in hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <NotebookCard notebook={notebook} variant="recent" onUpdate={handleNotebookUpdate} />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* My Notebooks (All) Section */}
            <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-semibold mb-6">My notebooks</h2>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Create New Card - Enhanced with Neural Maximalism */}
                  <div
                    onClick={handleCreateNew}
                    className={`relative h-full min-h-[200px] rounded-2xl bg-transparent border-2 border-dashed border-amber-500/30 hover:border-amber-500/50 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-transparent transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 group overflow-hidden ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {/* Radial glow on hover */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.7_0.17_68_/_0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 group-hover:bg-amber-500/20 transition-all duration-300 shadow-sm">
                      {isCreating ? <Loader2 className="w-6 h-6 text-amber-400 animate-spin" /> : <Plus className="w-7 h-7 text-amber-400" />}
                    </div>
                    <span className="relative font-semibold text-neutral-500 group-hover:text-amber-400 transition-colors">{isCreating ? "Creating notebook..." : "Create new notebook"}</span>
                  </div>

                  {/* All Notebooks with staggered animation */}
                  {allNotebooks.map((notebook, index) => (
                    <Link
                      href={`/notebook/${notebook.id}`}
                      key={notebook.id}
                      className="animate-diagonal-slide-in hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
                      style={{ animationDelay: `${(index + 1) * 50}ms` }}
                    >
                      <NotebookCard notebook={notebook} onUpdate={handleNotebookUpdate} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-950/50 rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="grid grid-cols-[1fr_120px_140px_40px] items-center gap-4 px-6 py-3 border-b border-neutral-800 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    <span>Title</span>
                    <span>Sources</span>
                    <span>Created</span>
                    <span className="sr-only">Actions</span>
                  </div>
                  <div className="divide-y divide-neutral-800/50">
                    {allNotebooks.map((notebook, index) => (
                      <Link
                        href={`/notebook/${notebook.id}`}
                        key={notebook.id}
                        className="block animate-fade-up hover:bg-neutral-900/50 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <NotebookListItem notebook={notebook} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
