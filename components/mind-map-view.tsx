"use client"

import { useState, useRef, useEffect } from "react"
import {
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Plus,
  Minus,
  Download,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitFeedback } from "@/lib/api/feedback"
import type { FeedbackRating } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
}

interface MindMapViewProps {
  title: string
  sourceCount: number
  rootNode: MindMapNode
  contentId?: string
  onBack: () => void
}

// Branch Node Component
function MindMapNodeComponent({
  node,
  isRoot = false,
  isFirst = false,
  isLast = false,
  isOnly = false,
  level = 0,
  expanded,
  onToggle,
}: {
  node: MindMapNode
  isRoot?: boolean
  isFirst?: boolean
  isLast?: boolean
  isOnly?: boolean
  level?: number
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded[node.id]

  // NotebookLLM Style Colors
  const nodeStyles = isRoot
    ? "bg-[#1e293b] border-[#334155] text-white shadow-lg shadow-black/20"
    : "bg-[#0f172a] border-[#1e293b] text-slate-200 hover:border-slate-700 hover:bg-[#1e293b] transition-colors"

  return (
    <div className="flex">
      {/* 
        Strict Flex Row:
        [Connector] [Content] [Children Column]
        
        CRITICAL: 
        - The `Connector` must determine the vertical connectivity.
        - We use a CSS-based approach for 'Curly Brackets'.
        - To avoid gaps, the outer wrapper has NO vertical padding/margin.
        - Visual spacing is handled inside the Content Wrapper.
      */}
      
      {/* Connector (The branch entering this node) */}
      {!isRoot && (
        <div className="w-16 relative shrink-0">
          {/* 
             Curly Bracket Logic:
             We use absolute divs to draw the lines.
             The vertical spine must align perfectly with siblings.
          */}
          
          {/* Horizontal Entry Line (Connecting to node) */}
          {/* Starts from the curve end and touches the node */}
          <div className="absolute right-0 top-1/2 w-8 h-px bg-slate-700 -translate-y-[0.5px]" />

          {/* Vertical Spine & Curves */}
          {isOnly ? (
             // Single child: Straight horizontal line from parent to here
             <div className="absolute left-0 top-1/2 w-16 h-px bg-slate-700 -translate-y-[0.5px]" />
          ) : (
            <>
              {/* Upper Vertical Line (From top to center) */}
              {/* For first node: starts at 50% (center) going down? No, first node is top. 
                  It needs to connect to the parent (which is vertically 'centered' relative to the group).
                  Actually in this recursive layout:
                  The 'Parent' output is at the vertical center of the Children Column.
                  So the vertical spine runs along the LEFT edge of this block (left=0).
              */}
              
              {/* Line Segments */}
              
              {/* 1. Upper Spine Segment */}
              {!isFirst && (
                <div className="absolute left-0 top-0 h-[50%] w-px bg-slate-700" />
              )}
              
              {/* 2. Lower Spine Segment */}
              {!isLast && (
                 <div className="absolute left-0 top-1/2 h-[50%] w-px bg-slate-700" />
              )}
              
              {/* 3. The Curve */}
              {/* If First: Curve from Bottom-Left (Spine) to Right */}
              {isFirst && (
                <div className="absolute left-0 bottom-0 w-8 h-[50%] border-l border-t border-slate-700 rounded-tl-[32px] -translate-y-[0.5px]" />
              )}
              
              {/* If Last: Curve from Top-Left (Spine) to Right */}
              {isLast && (
                <div className="absolute left-0 top-0 w-8 h-[50%] border-l border-b border-slate-700 rounded-bl-[32px] translate-y-[0.5px]" />
              )}
              
              {/* If Middle: T-Junction - Straight Horizontal line from Spine */}
              {!isFirst && !isLast && (
                <div className="absolute left-0 top-1/2 w-8 h-px bg-slate-700 -translate-y-[0.5px]" />
              )}
            </>
          )}
        </div>
      )}

      {/* Node Content Wrapper */}
      {/* Visual Spacing added here (py-2) to separate nodes vertically without breaking connection lines */ }
      <div className={`flex items-center group py-2 ${!isRoot ? 'pl-0' : ''}`}>
        
        {/* Node Card - Pill Shaped */}
        <div
          className={`
            relative z-10 flex items-center gap-3 px-6 py-3.5 rounded-full border 
            transition-all duration-300 select-none cursor-pointer
            ${nodeStyles}
            ${hasChildren ? 'pr-4' : 'pr-6'}
          `}
          style={{
             minWidth: isRoot ? '220px' : '180px',
             maxWidth: '360px'
          }}
          onClick={(e) => {
             // Allow clicking the whole card to toggle if desired, or just select
             e.stopPropagation()
             // Optional: selectNode(node.id)
          }}
        >
          <span className={`truncate text-sm ${isRoot ? 'font-medium text-lg tracking-tight' : 'font-normal tracking-normal'}`}>
            {node.label}
          </span>
          
          {/* Use the whole right side for the toggle if implies expansion */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle(node.id)
              }}
              className={`
                flex items-center justify-center w-6 h-6 rounded-full
                hover:bg-white/10 transition-colors
                ${isExpanded ? 'bg-transparent' : ''}
              `}
            >
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isExpanded ? "rotate-0" : "" 
                }`} 
              />
            </button>
          )}
        </div>

        {/* Output Line (Parent to Children) */}
        {hasChildren && isExpanded && (
           <div className="w-16 h-px bg-slate-700" />
        )}
      </div>

      {/* Children Column */}
      {/* No vertical gap here; specific padding inside children handles spacing */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {node.children!.map((child, idx, arr) => (
            <MindMapNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              isFirst={idx === 0}
              isLast={idx === arr.length - 1}
              isOnly={arr.length === 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}


export function MindMapView({ title, sourceCount, rootNode, contentId, onBack }: MindMapViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [rootNode.id]: true,
  })
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackRating | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  // Handle feedback submission
  const handleFeedback = async (rating: FeedbackRating) => {
    if (!contentId || feedbackStatus === rating) return

    setIsSubmittingFeedback(true)
    try {
      await submitFeedback({
        content_type: "mindmap",
        content_id: contentId,
        rating: rating
      })
      setFeedbackStatus(rating)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }
  
  // Pan and Zoom State
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)

  const toggleNode = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const expandAll = () => {
    const allIds: Record<string, boolean> = {}
    const collectIds = (node: MindMapNode) => {
      allIds[node.id] = true
      node.children?.forEach(collectIds)
    }
    collectIds(rootNode)
    setExpanded(allIds)
  }

  const collapseAll = () => {
    setExpanded({ [rootNode.id]: true })
  }

  // Mouse Event Handlers for Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
    if (containerRef.current) containerRef.current.style.cursor = "grabbing"
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - lastMousePos.x
    const dy = e.clientY - lastMousePos.y
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (containerRef.current) containerRef.current.style.cursor = "grab"
  }

  useEffect(() => {
     // Center nicely
     setPan({ x: 150, y: window.innerHeight / 2 - 50 }) 
  }, [])

  return (
    <div className="relative w-full h-full bg-[#030712] flex flex-col overflow-hidden text-slate-200 selection:bg-indigo-500/30">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto space-y-1">
          <h2 className="text-3xl font-light text-slate-100 tracking-tight">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            <p className="text-sm text-slate-400 font-medium">Based on {sourceCount} sources</p>
          </div>
        </div>
        <div className="flex items-center gap-1 pointer-events-auto bg-[#0f172a]/50 p-1 rounded-full border border-white/5 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={expandAll} className="rounded-full text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={collapseAll} className="rounded-full text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8">
            <Download className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8">
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -10 : 10
            setZoom((z) => Math.max(10, Math.min(200, z + delta)))
          } else {
             setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
          }
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: "0 0",
            transition: isDragging ? "none" : "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)", 
            willChange: "transform",
          }}
          className="absolute top-0 left-0 w-max h-max p-40"
        >
          <MindMapNodeComponent
            node={rootNode}
            isRoot
            expanded={expanded}
            onToggle={toggleNode}
          />
        </div>
        
        {/* Subtle Node-Link Dot Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            transform: `translate(${pan.x % 32}px, ${pan.y % 32}px)`
          }}
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-2">
        <Button
          variant="outline"
          className={cn(
            "h-9 px-4 rounded-full bg-[#0f172a]/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-md",
            feedbackStatus === "thumbs_up" && "bg-green-900/30 border-green-700 text-green-400 hover:bg-green-900/50"
          )}
          disabled={isSubmittingFeedback || !contentId}
          onClick={() => handleFeedback("thumbs_up")}
        >
          <ThumbsUp className={cn("w-3.5 h-3.5 mr-2", feedbackStatus === "thumbs_up" && "fill-current")} /> Good
        </Button>
        <Button
          variant="outline"
          className={cn(
            "h-9 px-4 rounded-full bg-[#0f172a]/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-md",
            feedbackStatus === "thumbs_down" && "bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50"
          )}
          disabled={isSubmittingFeedback || !contentId}
          onClick={() => handleFeedback("thumbs_down")}
        >
          <ThumbsDown className={cn("w-3.5 h-3.5 mr-2", feedbackStatus === "thumbs_down" && "fill-current")} /> Bad
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-full shadow-2xl p-1 gap-1">
        <button className="p-2.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" onClick={() => setZoom(z => Math.min(200, z + 10))}>
          <Plus className="w-4 h-4" />
        </button>
        <button className="p-2.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" onClick={() => setZoom(z => Math.max(10, z - 10))}>
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}


