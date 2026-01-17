"use client"

import { useState } from "react"
import { Plus, Share2, Settings, Grid3X3, User, TrendingUp, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"
import Link from "next/link"

interface NotebookHeaderProps {
  title: string
  isNew?: boolean
  onOpenSettings?: () => void
}

export function NotebookHeader({ title, isNew, onOpenSettings }: NotebookHeaderProps) {
  const [notebookTitle, setNotebookTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)

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
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            className="text-lg font-medium bg-secondary px-3 py-1 rounded-lg outline-none focus:ring-2 focus:ring-primary max-w-md"
            autoFocus
          />
        ) : (
          <h1
            onClick={() => setIsEditing(true)}
            className="text-lg font-medium truncate max-w-md cursor-pointer hover:bg-secondary/50 px-2 py-1 rounded-lg transition-colors"
          >
            {notebookTitle}
          </h1>
        )}
        {/* {!isNew && (
          <Button variant="ghost" size="sm" className="gap-1 text-xs rounded-full bg-secondary">
            <Globe className="w-3 h-3" />
            Public
          </Button>
        )} */}
      </div>

      <div className="flex items-center gap-2">
        <Button className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Create notebook
        </Button>
        {/* {!isNew && (
          <Button variant="outline" className="gap-2 rounded-full bg-transparent">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </Button>
        )}
        <Button variant="outline" className="gap-2 rounded-full bg-transparent">
          <Share2 className="w-4 h-4" />
          Share
        </Button> */}
        <Button variant="outline" onClick={onOpenSettings} className="gap-2 rounded-full bg-transparent">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
       
        <button className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </button>
      </div>
    </header>
  )
}
