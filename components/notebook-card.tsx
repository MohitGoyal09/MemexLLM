import { Globe } from "lucide-react"
import { SynapseLogo } from "./synapse-logo"

interface NotebookCardProps {
  notebook: {
    id: string
    title: string
    category: string
    
    date: string
    sources: number
    isPublic: boolean
  }
  variant: "featured" | "recent"
}

export function NotebookCard({ notebook, variant }: NotebookCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer">
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={  "/placeholder.svg"}
          alt={notebook.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <SynapseLogo className="w-6 h-6" />
          <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded-full">
            {notebook.category}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{notebook.title}</h3>
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>
              {notebook.date} • {notebook.sources} sources
            </span>
            {notebook.isPublic && <Globe className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </div>
  )
}
