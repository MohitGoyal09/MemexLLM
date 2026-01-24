"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { FileText, X, ChevronRight, ExternalLink, Quote, BookOpen } from "lucide-react"
import { Citation } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface CitationPreviewProps {
  citation: Citation
  index: number
  className?: string
  onViewSource?: (documentId: string) => void
}

export function CitationPreview({ citation, index, className, onViewSource }: CitationPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [position, setPosition] = useState<"above" | "below">("above")
  const [horizontalPosition, setHorizontalPosition] = useState<"center" | "left" | "right">("center")
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Delay before showing popover on hover (prevents flickering)
  const HOVER_DELAY = 150
  // Delay before hiding popover when mouse leaves
  const CLOSE_DELAY = 100

  // Calculate optimal position for popover
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceAbove = rect.top
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceLeft = rect.left
      const spaceRight = window.innerWidth - rect.right
      const popoverWidth = 320 // w-80 = 20rem = 320px

      // Prefer showing above, but show below if not enough space
      setPosition(spaceAbove > 280 || spaceAbove > spaceBelow ? "above" : "below")

      // Determine horizontal positioning
      if (spaceLeft < popoverWidth / 2) {
        setHorizontalPosition("left")
      } else if (spaceRight < popoverWidth / 2) {
        setHorizontalPosition("right")
      } else {
        setHorizontalPosition("center")
      }
    }
  }, [isOpen])

  // Handle hover with delay
  const handleMouseEnter = useCallback(() => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setIsHovering(true)
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, HOVER_DELAY)
  }, [])

  const handleMouseLeave = useCallback(() => {
    // Clear any pending open timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    setIsHovering(false)
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, CLOSE_DELAY)
  }, [])

  // Handle popover mouse enter/leave to keep it open when hovering the popover
  const handlePopoverMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handlePopoverMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, CLOSE_DELAY)
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  // Get file icon based on filename extension
  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    const iconClasses = "w-4 h-4"

    switch (ext) {
      case "pdf":
        return <FileText className={cn(iconClasses, "text-red-500")} />
      case "doc":
      case "docx":
        return <FileText className={cn(iconClasses, "text-blue-500")} />
      case "txt":
      case "md":
        return <FileText className={cn(iconClasses, "text-slate-400")} />
      case "html":
      case "htm":
        return <FileText className={cn(iconClasses, "text-orange-500")} />
      default:
        return <FileText className={cn(iconClasses, "text-muted-foreground")} />
    }
  }

  // Get file type label
  const getFileTypeLabel = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "pdf": return "PDF Document"
      case "doc":
      case "docx": return "Word Document"
      case "txt": return "Text File"
      case "md": return "Markdown"
      case "html":
      case "htm": return "Web Page"
      default: return "Document"
    }
  }

  // Format the text preview with smart truncation
  const formatTextPreview = (text: string): { preview: string; isTruncated: boolean } => {
    if (!text) return { preview: "No preview available", isTruncated: false }

    // Clean up whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim()

    // Smart truncation - try to break at sentence boundaries
    const maxLength = 350
    if (cleanText.length <= maxLength) {
      return { preview: cleanText, isTruncated: false }
    }

    // Find a good break point (end of sentence or clause)
    let breakPoint = maxLength
    const sentenceEnd = cleanText.substring(0, maxLength).lastIndexOf('. ')
    const clauseEnd = cleanText.substring(0, maxLength).lastIndexOf(', ')

    if (sentenceEnd > maxLength * 0.6) {
      breakPoint = sentenceEnd + 1
    } else if (clauseEnd > maxLength * 0.6) {
      breakPoint = clauseEnd + 1
    }

    return {
      preview: cleanText.substring(0, breakPoint).trim() + "...",
      isTruncated: true
    }
  }

  // Calculate relevance indicator color
  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "bg-emerald-500"
    if (score >= 0.6) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.8) return "Highly relevant"
    if (score >= 0.6) return "Relevant"
    return "Somewhat relevant"
  }

  const { preview, isTruncated } = formatTextPreview(citation.text_preview)

  return (
    <span className={cn("relative inline-block align-baseline", className)}>
      {/* Citation Badge - Clickable with hover support */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "inline-flex items-center justify-center",
          "min-w-[1.25rem] h-[1.25rem] px-1",
          "text-[10px] font-bold",
          "rounded transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1",
          "cursor-pointer select-none",
          isOpen || isHovering
            ? "bg-primary text-primary-foreground shadow-md scale-110"
            : "bg-primary/20 text-primary hover:bg-primary/30 hover:scale-105"
        )}
        aria-label={`View source ${index}: ${citation.filename}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {index}
      </button>

      {/* Popover Preview with enhanced styling */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Citation preview for ${citation.filename}`}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          className={cn(
            "absolute z-[100] w-80",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            position === "above"
              ? "bottom-full mb-2 origin-bottom"
              : "top-full mt-2 origin-top",
            // Horizontal positioning
            horizontalPosition === "center" && "left-1/2 -translate-x-1/2",
            horizontalPosition === "left" && "left-0",
            horizontalPosition === "right" && "right-0"
          )}
        >
          <div className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Header with source info */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-muted/80 to-muted/40 border-b border-border/50">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-background/80 flex items-center justify-center border border-border/50 shadow-sm">
                  {getFileIcon(citation.filename)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight" title={citation.filename}>
                    {citation.filename}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    <span>{getFileTypeLabel(citation.filename)}</span>
                    {citation.page_number && (
                      <>
                        <span className="text-muted-foreground/40">|</span>
                        <span className="font-medium">Page {citation.page_number}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                className="flex-shrink-0 p-1 rounded-md hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close preview"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Preview with quote styling */}
            <div className="relative px-3 py-3">
              <div className="flex gap-2">
                <Quote className="w-4 h-4 text-primary/40 flex-shrink-0 mt-0.5" />
                <div className="flex-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {preview}
                  </p>
                  {isTruncated && (
                    <span className="text-xs text-muted-foreground/70 mt-1 block">
                      [excerpt]
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with relevance indicator and action */}
            <div className="px-3 py-2 bg-muted/20 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", getRelevanceColor(citation.score))} />
                  <span className="text-[11px] text-muted-foreground">
                    {getRelevanceLabel(citation.score)} ({Math.round(citation.score * 100)}%)
                  </span>
                </div>
              </div>
              <button
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium group"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onViewSource) {
                    onViewSource(citation.document_id)
                  }
                  setIsOpen(false)
                }}
              >
                <BookOpen className="w-3 h-3" />
                View in source
                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Arrow pointer - positioned based on horizontal alignment */}
          <div
            className={cn(
              "absolute w-2.5 h-2.5 rotate-45 bg-popover border-border",
              position === "above"
                ? "bottom-[-6px] border-r border-b"
                : "top-[-6px] border-l border-t",
              horizontalPosition === "center" && "left-1/2 -translate-x-1/2",
              horizontalPosition === "left" && "left-4",
              horizontalPosition === "right" && "right-4"
            )}
          />
        </div>
      )}
    </span>
  )
}

