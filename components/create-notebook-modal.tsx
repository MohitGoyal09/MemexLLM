"use client"

import { useState } from "react"
import { X, Upload, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"
import { useRouter } from "next/navigation"
import { notebooksApi } from "@/lib/api"

interface CreateNotebookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateNotebookModal({ open, onOpenChange }: CreateNotebookModalProps) {
  const [title, setTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  if (!open) return null

  const handleCreate = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const notebook = await notebooksApi.create({ 
        title: title.trim() || "Untitled notebook" 
      })
      onOpenChange(false)
      router.push(`/notebook/${notebook.id}`)
    } catch (err) {
      console.error("Failed to create notebook:", err)
      setIsCreating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-notebook-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <SynapseLogo className="w-8 h-8" aria-hidden="true" />
            <span id="create-notebook-title" className="text-xl font-semibold">Create New Notebook</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="notebook-title" className="block text-sm font-medium mb-2">Notebook Title</label>
            <input
              id="notebook-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your notebook"
              className="w-full px-4 py-3 bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm">Start with sources to get AI-powered insights, summaries, and more.</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2 rounded-full bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 gap-2 rounded-full" 
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isCreating ? "Creating..." : "Create & Add Sources"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
