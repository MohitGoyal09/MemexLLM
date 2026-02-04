/**
 * Google Drive indexing progress component
 */

import { useState, useEffect, useCallback } from "react"
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface GoogleDriveIndexingProgressProps {
  documentId: string
  onComplete?: () => void
  onError?: (error: string) => void
  className?: string
}

export function GoogleDriveIndexingProgress({
  documentId,
  onComplete,
  onError,
  className,
}: GoogleDriveIndexingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"indexing" | "completed" | "error">("indexing")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Simulate progress for demo - in real implementation, this would poll the API
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setStatus("completed")
          onComplete?.()
          clearInterval(interval)
          return 100
        }
        // Simulate variable progress
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 95)
      })
    }, 500)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-secondary/50",
        className
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          status === "completed" ? "bg-success/20" : "bg-primary/20"
        )}
      >
        {status === "indexing" ? (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        ) : status === "completed" ? (
          <CheckCircle className="w-4 h-4 text-success" />
        ) : (
          <AlertCircle className="w-4 h-4 text-destructive" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Indexing document...</span>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        {errorMessage && (
          <p className="text-xs text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}

/**
 * Compact progress badge for lists
 */
export function GoogleDriveIndexingBadge({
  status,
  progress,
  className,
}: {
  status: "idle" | "indexing" | "completed" | "error"
  progress?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        status === "indexing" && "bg-primary/10 text-primary",
        status === "completed" && "bg-success/10 text-success",
        status === "error" && "bg-destructive/10 text-destructive",
        status === "idle" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {status === "indexing" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "completed" && <CheckCircle className="w-3 h-3" />}
      {status === "error" && <AlertCircle className="w-3 h-3" />}
      <span>
        {status === "indexing" && progress !== undefined && `${progress}%`}
        {status === "indexing" && progress === undefined && "Indexing..."}
        {status === "completed" && "Indexed"}
        {status === "error" && "Failed"}
        {status === "idle" && "Ready"}
      </span>
    </div>
  )
}
