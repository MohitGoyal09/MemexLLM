"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { NotebookCard } from "@/components/notebook-card"
import { NotebookListItem } from "@/components/notebook-list-item"
import { Plus, LayoutGrid, List, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"



const allNotebooks = [
  {
    id: "1",
    title: "William Shakespeare: The complete plays",
    category: "Arts and culture",
    date: "26 Apr 2025",
    sources: 45,
    isPublic: true,
  },
  {
    id: "2",
    title: "The World Ahead 2025",
    category: "The Economist",
    date: "7 Jul 2025",
    sources: 70,
    isPublic: true,
  },
  {
    id: "3",
    title: "Globalisation since 1997",
    category: "The Economist",
    date: "4 Nov 2025",
    sources: 26,
    isPublic: true,
  },
  {
    id: "4",
    title: "Machine Learning Fundamentals",
    category: "Technology",
    date: "15 Jan 2026",
    sources: 12,
    isPublic: false,
  },
  {
    id: "5",
    title: "Climate Change Research",
    category: "Science",
    date: "10 Jan 2026",
    sources: 34,
    isPublic: false,
  },
  {
    id: "6",
    title: "Product Strategy 2026",
    category: "Business",
    date: "8 Jan 2026",
    sources: 18,
    isPublic: false,
  },
  {
    id: "7",
    title: "Transformer Multiview Fusion",
    category: "AI Research",
    date: "Dec 13, 2025",
    sources: 5,
    isPublic: false,
  },
  {
    id: "8",
    title: "Comprehensive Guide to Data",
    category: "Data Science",
    date: "Jan 18, 2026",
    sources: 8,
    isPublic: false,
  }
]

export default function HomePage() {
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  const handleCreateNew = () => {
    router.push("/notebook/new")
  }

  // Get 3 most active/recent notebooks
  const recentNotebooks = allNotebooks.slice(0, 3)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Controls */}
        {/* Header Controls */}
        <div className="flex items-center justify-end gap-4 mb-8">
           <div className="text-sm text-muted-foreground font-medium mr-auto">
              Most recent
           </div>

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
             className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium h-9 text-xs px-4"
           >
             <Plus className="w-3.5 h-3.5" />
             Create new
           </Button>
        </div>

        <div className="space-y-12">
          {/* Recent Notebooks Section */}
          <section>
            <h2 className="text-xl font-semibold mb-6">Recent notebooks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {recentNotebooks.map((notebook) => (
                  <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                    <NotebookCard notebook={notebook} variant="recent" />
                  </Link>
               ))}
            </div>
          </section>

          {/* My Notebooks (All) Section */}
          <section>
            <h2 className="text-xl font-semibold mb-6">My notebooks</h2>
            
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card */}
                 <div 
                    onClick={handleCreateNew}
                    className="h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group"
                 >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                       <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Create new notebook</span>
                 </div>

                {/* All Notebooks */}
                {allNotebooks.map((notebook) => (
                  <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                    <NotebookCard notebook={notebook} />
                  </Link>
                ))}
              </div>
            ) : (
               <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_140px_80px_60px] items-center gap-4 px-4 py-3 border-b border-border text-sm text-muted-foreground font-medium">
                  <span>Title</span>
                  <span>Sources</span>
                  <span>Created</span>
                  <span className="text-center">Public</span>
                  <span className="text-right">Action</span>
                </div>
                <div className="divide-y divide-border/50">
                   {/* We might strictly strictly normally not show the big 'Create NB' card in list view, or just a row */}
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
      </main>
    </div>
  )
}
