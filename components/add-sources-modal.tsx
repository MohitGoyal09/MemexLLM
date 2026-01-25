"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Search, Globe, Sparkles, Upload, Link, HardDrive, FileText, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SynapseLogo } from "@/components/synapse-logo"

import { Source, SourceType } from "@/lib/types"
import { documentsApi } from "@/lib/api"

interface AddSourcesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSources: (sources: Source[]) => void
  notebookId?: string // Required for API uploads
}

interface UploadProgress {
  file: File
  status: "uploading" | "success" | "error"
  error?: string
}

// Maximum file size: 100MB (as per API docs)
const MAX_FILE_SIZE_MB = 100
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// Helper to determine source type from file
function getSourceTypeFromFile(file: File): SourceType {
  const mimeType = file.type.toLowerCase()
  const extension = file.name.split(".").pop()?.toLowerCase() || ""

  if (mimeType.includes("pdf") || extension === "pdf") return "pdf"
  if (mimeType.includes("word") || extension === "docx" || extension === "doc") return "doc"
  if (mimeType.includes("image") || ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp"].includes(extension)) return "image"
  if (mimeType.includes("video") || ["mp4", "webm"].includes(extension)) return "video"
  if (mimeType.includes("audio") || ["mp3", "wav", "m4a", "ogg"].includes(extension)) return "audio"
  if (mimeType.includes("text") || ["txt", "md", "markdown"].includes(extension)) return "text"
  return "file"
}

export function AddSourcesModal({ open, onOpenChange, onAddSources, notebookId }: AddSourcesModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [fileSizeError, setFileSizeError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const uploadFiles = async (files: File[]) => {
    // Clear any previous file size error
    setFileSizeError(null)

    // Validate file sizes
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE_BYTES)
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ")
      setFileSizeError(
        `The following file(s) exceed the maximum size of ${MAX_FILE_SIZE_MB}MB: ${fileNames}`
      )
      return
    }

    if (!notebookId) {
      // Fallback to mock behavior for demo/new notebooks
      const newSources: Source[] = files.map((file, i) => ({
        id: Date.now().toString() + i,
        name: file.name,
        type: getSourceTypeFromFile(file),
        status: "pending",
      }))
      onAddSources(newSources)
      return
    }

    setIsUploading(true)
    const newUploads: UploadProgress[] = files.map((file) => ({
      file,
      status: "uploading" as const,
    }))
    setUploads(newUploads)

    const uploadedSources: Source[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const response = await documentsApi.upload(notebookId, file)
        
        // Update upload status to success
        setUploads((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, status: "success" as const } : u))
        )

        uploadedSources.push({
          id: response.document_id,
          name: response.filename,
          type: getSourceTypeFromFile(file),
          status: response.processing_status,
          mimeType: response.mime_type,
        })
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? { ...u, status: "error" as const, error: error instanceof Error ? error.message : "Upload failed" }
              : u
          )
        )
      }
    }

    setIsUploading(false)

    if (uploadedSources.length > 0) {
      onAddSources(uploadedSources)
    }

    // Clear uploads after a delay and close modal
    setTimeout(() => {
      setUploads([])
      if (uploadedSources.length === files.length) {
        onOpenChange(false)
      }
    }, 1500)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
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
            {/* <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <Sparkles className="w-4 h-4" />
              Discover sources
            </Button> */}
          </div>
          <p className="text-muted-foreground mb-6">
            Sources let SynapseAI base its responses on the information that matters most to you.
            <br />
            (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
          </p>

          {/* Web Search */}
          {/* <div className="mb-6">
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
          </div> */}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.txt,.md,.docx,.pptx,.xlsx,.py,.js,.ts,.java,.cpp,.go,.yaml,.json,.mp3,.wav,.m4a,.ogg,.mp4,.webm,.png,.jpg,.jpeg,.gif,.webp"
          />

          {/* File Size Error */}
          {fileSizeError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-500 font-medium">File size limit exceeded</p>
                <p className="text-xs text-red-400 mt-1">{fileSizeError}</p>
              </div>
              <button
                onClick={() => setFileSizeError(null)}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {uploads.length > 0 && (
            <div className="mb-4 space-y-2">
              {uploads.map((upload, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  {upload.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {upload.status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {upload.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <span className="flex-1 text-sm truncate">{upload.file.name}</span>
                  {upload.error && <span className="text-xs text-red-500">{upload.error}</span>}
                </div>
              ))}
            </div>
          )}

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
              {isUploading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Upload className="w-6 h-6 text-primary" />}
            </div>
            <p className="text-lg font-medium mb-2">{isUploading ? "Uploading..." : "Upload sources"}</p>
            <p className="text-muted-foreground">
              Drag and drop or{" "}
              <button onClick={handleChooseFile} className="text-primary hover:underline" disabled={isUploading}>
                choose file
              </button>{" "}
              to upload
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button variant="secondary" className="gap-2 rounded-full" onClick={handleChooseFile} disabled={isUploading}>
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
            Supported file types: PDF, TXT, Markdown, DOCX, PPTX, XLSX, Audio (MP3, WAV, M4A), Video (MP4, WEBM), Images
            (PNG, JPG, WEBP, GIF), Code (Python, JavaScript, TypeScript, Java, Go)
            <br />
            Maximum file size: {MAX_FILE_SIZE_MB}MB per file
          </p>
        </div>
      </div>
    </div>
  )
}
