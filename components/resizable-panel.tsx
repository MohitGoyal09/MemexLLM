"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"

interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth: number
  minWidth: number
  maxWidth: number
  side: "left" | "right"
  className?: string
  onResize?: (width: number) => void
}

export function ResizablePanel({
  children,
  defaultWidth,
  minWidth,
  maxWidth,
  side,
  className = "",
  onResize,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResize = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return

      const rect = panelRef.current.getBoundingClientRect()
      let newWidth: number

      if (side === "left") {
        newWidth = e.clientX - rect.left
      } else {
        newWidth = rect.right - e.clientX
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(newWidth)
      onResize?.(newWidth)
    },
    [isResizing, minWidth, maxWidth, side, onResize],
  )

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", resize)
      document.addEventListener("mouseup", stopResize)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", resize)
      document.removeEventListener("mouseup", stopResize)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, resize, stopResize])

  return (
    <div ref={panelRef} className={`relative flex-shrink-0 ${className}`} style={{ width }}>
      {children}

      {/* Resize Handle */}
      <div
        onMouseDown={startResize}
        className={`
          absolute top-0 bottom-0 w-1 cursor-col-resize
          hover:bg-primary/50 transition-colors z-10
          ${side === "left" ? "right-0" : "left-0"}
          ${isResizing ? "bg-primary/50" : "bg-transparent"}
        `}
      >
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-1 h-12
            rounded-full bg-muted-foreground/30 opacity-0 
            hover:opacity-100 transition-opacity
            ${side === "left" ? "right-0" : "left-0"}
          `}
        />
      </div>
    </div>
  )
}
