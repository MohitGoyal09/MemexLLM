"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import {
  FileText,
  X,
  ChevronRight,
  Quote,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertCircle
} from "lucide-react"
import { Citation } from "@/lib/api/types"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CitationPreviewProps {
  citation: Citation
  index: number
  className?: string
  onViewSource?: (documentId: string, pageNumber?: number | null) => void
}

interface CitationFooterProps {
  citations: Citation[]
  className?: string
  onViewSource?: (documentId: string, pageNumber?: number | null) => void
}

interface InlineCitationProps {
  citations: Citation[]
  onViewSource?: (documentId: string, pageNumber?: number | null) => void
}

interface PopoverPosition {
  top: number
  left: number
  placement: "above" | "below"
  horizontalAlign: "center" | "left" | "right"
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get file icon styling based on file extension
 */
function getFileIconInfo(filename: string): { colorClass: string; label: string } {
  const ext = filename?.split(".")?.pop()?.toLowerCase() || ""

  const fileTypes: Record<string, { colorClass: string; label: string }> = {
    pdf: { colorClass: "text-[var(--file-pdf)]", label: "PDF Document" },
    doc: { colorClass: "text-[var(--file-doc)]", label: "Word Document" },
    docx: { colorClass: "text-[var(--file-doc)]", label: "Word Document" },
    txt: { colorClass: "text-[var(--file-text)]", label: "Text File" },
    md: { colorClass: "text-[var(--file-text)]", label: "Markdown" },
    html: { colorClass: "text-[var(--file-audio)]", label: "Web Page" },
    htm: { colorClass: "text-[var(--file-audio)]", label: "Web Page" },
    csv: { colorClass: "text-[var(--file-data)]", label: "Spreadsheet" },
    xlsx: { colorClass: "text-[var(--file-data)]", label: "Excel File" },
    xls: { colorClass: "text-[var(--file-data)]", label: "Excel File" },
    pptx: { colorClass: "text-[var(--file-audio)]", label: "Presentation" },
    ppt: { colorClass: "text-[var(--file-audio)]", label: "Presentation" },
    json: { colorClass: "text-warning", label: "JSON File" },
  }

  return fileTypes[ext] || { colorClass: "text-muted-foreground", label: "Document" }
}

/**
 * Format text preview with smart truncation
 */
function formatTextPreview(
  text: string | null | undefined,
  maxLength: number = 350
): { preview: string; isTruncated: boolean; fullText: string } {
  if (!text || text.trim() === "") {
    return {
      preview: "No preview available",
      isTruncated: false,
      fullText: ""
    }
  }

  // Clean up whitespace and normalize
  const cleanText = text.replace(/\s+/g, " ").trim()

  if (cleanText.length <= maxLength) {
    return { preview: cleanText, isTruncated: false, fullText: cleanText }
  }

  // Smart truncation - try to break at sentence or clause boundaries
  let breakPoint = maxLength
  const sentenceEnd = cleanText.substring(0, maxLength).lastIndexOf(". ")
  const clauseEnd = cleanText.substring(0, maxLength).lastIndexOf(", ")
  const wordEnd = cleanText.substring(0, maxLength).lastIndexOf(" ")

  if (sentenceEnd > maxLength * 0.6) {
    breakPoint = sentenceEnd + 1
  } else if (clauseEnd > maxLength * 0.6) {
    breakPoint = clauseEnd + 1
  } else if (wordEnd > maxLength * 0.8) {
    breakPoint = wordEnd
  }

  return {
    preview: cleanText.substring(0, breakPoint).trim() + "...",
    isTruncated: true,
    fullText: cleanText,
  }
}

/**
 * Get relevance indicator info
 */
function getRelevanceInfo(score: number): {
  color: string;
  bgColor: string;
  label: string
} {
  if (score >= 0.8) {
    return { color: "bg-success", bgColor: "bg-success/10", label: "Highly relevant" }
  }
  if (score >= 0.6) {
    return { color: "bg-warning", bgColor: "bg-warning/10", label: "Relevant" }
  }
  if (score >= 0.4) {
    return { color: "bg-warning/70", bgColor: "bg-warning/5", label: "Somewhat relevant" }
  }
  return { color: "bg-muted-foreground", bgColor: "bg-muted/50", label: "Low relevance" }
}

/**
 * Calculate optimal popover position
 */
function calculatePopoverPosition(
  triggerRect: DOMRect,
  popoverWidth: number = 340,
  popoverHeight: number = 280
): PopoverPosition {
  const padding = 16
  const spaceAbove = triggerRect.top
  const spaceBelow = window.innerHeight - triggerRect.bottom
  const spaceLeft = triggerRect.left
  const spaceRight = window.innerWidth - triggerRect.right

  // Determine vertical placement
  const placement = spaceAbove > popoverHeight + padding || spaceAbove > spaceBelow
    ? "above"
    : "below"

  // Calculate top position
  const top = placement === "above"
    ? triggerRect.top - popoverHeight - 8
    : triggerRect.bottom + 8

  // Determine horizontal alignment
  let horizontalAlign: "center" | "left" | "right" = "center"
  let left = triggerRect.left + (triggerRect.width / 2) - (popoverWidth / 2)

  if (left < padding) {
    horizontalAlign = "left"
    left = triggerRect.left
  } else if (left + popoverWidth > window.innerWidth - padding) {
    horizontalAlign = "right"
    left = triggerRect.right - popoverWidth
  }

  // Ensure within bounds
  left = Math.max(padding, Math.min(left, window.innerWidth - popoverWidth - padding))

  return { top, left, placement, horizontalAlign }
}

// ============================================================================
// CITATION BADGE COMPONENT
// ============================================================================

/**
 * The inline citation badge [1], [2], etc.
 * Handles both hover and click interactions with accessible keyboard navigation
 */
export function CitationPreview({
  citation,
  index,
  className,
  onViewSource
}: CitationPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showFullText, setShowFullText] = useState(false)
  const [copied, setCopied] = useState(false)
  const [position, setPosition] = useState<PopoverPosition | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Constants for hover delays
  const HOVER_DELAY = 200
  const CLOSE_DELAY = 150

