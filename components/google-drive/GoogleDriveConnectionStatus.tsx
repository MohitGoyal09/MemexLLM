/**
 * Google Drive connection status component
 */

import { useState, useCallback } from "react"
import { HardDrive, Check, AlertCircle, Loader2, RefreshCw, Link2, Link2Off } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useGoogleDriveStatus, useGoogleDriveDisconnect } from "@/hooks/use-google-drive"
import { getGoogleDriveAuthUrl } from "@/lib/api/gdrive"
import { toast } from "sonner"

interface GoogleDriveStatusProps {
  onConnect?: () => void
  onDisconnect?: () => void
  showDetails?: boolean
  className?: string
}

export function GoogleDriveStatus({
  onConnect,
  onDisconnect,
  showDetails = true,
  className,
}: GoogleDriveStatusProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const { status, isLoading, refreshStatus } = useGoogleDriveStatus()
  const { disconnect, isDisconnecting } = useGoogleDriveDisconnect()

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const { auth_url } = await getGoogleDriveAuthUrl()
      if (auth_url) {
         // Redirect to Google OAuth
         window.location.href = auth_url
      } else {
        toast.error("Failed to get authorization URL")
      }
    } catch (error) {
      toast.error("Failed to initialize connection")
      console.error(error)
      setIsConnecting(false) 
    }
  }, [])

  const handleDisconnect = useCallback(async () => {
    const success = await disconnect()
    if (success) {
      onDisconnect?.()
      await refreshStatus()
    }
  }, [disconnect, onDisconnect, refreshStatus])

  const handleRefresh = useCallback(async () => {
    await refreshStatus()
  }, [refreshStatus])

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            status?.connected
              ? "bg-success/10"
              : status?.configured
              ? "bg-warning/10"
              : "bg-muted"
          )}
        >
          <HardDrive
            className={cn(
              "w-5 h-5",
              status?.connected
                ? "text-success"
                : status?.configured
                ? "text-warning"
                : "text-muted-foreground"
            )}
          />
        </div>

        {/* Status info */}
        {showDetails && (
          <div>
            <p className="font-medium">Google Drive</p>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking status...
                </span>
              ) : status?.connected ? (
                <span className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-success" />
                  Connected as {status.email}
                </span>
              ) : status?.configured ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-warning" />
                  Not connected
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-muted-foreground" />
                  Not configured
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : status?.connected ? (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-destructive hover:text-destructive"
            >
              <Link2Off className="w-4 h-4 mr-1.5" />
              Disconnect
            </Button>
          </>
        ) : status?.configured ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-1.5" />
                Connect
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <AlertCircle className="w-4 h-4 mr-1.5" />
            Not Configured
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Compact Google Drive status badge
 */
export function GoogleDriveStatusBadge({ className }: { className?: string }) {
  const { status, isLoading } = useGoogleDriveStatus()

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        status?.connected
          ? "bg-success/10 text-success"
          : status?.configured
          ? "bg-warning/10 text-warning"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : status?.connected ? (
        <Check className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      <span>
        {status?.connected
          ? "Drive Connected"
          : status?.configured
          ? "Drive"
          : "Drive"}
      </span>
    </div>
  )
}
