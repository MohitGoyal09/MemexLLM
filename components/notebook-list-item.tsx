import { Globe, MoreVertical } from "lucide-react"
import { SynapseLogo } from "./synapse-logo"

interface NotebookListItemProps {
  notebook: {
    id: string
    title: string
    category: string
    date: string
    sources: number
    isPublic: boolean
  }
}

export function NotebookListItem({ notebook }: NotebookListItemProps) {
  // Deterministic emoji
  const emojis = ["📓", "🤖", "🚀", "💡", "🔮", "🧬", "🧠", "📈", "🎨", "🔬", "💼", "📚", "📡", "🧩", "🔥", "✨"]
  const emojiIndex = notebook.id.charCodeAt(0) % emojis.length
  const Emoji = emojis[emojiIndex]

  return (
    <div className="grid grid-cols-[1fr_120px_140px_40px] items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-primary/50">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-lg shadow-sm border border-border/50">
          {Emoji}
        </div>
        <span className="truncate text-sm font-medium text-foreground">{notebook.title}</span>
      </div>
      <span className="text-xs text-muted-foreground">{notebook.sources} sources</span>
      <span className="text-xs text-muted-foreground">{notebook.date}</span>
      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-foreground">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
