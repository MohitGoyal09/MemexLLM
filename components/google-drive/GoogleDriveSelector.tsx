import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { X, HardDrive, Loader2, Check, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GoogleDriveBrowser } from "./GoogleDriveBrowser"
import { useGoogleDriveStatus, useGoogleDriveImport } from "@/hooks/use-google-drive"
import type { GoogleDriveFile } from "@/lib/types-gdrive"

interface GoogleDriveSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notebookId: string
  onImportComplete?: () => void
}

export function GoogleDriveSelector({
  open,
  onOpenChange,
  notebookId,
  onImportComplete,
}: GoogleDriveSelectorProps) {
  const [step, setStep] = useState<"status" | "select" | "import">("status")
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([])
  const [importedCount, setImportedCount] = useState(0)

  const router = useRouter()
  const { status, isLoading: statusLoading, refreshStatus } = useGoogleDriveStatus()
  const { importProgress, isImporting, importMultipleFiles, clearImportProgress } =
    useGoogleDriveImport(notebookId, onImportComplete)

  // Handlers
  const handleConnect = useCallback(async () => {
    try {
        // Redirect directly to Google OAuth
        const { getGoogleDriveAuthUrl } = await import("@/lib/api/gdrive")
        const { createOAuthState } = await import("@/lib/oauth-state")

        // Generate CSRF state token with return URL encoded
        const state = createOAuthState()
        const { auth_url } = await getGoogleDriveAuthUrl(state)

        if (auth_url) {
            window.location.href = auth_url
        } else {
            toast.error("Failed to get authorization URL")
        }
    } catch (error) {
        toast.error("Failed to initialize connection")
        console.error(error)
    }
  }, [])

  const handleSelectFile = useCallback((file: GoogleDriveFile) => {
    setSelectedFiles((prev) => {
      const exists = prev.find((f) => f.id === file.id)
      if (exists) {
        return prev.filter((f) => f.id !== file.id)
      }
      return [...prev, file]
    })
  }, [])

  const handleImport = useCallback(async () => {
    if (selectedFiles.length === 0) return

    setStep("import")
    const count = selectedFiles.length
    await importMultipleFiles(selectedFiles)
    setImportedCount(count)
    setSelectedFiles([])
  }, [selectedFiles, importMultipleFiles])

  const handleClose = useCallback(() => {
    setStep("status")
    setSelectedFiles([])
    setImportedCount(0)
    clearImportProgress()
    onOpenChange(false)
  }, [clearImportProgress, onOpenChange])

  // Auto-close on successful import
  useEffect(() => {
    if (step === "import" && importProgress.length > 0) {
        const allCompleted = importProgress.every(p => p.status === "completed");
        if (allCompleted) {
             const timer = setTimeout(() => {
                 onImportComplete?.(); 
                 handleClose();        
             }, 1500);
             return () => clearTimeout(timer);
        }
    }
  }, [step, importProgress, handleClose, onImportComplete]);

  // Initial Check (OPTIONAL: Auto-advance if connected, but keep UI if not?)
  // User wanted "Good UI", so let's keeping the Status screen.
  // We won't auto-redirect, we'll let the user see the state.
  
  if (!open) return null

  const isConnected = status?.connected

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gdrive-selector-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[80vh] bg-card rounded-2xl shadow-2xl border border-border mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="gdrive-selector-title" className="text-xl font-semibold">
                Import from Google Drive
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === "status" && "Connect your Google Drive account"}
                {step === "select" && "Select files to import"}
                {step === "import" && "Importing files..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === "status" && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              {statusLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Checking connection status...</p>
                </div>
              ) : isConnected ? (
                <div className="flex flex-col items-center gap-6 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Google Drive Connected</p>
                    <p className="text-sm text-muted-foreground">
                      Signed in as {status.email}
                    </p>
                  </div>
                  <Button onClick={() => setStep("select")} size="lg" className="rounded-full">
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-warning" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Connect Google Drive</p>
                    <p className="text-sm text-muted-foreground">
                      Link your Google account to import files directly from Drive
                    </p>
                  </div>
                  <Button onClick={handleConnect} size="lg" className="rounded-full">
                    Connect Account
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "select" && (
            <div className="h-full">
              <GoogleDriveBrowser
                selectionMode="multiple"
                selectedFiles={selectedFiles.map((f) => f.id)}
                onSelectFile={handleSelectFile}
                className="h-full border-0 rounded-none"
              />
            </div>
          )}

          {step === "import" && (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-full max-w-md space-y-4">
                {importProgress.map((item) => (
                  <div
                    key={item.fileId}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all",
                      item.status === "completed" && "bg-success/5 border-success/20",
                      item.status === "failed" && "bg-destructive/5 border-destructive/20",
                      item.status === "importing" && "bg-secondary border-border"
                    )}
                  >
                    {/* Status Icon */}
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        item.status === "completed" ? "bg-success/10 text-success" : 
                        item.status === "failed" ? "bg-destructive/10 text-destructive" :
                        "bg-background border border-border"
                    )}>
                      {item.status === "completed" ? (
                        <Check className="w-5 h-5" />
                      ) : item.status === "failed" ? (
                         <X className="w-5 h-5" />
                      ) : (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="p-2 bg-muted/50 rounded-lg shrink-0">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.fileName}</p>
                            {item.error ? (
                                <p className="text-xs text-destructive mt-0.5">{item.error}</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{item.status}...</p>
                            )}
                        </div>
                    </div>

                    {/* Status Text Badge */}
                    {item.status === "completed" && (
                      <span className="text-xs font-medium text-success px-2.5 py-1 bg-success/10 rounded-full shrink-0">
                        Imported
                      </span>
                    )}
                     {item.status === "failed" && (
                      <span className="text-xs font-medium text-destructive px-2.5 py-1 bg-destructive/10 rounded-full shrink-0">
                        Failed
                      </span>
                    )}
                  </div>
                ))}

                {/* Manual Close Button - Only show if there are failures (since success auto-closes) */}
                {importProgress.every((p) => p.status !== "importing") && importProgress.some(p => p.status === "failed") && (
                  <div className="flex flex-col items-center gap-4 pt-4">
                     <p className="text-destructive font-medium">Some files failed to import.</p>
                     <Button onClick={handleClose} variant="secondary" className="rounded-full px-8">
                       Close
                     </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "select" && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30 rounded-b-2xl">
            <span className="text-sm text-muted-foreground">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleClose} className="rounded-full">
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedFiles.length === 0 || isImporting}
                className="rounded-full"
              >
                {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