// Separate component for the sources footer
interface CitationFooterProps {
  citations: Citation[]
  className?: string
}

export function CitationFooter({ citations, className }: CitationFooterProps) {
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null)

  if (!citations || citations.length === 0) return null

  return (
    <div className={cn("mt-4 pt-4 border-t border-border/50", className)}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {citations.length} {citations.length === 1 ? "Source" : "Sources"} Referenced
        </span>
      </div>

      <div className="space-y-2">
        {citations.map((citation, idx) => (
          <div
            key={citation.id || idx}
            className={cn(
              "rounded-lg border border-border/50 overflow-hidden transition-all duration-200",
              expandedCitation === idx ? "bg-muted/30" : "hover:bg-muted/20"
            )}
          >
            <button
              onClick={() => setExpandedCitation(expandedCitation === idx ? null : idx)}
              className="w-full px-3 py-2 flex items-center gap-3 text-left"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/15 text-primary text-[10px] font-bold flex-shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {citation.filename}
                </p>
                {citation.page_number && (
                  <p className="text-xs text-muted-foreground">
                    Page {citation.page_number}
                  </p>
                )}
              </div>
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  expandedCitation === idx && "rotate-90"
                )}
              />
            </button>

            {expandedCitation === idx && (
              <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
                <blockquote className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 italic ml-8">
                  "{citation.text_preview}"
                </blockquote>
                <div className="flex items-center gap-2 mt-2 ml-8">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">
                    {Math.round(citation.score * 100)}% relevance
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
