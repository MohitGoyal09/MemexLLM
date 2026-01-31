"use client"

import { useState, useEffect, useRef } from "react"

import {
  Plus,
  Search,
  Globe,
  Sparkles,
  ArrowRight,
  FileText,
  Check,
  PanelLeftClose,
  FileImage,
  FileVideo,
  FileAudio,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Source } from "@/lib/types"


interface SourcesPanelProps {
  sources: Source[]
  selectedSources: string[]
  onAddSource: () => void
  onToggleSource: (id: string) => void
  onSelectAll: () => void
  onCollapse: () => void
  onRefresh?: () => Promise<void> | void
  onDeleteSource?: (id: string) => Promise<void> | void
  highlightedSourceId?: string | null
}

const getSourceIcon = (type: Source["type"]) => {
  const iconMap = {
    pdf: { icon: FileText, bg: "bg-[var(--file-pdf)]/20", color: "text-[var(--file-pdf)]" },
    doc: { icon: FileText, bg: "bg-[var(--file-doc)]/20", color: "text-[var(--file-doc)]" },
    image: { icon: FileImage, bg: "bg-[var(--file-image)]/20", color: "text-[var(--file-image)]" },
    video: { icon: FileVideo, bg: "bg-[var(--file-video)]/20", color: "text-[var(--file-video)]" },
    audio: { icon: FileAudio, bg: "bg-[var(--file-audio)]/20", color: "text-[var(--file-audio)]" },
    link: { icon: Globe, bg: "bg-[var(--file-link)]/20", color: "text-[var(--file-link)]" },
    text: { icon: FileText, bg: "bg-[var(--file-text)]/20", color: "text-[var(--file-text)]" },
    file: { icon: FileText, bg: "bg-muted/50", color: "text-muted-foreground" },
  }
  return (iconMap as any)[type] || iconMap.text
}

const getStatusIndicator = (status: Source["status"]) => {
  switch (status) {
    case "pending":
    case "processing":
      return <Loader2 className="w-3 h-3 animate-spin text-warning" />
    case "completed":
      return <CheckCircle className="w-3 h-3 text-success" />
    case "failed":
      return <AlertCircle className="w-3 h-3 text-destructive" />
    default:
      return null
  }
}

