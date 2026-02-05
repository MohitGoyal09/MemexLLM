/**
 * Google Drive file browser component
 */

import { useState, useCallback, useEffect } from "react"
import { ChevronRight, RefreshCw, Search, Grid, List, Loader2, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { GoogleDriveFileItem } from "./GoogleDriveFileItem"
import { useGoogleDriveFiles, useGoogleDriveSearch } from "@/hooks/use-google-drive"
import type { GoogleDriveFile, GoogleDriveFolder } from "@/lib/types-gdrive"

interface GoogleDriveBrowserProps {
  onSelectFile?: (file: GoogleDriveFile) => void
  onOpenFolder?: (folder: GoogleDriveFolder) => void
  selectionMode?: "none" | "single" | "multiple"
  selectedFiles?: string[]
  className?: string
}

export function GoogleDriveBrowser({
  onSelectFile,
  onOpenFolder,
  selectionMode = "none",
  selectedFiles = [],
  className,
}: GoogleDriveBrowserProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const {
    files,
    isLoading,
    error,
    currentFolder,
    breadcrumbs,
    nextPageToken,
    loadFiles,
    navigateToFolder,
    navigateToRoot,
    loadMore,
  } = useGoogleDriveFiles()

  const {
    results,
    isSearching,
    search,
    searchMore,
    clearSearch,
  } = useGoogleDriveSearch()

  const displayFiles = isSearchMode ? results : files
  const hasMore = isSearchMode ? nextPageToken : nextPageToken

  // Initial load
  useEffect(() => {
    loadFiles(currentFolder?.id || null)
  }, [loadFiles])


  const handleRefresh = useCallback(async () => {
    if (isSearchMode) {
      await search(searchQuery)
    } else {
      await loadFiles(currentFolder?.id || null)
    }
  }, [isSearchMode, searchQuery, currentFolder, loadFiles, search])

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      setIsSearchMode(true)
      await search(searchQuery)
    }
  }, [searchQuery, search])

  const handleClearSearch = useCallback(async () => {
    setSearchQuery("")
    setIsSearchMode(false)
    clearSearch()
    await loadFiles(currentFolder?.id || null)
  }, [clearSearch, loadFiles, currentFolder])

  const handleFileClick = useCallback(
    (file: GoogleDriveFile) => {
      if (file.type === "folder") {
        const folder: GoogleDriveFolder = {
          id: file.id,
          name: file.name,
          path: breadcrumbs.map((b) => b.name).join("/") + "/" + file.name,
        }
        navigateToFolder(folder)
        onOpenFolder?.(folder)
      } else if (selectionMode !== "none") {
        onSelectFile?.(file)
      }
    },
    [selectionMode, navigateToFolder, onOpenFolder, onSelectFile, breadcrumbs]
  )

  const handleLoadMore = useCallback(async () => {
    if (isSearchMode) {
      await searchMore()
    } else {
      await loadMore()
    }
  }, [isSearchMode, searchMore, loadMore])

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-xl border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          <button
            onClick={navigateToRoot}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors whitespace-nowrap text-sm font-medium"
            title="Root folder"
          >
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span>My Drive</span>
          </button>
          {breadcrumbs.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1 whitespace-nowrap">
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <button
                onClick={() => navigateToFolder(folder)}
                className="px-2 py-1 rounded hover:bg-secondary transition-colors"
              >
                {folder.name}
              </button>
            </div>
          ))}
          {currentFolder && (
            <>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="px-2 py-1 text-muted-foreground whitespace-nowrap">{currentFolder.name}</span>
            </>
          )}
        </div>

        {/* View controls */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "list" ? "bg-secondary" : "hover:bg-secondary"
              )}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              className={cn(
                "p-1.5 transition-colors",
                viewMode === "grid" ? "bg-secondary" : "hover:bg-secondary"
              )}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
            Search
          </Button>
          {isSearchMode && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-destructive mb-2">{error}</p>
            <Button variant="outline" onClick={handleRefresh}>
              Try again
            </Button>
          </div>
        ) : displayFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <span className="text-3xl">📂</span>
            </div>
            <p className="text-sm font-medium mb-1">
              {isSearchMode ? "No files found" : "This folder is empty"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isSearchMode
                ? "Try a different search term"
                : "Drop files here or upload from your device"}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-2">
            {displayFiles.map((file) => (
              <GoogleDriveFileItem
                key={file.id}
                file={file}
                isSelected={selectedFiles.includes(file.id)}
                isDisabled={file.type === "folder" && selectionMode !== "none"}
                onClick={() => handleFileClick(file)}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {displayFiles.map((file) => (
              <GoogleDriveFileItem
                key={file.id}
                file={file}
                isSelected={selectedFiles.includes(file.id)}
                isDisabled={file.type === "folder" && selectionMode !== "none"}
                onClick={() => handleFileClick(file)}
                selectionMode={selectionMode}
                className="flex-col items-start text-center"
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
        <span>
          {displayFiles.length} item{displayFiles.length !== 1 ? "s" : ""}
          {isSearchMode && ` for "${searchQuery}"`}
        </span>
        <span>
          {selectionMode === "multiple" &&
            `${selectedFiles.length} selected`}
        </span>
      </div>
    </div>
  )
}
