"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { NotebookCard } from "@/components/notebook-card"
import { NotebookListItem } from "@/components/notebook-list-item"
import { Plus, LayoutGrid, List, Loader2 } from "lucide-react"
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
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Subtle gradient mesh background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 10% 20%, oklch(0.65 0.17 68 / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 90% 80%, oklch(0.55 0.11 185 / 0.06) 0%, transparent 50%)
          `
        }}
      />
      
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Controls */}
        <div className="flex items-center justify-end gap-4 mb-8 ">
           

           <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border/50">
             <button
               onClick={() => setViewMode("grid")}
               className={`p-1.5 rounded-md transition-all duration-200 ${
                 viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
               }`}
             >
               <LayoutGrid className="w-4 h-4" />
             </button>
             <button
               onClick={() => setViewMode("list")}
               className={`p-1.5 rounded-md transition-all duration-200 ${
                 viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
               }`}
             >
               <List className="w-4 h-4" />
             </button>
           </div>
            
           <Button
             onClick={handleCreateNew}
             disabled={isCreating}
             className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium h-9 text-xs px-4 cursor-pointer"
           >
             {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
             {isCreating ? "Creating..." : "Create new"}
           </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {allNotebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 glow-subtle">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-3">No notebooks yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">Create your first notebook to start transforming your documents into insights</p>
            <Button onClick={handleCreateNew} disabled={isCreating} className="gap-2 rounded-full px-6 h-11 text-base hover:shadow-primary">
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {isCreating ? "Creating..." : "Create your first notebook"}
            </Button>
          </div>
        ) : (
          <div className="space-y-12 animate-fade-up">
            {/* Recent Notebooks Section - Only in Grid View */}
            {viewMode === "grid" && recentNotebooks.length > 0 && (
              <section>
                <h2 className="text-xl font-display font-semibold mb-6">Recent notebooks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {recentNotebooks.map((notebook) => (
                      <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                        <NotebookCard notebook={notebook} variant="recent" onUpdate={handleNotebookUpdate} />
                      </Link>
                   ))}
                </div>
              </section>
            )}

            {/* My Notebooks (All) Section */}
            <section>
              <h2 className="text-xl font-semibold mb-6">My notebooks</h2>
              
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Create New Card */}
                   <div 
                      onClick={handleCreateNew}
                      className={`h-full min-h-[200px] rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-primary/50 hover:bg-zinc-900 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group ${isCreating ? 'opacity-50 pointer-events-none' : ''}`}
                   >
                      <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300 shadow-sm">
                         {isCreating ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Plus className="w-7 h-7 text-primary" />}
                      </div>
                      <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">{isCreating ? "Creating notebook..." : "Create new notebook"}</span>
                   </div>

                  {/* All Notebooks */}
                  {allNotebooks.map((notebook) => (
                    <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                      <NotebookCard notebook={notebook} onUpdate={handleNotebookUpdate} />
                    </Link>
                  ))}
                </div>
              ) : (
                 <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-[1fr_120px_140px_40px] items-center gap-4 px-6 py-3 border-b border-border/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Title</span>
                    <span>Sources</span>
                    <span>Created</span>
                    <span className="sr-only">Actions</span>
                  </div>
                  <div className="divide-y divide-border/50">
                    {allNotebooks.map((notebook) => (
                      <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
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
