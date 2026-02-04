/**
 * Google Drive React hooks
 */

import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"
import {
  getGoogleDriveStatus,
  listGoogleDriveFiles,
  searchGoogleDriveFiles,
  importGoogleDriveFile,
  disconnectGoogleDrive,
  formatFileSize,
} from "@/lib/api/gdrive"
import type {
  GoogleDriveFile,
  GoogleDriveFileListResponse,
  GoogleDriveAuthStatus,
  GoogleDriveFolder,
  GoogleDriveImportProgress,
} from "@/lib/types-gdrive"

/**
 * Hook to manage Google Drive connection status
 */
export function useGoogleDriveStatus() {
  const [status, setStatus] = useState<GoogleDriveAuthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getGoogleDriveStatus()
      setStatus(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get status")
      toast.error("Failed to connect to Google Drive")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  return { status, isLoading, error, refreshStatus }
}

/**
 * Hook to list Google Drive files with pagination and navigation
 */
export function useGoogleDriveFiles() {
  const [files, setFiles] = useState<GoogleDriveFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFolder, setCurrentFolder] = useState<GoogleDriveFolder | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<GoogleDriveFolder[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)

  const loadFiles = useCallback(async (folderId: string | null = null) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await listGoogleDriveFiles({
        folderId,
        pageSize: 50,
      })
      setFiles(result.files)
      setNextPageToken(result.nextPageToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files")
      toast.error("Failed to load Google Drive files")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const navigateToFolder = useCallback(
    async (folder: GoogleDriveFolder) => {
      setCurrentFolder(folder)
      setBreadcrumbs((prev) => {
        const existingIndex = prev.findIndex((f) => f.id === folder.id)
        if (existingIndex >= 0) {
          return prev.slice(0, existingIndex + 1)
        }
        return [...prev, folder]
      })
      await loadFiles(folder.id)
    },
    [loadFiles]
  )

  const navigateToRoot = useCallback(async () => {
    setCurrentFolder(null)
    setBreadcrumbs([])
    await loadFiles(null)
  }, [loadFiles])

  const navigateUp = useCallback(async () => {
    if (breadcrumbs.length <= 1) {
      await navigateToRoot()
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, -1)
      const parentFolder = newBreadcrumbs[newBreadcrumbs.length - 1] || null
      setBreadcrumbs(newBreadcrumbs)
      setCurrentFolder(parentFolder)
      await loadFiles(parentFolder?.id || null)
    }
  }, [breadcrumbs, loadFiles, navigateToRoot])

  const loadMore = useCallback(async () => {
    if (!nextPageToken || isLoading) return

    setIsLoading(true)
    try {
      const result = await listGoogleDriveFiles({
        folderId: currentFolder?.id || null,
        pageSize: 50,
        pageToken: nextPageToken,
      })
      setFiles((prev) => [...prev, ...result.files])
      setNextPageToken(result.nextPageToken)
    } catch (err) {
      toast.error("Failed to load more files")
    } finally {
      setIsLoading(false)
    }
  }, [nextPageToken, isLoading, currentFolder])

  return {
    files,
    isLoading,
    error,
    currentFolder,
    breadcrumbs,
    nextPageToken,
    loadFiles,
    navigateToFolder,
    navigateToRoot,
    navigateUp,
    loadMore,
    setFiles,
  }
}

/**
 * Hook to search Google Drive files
 */
export function useGoogleDriveSearch() {
  const [results, setResults] = useState<GoogleDriveFile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)

  const search = useCallback(
    async (query: string, mimeTypes?: string[]) => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setIsSearching(true)
      setSearchQuery(query)
      setError(null)

      try {
        const result = await searchGoogleDriveFiles({
          query,
          mimeTypes,
          pageSize: 50,
        })
        setResults(result.files)
        setNextPageToken(result.nextPageToken)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed")
        toast.error("Search failed")
      } finally {
        setIsSearching(false)
      }
    },
    [setError]
  )

  const searchMore = useCallback(async () => {
    if (!nextPageToken || isSearching || !searchQuery) return

    setIsSearching(true)
    try {
      const result = await searchGoogleDriveFiles({
        query: searchQuery,
        pageSize: 50,
        pageToken: nextPageToken,
      })
      setResults((prev) => [...prev, ...result.files])
      setNextPageToken(result.nextPageToken)
    } catch (err) {
      toast.error("Failed to load more results")
    } finally {
      setIsSearching(false)
    }
  }, [nextPageToken, isSearching, searchQuery])

  const clearSearch = useCallback(() => {
    setResults([])
    setSearchQuery("")
    setNextPageToken(null)
  }, [])

  return {
    results,
    isSearching,
    searchQuery,
    nextPageToken,
    search,
    searchMore,
    clearSearch,
    setResults,
  }
}

// Error state for search
let searchError: string | null = null
function setError(err: string | null) {
  searchError = err
}

/**
 * Hook to import files from Google Drive
 */
export function useGoogleDriveImport(notebookId: string | undefined) {
  const [importProgress, setImportProgress] = useState<GoogleDriveImportProgress[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const importFile = useCallback(
    async (file: GoogleDriveFile) => {
      if (!notebookId) {
        toast.error("Please select a notebook first")
        return
      }

      setIsImporting(true)
      const progress: GoogleDriveImportProgress = {
        fileId: file.id,
        fileName: file.name,
        status: "importing",
        progress: 0,
      }
      setImportProgress((prev) => [...prev, progress])

      try {
        const result = await importGoogleDriveFile(file.id, notebookId)
        if (result.success) {
          setImportProgress((prev) =>
            prev.map((p) =>
              p.fileId === file.id ? { ...p, status: "completed", progress: 100 } : p
            )
          )
          toast.success(`Imported "${file.name}" successfully`)
        } else {
          throw new Error(result.message)
        }
      } catch (err) {
        setImportProgress((prev) =>
          prev.map((p) =>
            p.fileId === file.id
              ? {
                  ...p,
                  status: "failed",
                  error: err instanceof Error ? err.message : "Import failed",
                }
              : p
          )
        )
        toast.error(`Failed to import "${file.name}"`)
      } finally {
        setIsImporting(false)
      }
    },
    [notebookId]
  )

  const importMultipleFiles = useCallback(
    async (files: GoogleDriveFile[]) => {
      for (const file of files) {
        await importFile(file)
      }
    },
    [importFile]
  )

  const clearImportProgress = useCallback(() => {
    setImportProgress([])
  }, [])

  const removeFromProgress = useCallback((fileId: string) => {
    setImportProgress((prev) => prev.filter((p) => p.fileId !== fileId))
  }, [])

  return {
    importProgress,
    isImporting,
    importFile,
    importMultipleFiles,
    clearImportProgress,
    removeFromProgress,
  }
}

/**
 * Hook to disconnect Google Drive
 */
export function useGoogleDriveDisconnect() {
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true)
    try {
      const result = await disconnectGoogleDrive()
      if (result.success) {
        toast.success("Google Drive disconnected")
        return true
      } else {
        toast.error(result.message)
        return false
      }
    } catch (err) {
      toast.error("Failed to disconnect Google Drive")
      return false
    } finally {
      setIsDisconnecting(false)
    }
  }, [])

  return { disconnect, isDisconnecting }
}
