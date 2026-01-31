import { Globe, Book, Bot, MoreVertical, Trash2, Pencil, Loader2 } from "lucide-react"
import { SynapseLogo } from "./synapse-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { notebooksApi } from "@/lib/api"
import { Notebook } from "@/lib/api/types"

interface NotebookCardProps {
  notebook: {
    id: string
    title: string
    category: string
    date: string
    sources: number
    isPublic: boolean
  }
  variant?: "featured" | "recent"
  onUpdate?: (id: string, newTitle: string) => void
}

export function NotebookCard({ notebook, variant, onUpdate }: NotebookCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(notebook.title)
  const [isSaving, setIsSaving] = useState(false)

  // Brand-aligned gradients using design system tokens
  const gradients = [
    "bg-gradient-to-br from-[oklch(0.65_0.17_68/0.2)] via-[var(--neural-950)] to-[var(--neural-950)] border-[oklch(0.65_0.17_68/0.3)] hover:border-[oklch(0.65_0.17_68/0.5)] hover:shadow-primary",
    "bg-gradient-to-br from-[oklch(0.55_0.11_185/0.2)] via-[var(--neural-950)] to-[var(--neural-950)] border-[oklch(0.55_0.11_185/0.3)] hover:border-[oklch(0.55_0.11_185/0.5)] hover:shadow-md",
    "bg-gradient-to-br from-[oklch(0.55_0.14_145/0.2)] via-[var(--neural-950)] to-[var(--neural-950)] border-[oklch(0.55_0.14_145/0.3)] hover:border-[oklch(0.55_0.14_145/0.5)] hover:shadow-md", 
    "bg-gradient-to-br from-[oklch(0.62_0.16_25/0.2)] via-[var(--neural-950)] to-[var(--neural-950)] border-[oklch(0.62_0.16_25/0.3)] hover:border-[oklch(0.62_0.16_25/0.5)] hover:shadow-md",
  ]
  const colorIndex = notebook.id.charCodeAt(0) % gradients.length
  const cardStyle = gradients[colorIndex]

  // Curated emojis for notebook covers
  const emojis = ["📓", "🤖", "🚀", "💡", "🔮", "🧬", "🧠", "📈", "🎨", "🔬", "💼", "📚", "📡", "🧩", "🔥", "✨"]
  const emojiIndex = notebook.id.charCodeAt(0) % emojis.length
  const Emoji = emojis[emojiIndex]

  const handleSave = async (e: React.MouseEvent | React.FocusEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (title.trim() === notebook.title) {
        setIsEditing(false)
        return
    }

    setIsSaving(true)
    try {
        await notebooksApi.update(notebook.id, { title: title.trim() })
        setIsEditing(false)
        onUpdate?.(notebook.id, title.trim())
    } catch (error) {
        console.error("Failed to update title", error)
        setTitle(notebook.title) // Revert
    } finally {
        setIsSaving(false)
    }
  }

  return (
    <article className={`group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 cursor-pointer h-full min-h-[200px] shadow-sm hover:shadow-md hover:-translate-y-1 ${cardStyle}`} aria-labelledby={`notebook-title-${notebook.id}`}>

      {/* Cover Icon Area */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
          <span className="text-2xl">{Emoji}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
                className="text-muted-foreground/60 hover:text-foreground p-1.5 rounded-full hover:bg-background/40 transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => e.preventDefault()} // Prevent link click
                aria-label={`Options for ${notebook.title}`}
            >
              <MoreVertical className="w-5 h-5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-xl dropdown-content rounded-xl border-border/60">
            <DropdownMenuItem onClick={(e) => { 
                e.preventDefault()
                e.stopPropagation()
                setIsEditing(true) 
            }} className="py-2.5 cursor-pointer">
              <Pencil className="w-4 h-4 mr-2 text-muted-foreground" />
              Edit title
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive py-2.5 cursor-pointer" onClick={(e) => { e.preventDefault(); /* handle delete */ }}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 mt-auto relative z-10">
        {isEditing ? (
            <div className="relative">
                <input
                    type="text"
                    value={title}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === "Enter" && handleSave(e)}
                    className="w-full bg-background/50 border border-primary/50 rounded-lg px-2 py-1 text-xl font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                />
                {isSaving && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                )}
            </div>
        ) : (
            <h3 id={`notebook-title-${notebook.id}`} className="text-xl font-bold text-foreground line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
            {notebook.title}
            </h3>
        )}

        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground/80">
          <time dateTime={notebook.date}>{notebook.date}</time>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" aria-hidden="true" />
          <span>{notebook.sources} sources</span>
          {notebook.isPublic && (
             <Globe className="w-3.5 h-3.5 ml-auto text-muted-foreground/60" aria-label="Public notebook" />
          )}
        </div>
      </div>
    </article>
  )
}
