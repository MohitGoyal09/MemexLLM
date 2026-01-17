"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { NotebookCard } from "@/components/notebook-card"
import { NotebookListItem } from "@/components/notebook-list-item"
import { Plus, LayoutGrid, List, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

const featuredNotebooks = [
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
]

const recentNotebooks = [
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
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const router = useRouter()

  const handleCreateNew = () => {
    router.push("/notebook/new")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs and Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "my"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              My notebooks
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "featured"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              Featured notebooks
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 flex items-center gap-1 ${
                  viewMode === "list" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {viewMode === "list" && <Check className="w-3 h-3" />}
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              Most recent
              <ChevronRight className="w-4 h-4 rotate-90" />
            </Button>

            <Button
              onClick={handleCreateNew}
              className="gap-2 rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="w-4 h-4" />
              Create new
            </Button>
          </div>
        </div>

        {/* Featured Notebooks */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Featured notebooks</h2>

          <div
            className={`transition-all duration-300 ease-in-out ${viewMode === "grid" ? "opacity-100" : "opacity-100"}`}
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {featuredNotebooks.map((notebook) => (
                  <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                    <NotebookCard notebook={notebook} variant="featured" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden animate-in fade-in duration-300">
                {/* List Header */}
                <div className="grid grid-cols-[1fr_120px_140px_80px_60px] items-center gap-4 px-4 py-3 border-b border-border text-sm text-muted-foreground font-medium">
                  <span>Title</span>
                  <span>Sources</span>
                  <span>Created</span>
                  <span className="text-center">Public</span>
                  <span className="text-right">Role</span>
                </div>
                {/* List Items */}
                <div className="divide-y divide-border/50">
                  {featuredNotebooks.map((notebook) => (
                    <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                      <NotebookListItem notebook={notebook} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Recent Notebooks */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Recent notebooks</h2>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {recentNotebooks.map((notebook) => (
                <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                  <NotebookCard notebook={notebook} variant="recent" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden animate-in fade-in duration-300">
              {/* List Header */}
              <div className="grid grid-cols-[1fr_120px_140px_80px_60px] items-center gap-4 px-4 py-3 border-b border-border text-sm text-muted-foreground font-medium">
                <span>Title</span>
                <span>Sources</span>
                <span>Created</span>
                <span className="text-center">Public</span>
                <span className="text-right">Role</span>
              </div>
              {/* List Items */}
              <div className="divide-y divide-border/50">
                {recentNotebooks.map((notebook) => (
                  <Link href={`/notebook/${notebook.id}`} key={notebook.id}>
                    <NotebookListItem notebook={notebook} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
