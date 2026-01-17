import { Globe } from "lucide-react"
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
  return (
    <div className="grid grid-cols-[1fr_120px_140px_80px_60px] items-center gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors rounded-lg group cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <SynapseLogo className="w-5 h-5 shrink-0" />
        <span className="truncate text-sm">{notebook.title}</span>
      </div>
      <span className="text-sm text-muted-foreground">{notebook.sources} Sources</span>
      <span className="text-sm text-muted-foreground">{notebook.date}</span>
      <div className="flex justify-center">
        {notebook.isPublic && <Globe className="w-4 h-4 text-muted-foreground" />}
      </div>
      <span className="text-sm text-muted-foreground text-right">Reader</span>
    </div>
  )
}
