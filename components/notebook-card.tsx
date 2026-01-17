import { Globe, Book, Bot, MoreVertical, Trash2, Pencil } from "lucide-react"
import { SynapseLogo } from "./synapse-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
}

export function NotebookCard({ notebook, variant }: NotebookCardProps) {
  // Simple logic to pick a color based on ID or just random-ish
  const colors = [
    "bg-amber-900/20 hover:bg-amber-900/30",
    "bg-blue-900/20 hover:bg-blue-900/30", 
    "bg-emerald-900/20 hover:bg-emerald-900/30",
    "bg-slate-900/50 hover:bg-slate-900/60",
    "bg-purple-900/20 hover:bg-purple-900/30"
  ]
  const colorIndex = notebook.id.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  // Choose icon based on category or variant
  const Icon = notebook.category.includes("AI") ? Bot : Book

  return (
    <div className={`group relative flex flex-col justify-between p-5 rounded-xl border border-border transition-all cursor-pointer h-full min-h-[180px] ${bgColor}`}>
      
      {/* Top Section: Icon & Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-foreground/80" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-background/20">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={(e) => { e.preventDefault(); /* handle edit */ }}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit title
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.preventDefault(); /* handle delete */ }}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
          {notebook.title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span>{notebook.date}</span>
          <span>•</span>
          <span>{notebook.sources} sources</span>
          {notebook.isPublic && (
             <Globe className="w-3 h-3 ml-2" />
          )}
        </div>
      </div>
    </div>
  )
}
