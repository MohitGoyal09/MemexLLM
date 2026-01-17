"use client"

import { useState } from "react"
import {
  Maximize2,
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
          px-4 py-3 rounded-lg border transition-all duration-200
          ${
            isRoot
              ? "bg-slate-700 border-slate-600 text-foreground font-medium"
              : "bg-slate-800/80 border-slate-700 hover:border-slate-600"
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
            className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors"
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-secondary rounded">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-1 hover:bg-secondary rounded">
              <Download className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <p className="text-sm text-primary">Based on {sourceCount} sources</p>
      </div>

      {/* Mind Map Canvas */}
      <div className="flex-1 overflow-auto p-8 relative">
        <div
          className="flex items-center justify-center min-h-full"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
        >
          <div className="flex items-center">
            {/* Root Node */}
            <MindMapNodeComponent node={rootNode} isRoot expanded={expanded} onToggle={toggleNode} />

            {/* Children */}
            {expanded[rootNode.id] && rootNode.children && (
              <div className="flex flex-col gap-3 ml-4">
                {rootNode.children.map((child) => (
                  <div key={child.id} className="flex items-center">
                    {/* Connector line */}
                    <div className="w-4 h-px bg-slate-600" />

                    <div
                      className="px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700 
                        hover:border-slate-600 transition-all duration-200 flex items-center gap-3"
                    >
                      <span className="text-sm">{child.label}</span>
                      {child.children && child.children.length > 0 && (
                        <button
                          onClick={() => toggleNode(child.id)}
                          className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center hover:bg-slate-600"
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

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="h-px" />
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedback */}
      <div className="p-4 border-t border-border flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2 rounded-full bg-transparent">
          <ThumbsUp className="w-4 h-4" />
          Good content
        </Button>
        <Button variant="outline" size="sm" className="gap-2 rounded-full bg-transparent">
          <ThumbsDown className="w-4 h-4" />
          Bad content
        </Button>
      </div>
    </div>
  )
}
