"use client"

import { useState, useEffect } from "react"
import { Plus, Share2, Settings, Grid3X3, User, TrendingUp, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"
import { LogoutButton } from "@/components/logout-button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { notebooksApi } from "@/lib/api"

interface NotebookHeaderProps {
  title: string
  notebookId?: string
  isNew?: boolean
  onOpenSettings?: () => void
  onTitleChange?: (newTitle: string) => void
}

export function NotebookHeader({ title, notebookId, isNew, onOpenSettings, onTitleChange }: NotebookHeaderProps) {
  const router = useRouter()
  const [notebookTitle, setNotebookTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync title when prop changes
  useEffect(() => {
    setNotebookTitle(title)
  }, [title])

  const handleCreateNotebook = async () => {
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

  const saveTitle = async () => {
    setIsEditing(false)
    
    // Only save if title changed and we have a notebookId
    if (notebookTitle !== title && notebookId && notebookTitle.trim()) {
      setIsSaving(true)
      try {
        await notebooksApi.update(notebookId, { title: notebookTitle.trim() })
        onTitleChange?.(notebookTitle.trim())
      } catch (err) {
        console.error("Failed to save title:", err)
        // Revert on error
        setNotebookTitle(title)
      } finally {
        setIsSaving(false)
      }
    } else if (!notebookTitle.trim()) {
      // Revert empty title
      setNotebookTitle(title)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveTitle()
    } else if (e.key === "Escape") {
      setNotebookTitle(title)
      setIsEditing(false)
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <SynapseLogo className="w-8 h-8" />
        </Link>
        {isEditing ? (
          <input
            type="text"
            value={notebookTitle}
            onChange={(e) => setNotebookTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={handleKeyDown}
            className="text-lg font-medium bg-secondary px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-primary max-w-md"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => !isNew && setIsEditing(true)}
            className={`text-lg font-medium truncate max-w-md px-2 py-1 rounded-lg transition-colors ${
              isNew ? "" : "cursor-pointer hover:bg-secondary/50"
            } ${isSaving ? "opacity-50" : ""}`}
          >
            {notebookTitle}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button 
          onClick={handleCreateNotebook}
          disabled={isCreating}
          className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isCreating ? "Creating..." : "Create notebook"}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => onOpenSettings?.()} 
          className="gap-2 rounded-full bg-transparent"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
       
        <LogoutButton variant="ghost" size="icon" className="rounded-full" />
        <button className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </button>
      </div>
    </header>
  )
}

