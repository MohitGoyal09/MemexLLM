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

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent">
      <div className="flex items-center gap-3">
        <Link href="/home" className="flex items-center gap-2">
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

       

        {onOpenSettings && (
          <Button variant="ghost" size="icon" onClick={onOpenSettings} className="rounded-full w-9 h-9">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        )}

        <ThemeSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-200 focus:outline-none border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 shadow-xl border-border">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">My Account</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail || "Signed in"}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive cursor-pointer py-2"
              onClick={async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                const userId = user?.id;
                authLogger.logLogout(userId);
                try {
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;
                  authLogger.logLogoutSuccess(userId);
                  router.push("/auth/login");
                } catch (error) {
                  console.error("Logout failed:", error);
                  router.push("/auth/login");
                }
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