  // Ensure we're mounted before rendering portal
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition(calculatePopoverPosition(rect))
    }
  }, [isOpen])

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition(calculatePopoverPosition(rect))
      }
    }

    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen])

  // Handle hover with delay
  const handleMouseEnter = useCallback(() => {
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
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setIsHovering(false)
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setShowFullText(false)
    }, CLOSE_DELAY)
  }, [])

  // Keep popover open when hovering over it
  const handlePopoverMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handlePopoverMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
      setShowFullText(false)
    }, CLOSE_DELAY)
  }, [])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false)
        setShowFullText(false)
      }
    }

    // Small delay to prevent immediate close on click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        setShowFullText(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Copy citation text
  const handleCopy = useCallback(async () => {
    const textToCopy = citation.text_preview || ""
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error("Failed to copy text")
    }
  }, [citation.text_preview])

  // Memoized text preview
  const { preview, isTruncated, fullText } = useMemo(
    () => formatTextPreview(citation.text_preview),
    [citation.text_preview]
  )

  const { colorClass, label: fileTypeLabel } = getFileIconInfo(citation.filename || "")
  const relevanceInfo = getRelevanceInfo(citation.score || 0)

  // Validate citation data - more lenient: accept if we have document_id (core requirement)
  // or any displayable content (filename, text_preview, or even just a score)
  const hasValidData = citation && (
    citation.document_id ||
    citation.filename ||
    (citation.text_preview && citation.text_preview.trim().length > 0)
  )

  // Handle missing/invalid citation
  if (!hasValidData) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "min-w-[1.25rem] h-[1.25rem] px-1",
          "text-[10px] font-bold",
          "rounded bg-muted/50 text-muted-foreground",
          "cursor-not-allowed",
          className
        )}
        title="Source unavailable"
      >
        {index}
      </span>
    )
  }

  // Derive display name: prefer filename, fall back to text preview snippet, then generic
  const displayName = citation.filename ||
    (citation.text_preview && citation.text_preview.trim().length > 10
      ? citation.text_preview.trim().substring(0, 30) + "..."
      : null) ||
    "Source document"

  return (
    <>
      {/* Citation Badge Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={cn(
          "inline-flex items-center justify-center",
          "min-w-[1.25rem] h-[1.25rem] px-1",
          "text-[10px] font-bold",
          "rounded-sm transition-all duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
          "cursor-pointer select-none align-middle",
          isOpen || isHovering
            ? "bg-primary text-primary-foreground shadow-md scale-110"
            : "bg-primary/20 text-primary hover:bg-primary/30 hover:scale-105",
          className
        )}
        aria-label={`View source ${index}: ${displayName}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {index}
      </button>

      {/* Popover Portal */}
      {isMounted && isOpen && position && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Citation preview for ${displayName}`}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
          className="fixed z-[9999] w-[340px] animate-in fade-in-0 zoom-in-95 duration-150"
          style={{
            top: position.top,
            left: position.left,
            transformOrigin: position.placement === "above" ? "bottom center" : "top center",
          }}
        >
          <div className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-muted/80 to-muted/40 border-b border-border/50">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-background/80 flex items-center justify-center border border-border/50 shadow-sm">
                  <FileText className={cn("w-4 h-4", colorClass)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold text-foreground truncate leading-tight"
                    title={displayName}
                  >
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                    <span>{fileTypeLabel}</span>
                    {citation.page_number != null && (
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
                  setShowFullText(false)
                }}
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close preview"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content Preview */}
            <div className="px-3 py-3">
              <div className="flex gap-2">
                <Quote className="w-4 h-4 text-primary/40 flex-shrink-0 mt-0.5" />
                <div className="flex-1 overflow-hidden">
                  <div
                    className={cn(
                      "text-sm text-foreground/90 leading-relaxed transition-all duration-200",
                      showFullText ? "max-h-60 overflow-y-auto pr-1" : "max-h-24 overflow-hidden"
                    )}
                  >
                    <p>{showFullText ? fullText : preview}</p>
                  </div>

                  {/* Read more / Show less toggle */}
                  {isTruncated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowFullText(!showFullText)
                      }}
                      className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {showFullText ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Read more
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 bg-muted/20 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Relevance indicator */}
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", relevanceInfo.color)} />
                  <span className="text-[11px] text-muted-foreground">
                    {relevanceInfo.label} ({Math.round((citation.score || 0) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Copy button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy()
                  }}
                  className="p-1.5 rounded-md hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                  aria-label={copied ? "Copied!" : "Copy citation text"}
                  title={copied ? "Copied!" : "Copy text"}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* View source button */}
                <button
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium group"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onViewSource) {
                      onViewSource(citation.document_id, citation.page_number)
                    }
                    setIsOpen(false)
                    setShowFullText(false)
                  }}
                >
                  <BookOpen className="w-3 h-3" />
                  View in source
                  <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Arrow Pointer */}
          <div
            className={cn(
              "absolute w-2.5 h-2.5 rotate-45 bg-popover border-border",
              position.placement === "above"
                ? "bottom-[-5px] border-r border-b"
                : "top-[-5px] border-l border-t"
            )}
            style={{
              left: position.horizontalAlign === "center"
                ? "calc(50% - 5px)"
                : position.horizontalAlign === "left"
                ? "20px"
                : "calc(100% - 30px)",
            }}
          />
        </div>,
        document.body
      )}
    </>
  )
}

// ============================================================================
// CITATION FOOTER COMPONENT
// ============================================================================

/**
 * Expandable footer showing all citations at the bottom of a message
 */
export function CitationFooter({
  citations,
  className,
  onViewSource
}: CitationFooterProps) {
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (!citations || citations.length === 0) return null

  // Show max 3 citations by default, expandable to show all
  const INITIAL_DISPLAY_COUNT = 3
  const displayedCitations = showAll ? citations : citations.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = citations.length > INITIAL_DISPLAY_COUNT

  return (
    <div className={cn("mt-5 pt-4 border-t border-border/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {citations.length} {citations.length === 1 ? "Source" : "Sources"} Referenced
          </span>
        </div>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
          >
            {showAll ? (
              <>
                Show less
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Show all ({citations.length})
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Citation List */}
      <div className="space-y-2">
        {displayedCitations.map((citation, idx) => {
          const actualIndex = showAll ? idx : idx
          const { preview, isTruncated, fullText } = formatTextPreview(citation.text_preview, 200)
          const { colorClass } = getFileIconInfo(citation.filename || "")
          const relevanceInfo = getRelevanceInfo(citation.score || 0)
          const isExpanded = expandedCitation === actualIndex
          // Derive display name for footer citations
          const footerDisplayName = citation.filename ||
            (citation.text_preview && citation.text_preview.trim().length > 10
              ? citation.text_preview.trim().substring(0, 30) + "..."
              : null) ||
            "Source document"

          return (
            <div
              key={citation.id || idx}
              className={cn(
                "rounded-lg border border-border/50 overflow-hidden transition-all duration-200",
                isExpanded ? "bg-muted/30 shadow-sm" : "hover:bg-muted/20"
              )}
            >
              {/* Collapsed View */}
              <button
                onClick={() => setExpandedCitation(isExpanded ? null : actualIndex)}
                className="w-full px-3 py-2.5 flex items-center gap-3 text-left"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/15 text-primary text-[11px] font-bold flex-shrink-0">
                  {actualIndex + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className={cn("w-3.5 h-3.5 flex-shrink-0", colorClass)} />
                    <p className="text-sm font-medium text-foreground truncate">
                      {footerDisplayName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {citation.page_number != null && (
                      <span className="text-xs text-muted-foreground">
                        Page {citation.page_number}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full", relevanceInfo.color)} />
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round((citation.score || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="ml-9">
                    <blockquote className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 italic">
                      &ldquo;{isExpanded ? fullText || preview : preview}&rdquo;
                    </blockquote>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className={cn("px-2 py-0.5 rounded text-[10px] font-medium", relevanceInfo.bgColor)}>
                        {relevanceInfo.label}
                      </div>
                      {onViewSource && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewSource(citation.document_id, citation.page_number)
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open source
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Show more button at bottom */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border/50 rounded-lg hover:border-border"
        >
          + {citations.length - INITIAL_DISPLAY_COUNT} more {citations.length - INITIAL_DISPLAY_COUNT === 1 ? "source" : "sources"}
        </button>
      )}
    </div>
  )
}

// ============================================================================
// INLINE CITATION RENDERER
// ============================================================================

/**
 * Component to render text with inline clickable citations
 * Parses text for citation patterns like [1], [2] and makes them interactive
 */
export function InlineCitationRenderer({
  text,
  citations,
  onViewSource
}: {
  text: string
  citations?: Citation[]
  onViewSource?: (documentId: string, pageNumber?: number | null) => void
}) {
  // Parse text and replace citation patterns with components
  const renderWithCitations = useMemo(() => {
    if (!citations || citations.length === 0) {
      return <span>{text}</span>
    }

    // Match patterns like [1], [2], **[1]**, etc.
    const citationPattern = /\*?\*?\[(\d+)\]\*?\*?/g
    const parts: (string | React.ReactNode)[] = []
    let lastIndex = 0
    let match

    while ((match = citationPattern.exec(text)) !== null) {
      // Add text before the citation
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      const citationIndex = parseInt(match[1], 10)
      // Handle both 0-indexed and 1-indexed citations
      const adjustedIndex = citationIndex === 0 ? 1 : citationIndex
      const citation = citations[adjustedIndex - 1]

      if (citation) {
        parts.push(
          <CitationPreview
            key={`${match.index}-${adjustedIndex}`}
            citation={citation}
            index={adjustedIndex}
            onViewSource={onViewSource}
            className="mx-0.5"
          />
        )
      } else {
        // Keep the original text if citation doesn't exist
        // Citation not found - render as inactive badge without tooltip
        parts.push(
          <span
            key={`missing-${match.index}`}
            className="inline-flex items-center justify-center min-w-[1.25rem] h-[1.25rem] px-1 text-[10px] font-bold rounded bg-muted/30 text-muted-foreground mx-0.5"
          >
            {adjustedIndex}
          </span>
        )
      }

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return <>{parts}</>
  }, [text, citations, onViewSource])

  return <>{renderWithCitations}</>
}

// ============================================================================
// MOBILE-FRIENDLY CITATION SHEET
// ============================================================================

interface CitationSheetProps {
  citation: Citation | null
  isOpen: boolean
  onClose: () => void
  onViewSource?: (documentId: string, pageNumber?: number | null) => void
}

/**
 * Full-screen citation sheet for mobile devices
 * Slides up from bottom for better touch interaction
 */
export function CitationSheet({
  citation,
  isOpen,
  onClose,
  onViewSource
}: CitationSheetProps) {
  const [showFullText, setShowFullText] = useState(false)
  const [copied, setCopied] = useState(false)

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setShowFullText(false)
      setCopied(false)
    }
  }, [isOpen])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!citation) return null

  const { preview, isTruncated, fullText } = formatTextPreview(citation.text_preview, 300)
  const { colorClass, label: fileTypeLabel } = getFileIconInfo(citation.filename || "")
  const relevanceInfo = getRelevanceInfo(citation.score || 0)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation.text_preview || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error("Failed to copy")
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[9999] bg-popover rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out",
          "max-h-[85vh] overflow-hidden",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/80 flex items-center justify-center">
              <FileText className={cn("w-5 h-5", colorClass)} />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground truncate max-w-[200px]">
                {citation.filename || "Unknown source"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{fileTypeLabel}</span>
                {citation.page_number != null && (
                  <>
                    <span className="text-muted-foreground/40">|</span>
                    <span>Page {citation.page_number}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="flex gap-3">
            <Quote className="w-5 h-5 text-primary/40 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {showFullText ? fullText : preview}
              </p>
              {isTruncated && (
                <button
                  onClick={() => setShowFullText(!showFullText)}
                  className="inline-flex items-center gap-1 mt-3 text-sm text-primary font-medium"
                >
                  {showFullText ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Read more
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/20 safe-area-inset-bottom">
          {/* Relevance */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("w-2.5 h-2.5 rounded-full", relevanceInfo.color)} />
            <span className="text-sm text-muted-foreground">
              {relevanceInfo.label} ({Math.round((citation.score || 0) * 100)}% match)
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy text
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (onViewSource) {
                  onViewSource(citation.document_id, citation.page_number)
                }
                onClose()
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              View source
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { CitationPreviewProps, CitationFooterProps, InlineCitationProps }
