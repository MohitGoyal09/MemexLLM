"use client"

import { useState, useEffect } from "react"
import { Plus, Share2, Settings, Grid3X3, User, TrendingUp, Globe, Loader2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { notebooksApi } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { authLogger } from "@/lib/auth-logger"
import { ThemeSwitcher } from "@/components/theme-switcher"

interface NotebookHeaderProps {
  title: string
  notebookId?: string
  isNew?: boolean
  onTitleChange?: (newTitle: string) => void
  onOpenSettings?: () => void
}

export function NotebookHeader({ title, notebookId, isNew, onTitleChange, onOpenSettings }: NotebookHeaderProps) {
  const router = useRouter()
  const [notebookTitle, setNotebookTitle] = useState(title)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
      }
    }
    fetchUser()
  }, [])

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

  const { toast } = require("sonner")

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-background border-b border-border/40">
      {/* Left side - Back button and project name */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/home")}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Back to notebooks"
        >
          <Loader2 className="w-4 h-4 rotate-180" style={{ display: 'none' }} /> 
          {/* Using Share2 as a placeholder for ArrowLeft if not imported, but wait, I should Import ArrowLeft */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </Button>

        <div className="flex items-center gap-2">
          {/* Folder Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-muted-foreground"
          >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13.65a2.35 2.35 0 0 0 2.35 2.35z" /> {/* FolderOpen-ish */}
            <path d="M2 10h20" />
          </svg>
          
          {isEditing ? (
            <input
              type="text"
              value={notebookTitle}
              onChange={(e) => setNotebookTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleKeyDown}
              className="text-lg font-semibold bg-transparent border-b border-primary/50 outline-none px-1 min-w-[200px] text-foreground"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => !isNew && setIsEditing(true)}
              className={`text-lg font-semibold text-foreground cursor-pointer hover:text-muted-foreground transition-colors ${isSaving ? "opacity-50" : ""}`}
              title="Click to rename"
            >
              {notebookTitle}
            </h1>
          )}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Memory Button (Placeholder) */}
        {/* <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Memory features coming soon!")}
          className="gap-2 bg-secondary/50 border-input hover:bg-secondary hidden sm:flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
          </svg>
          Memory
        </Button> */}

        {/* Notebook Settings Button */}
        {onOpenSettings && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="gap-2 bg-secondary/50 border-input hover:bg-secondary"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        )}

        {/* New Notebook Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateNotebook}
          disabled={isCreating}
          className="gap-2 bg-secondary/50 border-input hover:bg-secondary hidden md:flex"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Notebook
        </Button>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">My Account</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail || "Signed in"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                authLogger.logLogout(user?.id);
                await supabase.auth.signOut();
                router.push("/auth/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

