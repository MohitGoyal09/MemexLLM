"use client"

import { useState } from "react"
import {
  Maximize2,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface MindMapNode {
  id: string
  label: string
  children?: MindMapNode[]
}

interface MindMapViewProps {
  title: string
  sourceCount: number
  rootNode: MindMapNode
  onBack: () => void
}

function MindMapNodeComponent({
  node,
  isRoot = false,
  expanded,
  onToggle,
}: {
  node: MindMapNode
  isRoot?: boolean
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded[node.id]

  return (
    <div className={`flex items-center ${isRoot ? "" : "ml-4"}`}>
      <div
        className={`
          px-4 py-3 rounded-lg border transition-all duration-200 shadow-sm
          ${
            isRoot
              ? "bg-slate-700 border-slate-600 text-foreground font-medium text-lg"
              : "bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-200"
          }
        `}
      >
        <span className="text-sm">{node.label}</span>
      </div>

      {hasChildren && (
        <>
          {/* Connector line */}
          <div className="w-8 h-px bg-slate-600" />

          {/* Expand/collapse button */}
          <button
            onClick={() => onToggle(node.id)}
            className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors z-10"
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </button>
        </>
      )}
    </div>
  )
}

export function MindMapView({ title, sourceCount, rootNode, onBack }: MindMapViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [rootNode.id]: true,
  })
  const [zoom, setZoom] = useState(100)

  const toggleNode = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="relative w-full h-full bg-[#1e1e1e] flex flex-col overflow-hidden group">
      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto space-y-1">
          <h2 className="text-2xl font-normal text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">Based on {sourceCount} sources</p>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10"
          >
            <Download className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10"
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 w-full h-full overflow-auto p-4 cursor-move active:cursor-grabbing">
        <div
          className="flex items-center justify-center min-h-full min-w-full"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center",
          }}
        >
          <div className="flex items-center">
            {/* Root Node */}
            <MindMapNodeComponent node={rootNode} isRoot expanded={expanded} onToggle={toggleNode} />

            {/* Children */}
            {expanded[rootNode.id] && rootNode.children && (
              <div className="flex flex-col gap-4 ml-4">
                {rootNode.children.map((child) => (
                  <div key={child.id} className="flex items-center">
                    {/* Connector line */}
                    <div className="w-4 h-px bg-slate-600" />

                    <div
                      className="px-4 py-3 rounded-lg bg-slate-800/90 border border-slate-700 
                        hover:border-slate-500 transition-all duration-200 flex items-center gap-3 shadow-sm"
                    >
                      <span className="text-sm text-slate-200">{child.label}</span>
                      {child.children && child.children.length > 0 && (
                        <button
                          onClick={() => toggleNode(child.id)}
                          className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 border border-slate-600"
                        >
                          <ChevronRight
                            className={`w-3 h-3 transition-transform ${expanded[child.id] ? "rotate-90" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Feedback */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
        <Button variant="secondary" size="sm" className="gap-2 rounded-full bg-[#2d2d2d] border border-white/5 hover:bg-[#3d3d3d] text-white">
          <ThumbsUp className="w-4 h-4" />
          Good content
        </Button>
        <Button variant="secondary" size="sm" className="gap-2 rounded-full bg-[#2d2d2d] border border-white/5 hover:bg-[#3d3d3d] text-white">
          <ThumbsDown className="w-4 h-4" />
          Bad content
        </Button>
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1 bg-[#2d2d2d] rounded-lg p-1 border border-white/5 shadow-lg">
        <button
          onClick={() => setZoom(Math.min(150, zoom + 10))}
          className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
        <div className="h-px bg-white/10 mx-1 my-0.5" />
        <button
          onClick={() => setZoom(Math.min(150, zoom + 10))}
          className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