export function SourcesPanel({
  sources,
  selectedSources,
  onAddSource,
  onToggleSource,
  onSelectAll,
  onCollapse,
  onRefresh,
  onDeleteSource,
  highlightedSourceId,
}: SourcesPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [highlightAnimation, setHighlightAnimation] = useState<string | null>(null)
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const sourceRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const completedSources = sources.filter((s) => s.status === "completed" || !s.status)
  const processingSources = sources.filter((s) => s.status === "pending" || s.status === "processing")

  const handleDeleteConfirm = async () => {
    if (!sourceToDelete || !onDeleteSource) return
    setIsDeleting(true)
    try {
      await onDeleteSource(sourceToDelete.id)
    } finally {
      setIsDeleting(false)
      setSourceToDelete(null)
    }
  }

  // Handle scroll-to and highlight when a source is clicked from citation
  useEffect(() => {
    if (highlightedSourceId) {
      const sourceElement = sourceRefs.current.get(highlightedSourceId)
      if (sourceElement) {
        // Scroll into view with smooth animation
        sourceElement.scrollIntoView({
          behavior: "smooth",
          block: "center"
        })

        // Trigger highlight animation
        setHighlightAnimation(highlightedSourceId)

        // Remove animation class after it completes
        const timeout = setTimeout(() => {
          setHighlightAnimation(null)
        }, 2000)

        return () => clearTimeout(timeout)
      }
    }
  }, [highlightedSourceId])

  const handleRefresh = async () => {
    if (!onRefresh) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-card flex flex-col shadow-sm border border-border/40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">Sources</h2>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="p-1 hover:bg-secondary rounded transition-colors group disabled:opacity-50"
              title="Refresh sources"
            >
              <RefreshCw className={cn("w-4 h-4 text-muted-foreground group-hover:text-foreground", isRefreshing && "animate-spin")} />
            </button>
          )}
          <button onClick={onCollapse} className="p-1 hover:bg-secondary rounded transition-colors">
            <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Add Sources Button */}
        <div className="p-4">
          <Button
            onClick={onAddSource}
            variant="outline"
            className="w-full justify-center gap-2 rounded-full border-dashed bg-transparent hover:bg-secondary"
          >
            <Plus className="w-4 h-4" />
            Add sources
          </Button>
        </div>

        {/* Deep Research CTA */}
        {/* <div className="mx-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">
                <span className="text-primary font-medium">Try Deep Research</span>{" "}
                <span className="text-muted-foreground">for an in-depth report and new sources!</span>
              </p>
            </div>
          </div> */}
        {/* </div> */}
{/* 
        Web Search
        <div className="p-4">
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search the web for new sources</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button variant="secondary" size="sm" className="gap-1.5 rounded-full text-xs">
              <Globe className="w-3.5 h-3.5" />
              Web
            </Button>
            <Button variant="secondary" size="sm" className="gap-1.5 rounded-full text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Fast Research
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full ml-auto w-8 h-8 bg-primary/20 hover:bg-primary/30"
            >
              <ArrowRight className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div> */}

        {/* Processing Banner */}
        {processingSources.length > 0 && (
          <div className="mx-4 mb-2 p-2 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-warning" />
              <span className="text-warning">
                Processing {processingSources.length} source{processingSources.length > 1 ? "s" : ""}...
              </span>
            </div>
          </div>
        )}

        {/* Select All */}
        <div className="px-4 py-2 border-t border-border">
          <button
            onClick={onSelectAll}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                selectedSources.length === sources.length && sources.length > 0
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30"
              }`}
            >
              {selectedSources.length === sources.length && sources.length > 0 && (
                <Check className="w-3 h-3 text-primary-foreground" />
              )}
            </div>
            Select all sources ({completedSources.length} ready)
          </button>
        </div>

        {/* Sources List */}
        <div className="px-4 py-2">
          {sources.length > 0 ? (
            <div className="space-y-1">
              {sources.map((source) => {
                const { icon: SourceIcon, bg, color } = getSourceIcon(source.type)
                const isProcessing = source.status === "pending" || source.status === "processing"
                const isFailed = source.status === "failed"

                return (
                  <div
                    key={source.id}
                    ref={(el) => {
                      if (el) sourceRefs.current.set(source.id, el)
                      else sourceRefs.current.delete(source.id)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-all text-left group",
                      isProcessing && "opacity-70",
                      isFailed && "opacity-50",
                      highlightAnimation === source.id && "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/10 animate-pulse"
                    )}
                  >
                    <button
                      onClick={() => onToggleSource(source.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left disabled:cursor-not-allowed"
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          selectedSources.includes(source.id) ? "bg-primary border-primary" : "border-muted-foreground/30"
                        }`}
                      >
                        {selectedSources.includes(source.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 ${
                            isProcessing ? "animate-pulse" : ""
                          }`}
                        >
                          <SourceIcon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{source.name}</span>
                          {source.preview ? (
                            <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {source.preview}
                            </span>
                          ) : source.chunkCount !== undefined && source.chunkCount > 0 ? (
                            <span className="text-xs text-muted-foreground">{source.chunkCount} chunks</span>
                          ) : null}
                          {source.errorMessage && (
                            <span className="text-xs text-destructive truncate block">{source.errorMessage}</span>
                          )}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getStatusIndicator(source.status)}
                      {onDeleteSource && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 rounded ml-1"
                            >
                              <MoreVertical className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setSourceToDelete(source)
                              }}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-2">Saved sources will appear here</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click Add source above to add PDFs, websites, text, videos or audio files. Or import a file directly from
                Google Drive.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!sourceToDelete} onOpenChange={() => setSourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{sourceToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSourceToDelete(null)} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
