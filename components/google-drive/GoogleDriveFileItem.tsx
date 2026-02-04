/**
 * Google Drive file item component
 */

import { cn } from "@/lib/utils"
import type { GoogleDriveFile } from "@/lib/types-gdrive"
import { formatFileSize } from "@/lib/api/gdrive"

interface GoogleDriveFileItemProps {
  file: GoogleDriveFile
  isSelected?: boolean
  isDisabled?: boolean
  onClick?: () => void
  onDoubleClick?: () => void
  onSelect?: (file: GoogleDriveFile) => void
  selectionMode?: "none" | "single" | "multiple"
  showSize?: boolean
  showDate?: boolean
  className?: string
}

const fileTypeConfig: Record<string, { icon: string; bg: string; color: string }> = {
  folder: { icon: "📁", bg: "bg-amber-500/15", color: "text-amber-600" },
  pdf: { icon: "📕", bg: "bg-red-500/15", color: "text-red-600" },
  doc: { icon: "📘", bg: "bg-blue-500/15", color: "text-blue-600" },
  sheet: { icon: "📗", bg: "bg-green-500/15", color: "text-green-600" },
  slide: { icon: "📙", bg: "bg-orange-500/15", color: "text-orange-600" },
  image: { icon: "🖼️", bg: "bg-purple-500/15", color: "text-purple-600" },
  video: { icon: "🎬", bg: "bg-pink-500/15", color: "text-pink-600" },
  audio: { icon: "🎵", bg: "bg-indigo-500/15", color: "text-indigo-600" },
  text: { icon: "📄", bg: "bg-slate-500/15", color: "text-slate-600" },
  file: { icon: "📎", bg: "bg-gray-500/15", color: "text-gray-600" },
}

export function GoogleDriveFileItem({
  file,
  isSelected = false,
  isDisabled = false,
  onClick,
  onDoubleClick,
  onSelect,
  selectionMode = "none",
  showSize = true,
  showDate = false,
  className,
}: GoogleDriveFileItemProps) {
  const config = fileTypeConfig[file.type] || fileTypeConfig.file

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick()
    }
  }

  const handleDoubleClick = () => {
    if (!isDisabled && file.type === "folder" && onDoubleClick) {
      onDoubleClick()
    } else if (!isDisabled && selectionMode === "none" && onClick) {
      onClick()
    }
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDisabled && selectionMode !== "none" && onSelect) {
      onSelect(file)
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer",
        "bg-surface-1 dark:bg-surface-2 border border-border/50",
        "hover:bg-surface-2 dark:hover:bg-surface-3 hover:shadow-sm hover:border-border",
        isSelected && "bg-primary/5 border-primary ring-1 ring-primary",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role={selectionMode !== "none" ? "checkbox" : "button"}
      aria-checked={isSelected}
      aria-disabled={isDisabled}
    >
      {/* Selection checkbox */}
      {selectionMode !== "none" && (
        <div
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30",
            isDisabled && "opacity-50"
          )}
          onClick={handleSelect}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      )}

      {/* File icon/thumbnail */}
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          config.bg
        )}
      >
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
        ) : (
          <span className="text-xl">{config.icon}</span>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {showSize && file.sizeBytes && (
            <span>{formatFileSize(file.sizeBytes)}</span>
          )}
          {showSize && file.sizeBytes && showDate && file.modifiedTime && (
            <span>•</span>
          )}
          {showDate && file.modifiedTime && (
            <span>Modified {formatDate(file.modifiedTime)}</span>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {file.status && file.status !== "idle" && (
        <div className="flex-shrink-0">
          {file.status === "indexing" && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">Indexing</span>
            </div>
          )}
          {file.status === "indexed" && (
            <div className="flex items-center gap-1 text-success">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs">Indexed</span>
            </div>
          )}
          {file.status === "error" && (
            <div className="flex items-center gap-1 text-destructive">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-xs">Error</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
