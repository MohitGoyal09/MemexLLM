"use client"

import { useState } from "react"

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
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { Source } from "@/lib/types"


interface SourcesPanelProps {
  sources: Source[]
  selectedSources: string[]
  onAddSource: () => void
  onToggleSource: (id: string) => void
  onSelectAll: () => void
  onCollapse: () => void
  onRefresh?: () => Promise<void> | void
}

const getSourceIcon = (type: Source["type"]) => {
  const iconMap = {
    pdf: { icon: FileText, bg: "bg-red-500/20", color: "text-red-400" },
    doc: { icon: FileText, bg: "bg-blue-500/20", color: "text-blue-400" },
    image: { icon: FileImage, bg: "bg-green-500/20", color: "text-green-400" },
    video: { icon: FileVideo, bg: "bg-purple-500/20", color: "text-purple-400" },
    audio: { icon: FileAudio, bg: "bg-orange-500/20", color: "text-orange-400" },
    link: { icon: Globe, bg: "bg-cyan-500/20", color: "text-cyan-400" },
    text: { icon: FileText, bg: "bg-slate-500/20", color: "text-slate-400" },
    file: { icon: FileText, bg: "bg-gray-500/20", color: "text-gray-400" },
  }
  return (iconMap as any)[type] || iconMap.text
}

const getStatusIndicator = (status: Source["status"]) => {
  switch (status) {
    case "pending":
    case "processing":
      return <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
    case "completed":
      return <CheckCircle className="w-3 h-3 text-green-500" />
    case "failed":
      return <AlertCircle className="w-3 h-3 text-red-500" />
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
}: SourcesPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const completedSources = sources.filter((s) => s.status === "completed" || !s.status)
  const processingSources = sources.filter((s) => s.status === "pending" || s.status === "processing")

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
    <div className="w-full h-full border-r border-border bg-card flex flex-col">
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
              <Loader2 className={`w-4 h-4 text-muted-foreground group-hover:text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
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
        <div className="mx-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">
                <span className="text-primary font-medium">Try Deep Research</span>{" "}
                <span className="text-muted-foreground">for an in-depth report and new sources!</span>
              </p>
            </div>
          </div>
        </div>

        {/* Web Search */}
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
        </div>

        {/* Processing Banner */}
        {processingSources.length > 0 && (
          <div className="mx-4 mb-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
              <span className="text-yellow-600 dark:text-yellow-400">
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
                  <button
                    key={source.id}
                    onClick={() => onToggleSource(source.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left group ${
                      isProcessing ? "opacity-70" : ""
                    } ${isFailed ? "opacity-50" : ""}`}
                    disabled={isProcessing}
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
                        <span className="text-sm truncate block">{source.name}</span>
                        {source.chunkCount !== undefined && source.chunkCount > 0 && (
                          <span className="text-xs text-muted-foreground">{source.chunkCount} chunks</span>
                        )}
                        {source.errorMessage && (
                          <span className="text-xs text-red-500 truncate block">{source.errorMessage}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">{getStatusIndicator(source.status)}</div>
                  </button>
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
    </div>
  )
}
