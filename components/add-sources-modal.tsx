"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Search, Globe, Sparkles, Upload, Link, HardDrive, FileText, ArrowRight, Loader2, CheckCircle, AlertCircle, ArrowLeft, ClipboardPaste } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

import { GoogleDriveSelector } from "@/components/google-drive"
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
  
  const [view, setView] = useState<"default" | "website" | "text" | "gdrive">("default")
  const [urlInput, setUrlInput] = useState("")
  const [textInput, setTextInput] = useState("")
  const [textTitle, setTextTitle] = useState("")

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

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    if (!notebookId) {
      const isYoutube = urlInput.includes("youtube.com") || urlInput.includes("youtu.be")
      onAddSources([{
        id: Date.now().toString(),
        name: urlInput,
        type: isYoutube ? "video" : "link",
        status: "pending",
      }])
      onOpenChange(false)
      return
    }

    setIsUploading(true)
    try {
      const response = await documentsApi.processUrl(notebookId, urlInput)
      const isYoutube = urlInput.includes("youtube.com") || urlInput.includes("youtu.be")
      onAddSources([{
        id: response.document_id,
        name: urlInput,
        type: isYoutube ? "video" : "link",
        status: response.processing_status as any,
      }])
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add URL:", error)
    } finally {
      setIsUploading(false)
      setUrlInput("")
      setView("default")
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return

    const title = textTitle.trim() || `Pasted text ${new Date().toLocaleDateString()}`

    if (!notebookId) {
      // Fallback for demo/new notebooks
      onAddSources([{
        id: Date.now().toString(),
        name: title,
        type: "text",
        status: "pending",
      }])
      onOpenChange(false)
      return
    }

    setIsUploading(true)
    try {
      // Create a text file from the pasted content
      const blob = new Blob([textInput], { type: "text/plain" })
      const file = new File([blob], `${title}.txt`, { type: "text/plain" })
      
      const response = await documentsApi.upload(notebookId, file)
      onAddSources([{
        id: response.document_id,
        name: title,
        type: "text",
        status: response.processing_status as any,
      }])
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add text:", error)
    } finally {
      setIsUploading(false)
      setTextInput("")
      setTextTitle("")
      setView("default")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-sources-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} aria-hidden="true" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Logo className="w-12 h-12" />
            <span className="text-xl font-semibold">MemexLLM</span>
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Close modal">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        {/* Content */}
        {view === "website" ? (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setView("default")}
                className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">Add from Web</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  URL
                </label>
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-secondary/50 focus-within:border-neutral-500 transition-colors">
                  {urlInput.includes("youtube") || urlInput.includes("youtu.be") ? (
                     <div className="flex items-center justify-center w-5 h-5 bg-red-600 rounded text-[10px] font-bold text-white">YT</div>
                  ) : (
                     <Globe className="w-5 h-5 text-muted-foreground" />
                  )}
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
                    placeholder="https://example.com or YouTube URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                    autoFocus
                  />
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Paste a website link, article, or YouTube video URL.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setView("default")}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUrlSubmit} 
                  disabled={!urlInput || isUploading}
                  className="rounded-full"
                >
                  {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add source
                </Button>
              </div>
            </div>
          </div>
        ) : view === "text" ? (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setView("default")}
                className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">Add Copied Text</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Title (optional)
                </label>
                <input
                  className="w-full p-3 rounded-lg border bg-secondary/50 focus:border-neutral-500 transition-colors outline-none text-sm"
                  placeholder="Give your text a name..."
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Paste your text
                </label>
                <textarea
                  className="w-full h-48 p-3 rounded-lg border bg-secondary/50 focus:border-neutral-500 transition-colors outline-none text-sm resize-none"
                  placeholder="Paste your text content here... (meeting notes, research excerpts, articles, etc.)"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  autoFocus
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  {textInput.length} characters
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setView("default")}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleTextSubmit} 
                  disabled={!textInput.trim() || isUploading}
                  className="rounded-full"
                >
                  {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add source
                </Button>
              </div>
            </div>
          </div>
        ) : view === "gdrive" ? (
          <GoogleDriveSelector
            open={true}
            onOpenChange={(open) => !open && setView("default")}
            notebookId={notebookId || ""}
            onImportComplete={() => {
              setView("default")
              onOpenChange(false)
            }}
          />
        ) : (
          <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 id="add-sources-title" className="text-2xl font-semibold">Add sources</h2>
            {/* <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <Sparkles className="w-4 h-4" />
              Discover sources
            </Button> */}
          </div>
          <p className="text-muted-foreground mb-6">
            Sources let MemexLLM base its responses on the information that matters most to you.
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
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium">File size limit exceeded</p>
                <p className="text-xs text-destructive mt-1">{fileSizeError}</p>
              </div>
              <button
                onClick={() => setFileSizeError(null)}
                className="p-1 hover:bg-destructive/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {uploads.length > 0 && (
            <div className="mb-4 space-y-2" aria-live="polite" aria-label="Upload progress">
              {uploads.map((upload, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  {upload.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />}
                  {upload.status === "success" && <CheckCircle className="w-4 h-4 text-success" aria-hidden="true" />}
                  {upload.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" aria-hidden="true" />}
                  <span className="flex-1 text-sm truncate">{upload.file.name}</span>
                  <span className="sr-only">
                    {upload.status === "uploading" && "Uploading"}
                    {upload.status === "success" && "Upload complete"}
                    {upload.status === "error" && `Upload failed: ${upload.error}`}
                  </span>
                  {upload.error && <span className="text-xs text-destructive" aria-hidden="true">{upload.error}</span>}
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
            <Button variant="secondary" className="gap-2 rounded-full" onClick={() => setView("website")}>
              <Link className="w-4 h-4" />
              Websites
            </Button>
            <Button variant="secondary" className="gap-2 rounded-full" onClick={() => setView("gdrive")}>
              <HardDrive className="w-4 h-4" />
              Drive
            </Button>
            <Button variant="secondary" className="gap-2 rounded-full" onClick={() => setView("text")}>
              <ClipboardPaste className="w-4 h-4" />
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
        )}
      </div>
    </div>
  )
}
