"use client"

import type React from "react"

import { useState } from "react"
import { X, Search, Globe, Sparkles, Upload, Link, HardDrive, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"

import { Source, SourceType } from "@/lib/types"

interface AddSourcesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSources: (sources: Source[]) => void
}

export function AddSourcesModal({ open, onOpenChange, onAddSources }: AddSourcesModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)

  if (!open) return null

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Handle file drop
    const files = Array.from(e.dataTransfer.files)
    const newSources: Source[] = files.map((file, i) => ({
      id: Date.now().toString() + i,
      name: file.name,
      type: (file.type.includes("pdf") ? "pdf" : "file") as SourceType,
    }))
    onAddSources(newSources)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <SynapseLogo className="w-8 h-8" />
            <span className="text-xl font-semibold">SynapseAI</span>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold">Add sources</h2>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <Sparkles className="w-4 h-4" />
              Discover sources
            </Button>
          </div>
          <p className="text-muted-foreground mb-6">
            Sources let SynapseAI base its responses on the information that matters most to you.
            <br />
            (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
          </p>

          {/* Web Search */}
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the web for new sources"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Button variant="secondary" size="sm" className="gap-2 rounded-full">
                <Globe className="w-4 h-4" />
                Web
              </Button>
              <Button variant="secondary" size="sm" className="gap-2 rounded-full">
                <Sparkles className="w-4 h-4" />
                Fast Research
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full ml-auto">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">Upload sources</p>
            <p className="text-muted-foreground">
              Drag and drop or <button className="text-primary hover:underline">choose file</button> to upload
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" className="gap-2 rounded-full">
              <Upload className="w-4 h-4" />
              Upload files
            </Button>
            <Button variant="secondary" className="gap-2 rounded-full">
              <Link className="w-4 h-4" />
              Websites
            </Button>
            <Button variant="secondary" className="gap-2 rounded-full">
              <HardDrive className="w-4 h-4" />
              Drive
            </Button>
            <Button variant="secondary" className="gap-2 rounded-full">
              <FileText className="w-4 h-4" />
              Copied text
            </Button>
          </div>

          {/* Supported formats */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Supported file types: PDF, .txt, Markdown, Audio (e.g. mp3), .docx, .avif, .bmp, .gif, .ico, .jp2, .png,
            .webp, .tif, .tiff, .heic, .heif, .jpeg, .jpg, .jpe
          </p>
        </div>
      </div>
    </div>
  )
}
