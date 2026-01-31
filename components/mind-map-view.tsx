"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import ReactFlow, {
  Node,
  Edge,
  Position,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Panel,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow"
import "reactflow/dist/style.css"
import dagre from "dagre"
import { toPng } from "html-to-image"
import {
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  Download,
  Plus,
  Minus,
  Maximize2,
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

// ----------------------------------------------------------------------
// 1. Custom Node Component (The "Pill" Style)
// ----------------------------------------------------------------------
// PERFORMANCE NOTE: ReactFlow handles canvas rendering internally with
// requestAnimationFrame and proper cleanup. Custom nodes should avoid
// expensive re-renders by using React.memo if needed.
const CustomNode = ({ data, isConnectable }: any) => {
  return (
    <div
      className={cn(
        "relative px-6 py-3 rounded-full border transition-all duration-300 min-w-[180px] text-center shadow-lg group",
        data.isRoot
          ? "bg-secondary border-border text-foreground font-medium text-lg tracking-tight shadow-black/20"
          : "bg-card border-border text-foreground/90 hover:border-primary/50 hover:bg-secondary"
      )}
      role="treeitem"
      aria-expanded={data.hasChildren ? data.expanded : undefined}
    >
      {/* Input Handle (Left) */}
      {!data.isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="!bg-muted-foreground !w-1 !h-1 !border-none opacity-0"
        />
      )}

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm">{data.label}</span>

        {/* Toggle Button */}
        {data.hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              data.onToggle(data.id)
            }}
            className="ml-2 p-0.5 rounded-full hover:bg-foreground/20 transition-colors"
            aria-label={data.expanded ? `Collapse ${data.label}` : `Expand ${data.label}`}
            aria-expanded={data.expanded}
          >
            {data.expanded ? (
              <Minus className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Plus className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Output Handle (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!bg-muted-foreground !w-1 !h-1 !border-none opacity-0"
      />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

// ----------------------------------------------------------------------
// 2. Dagre Layout Helper
// ----------------------------------------------------------------------
const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const isHorizontal = true
  dagreGraph.setGraph({ rankdir: isHorizontal ? "LR" : "TB", nodesep: 100, ranksep: 200 }) // Much more breathing room

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 240, height: 80 }) // Larger bounding box
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = isHorizontal ? Position.Left : Position.Top
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

    // We make sure to pass the computed position back
    node.position = {
      x: nodeWithPosition.x - 110, // center offset (width/2)
      y: nodeWithPosition.y - 30, // center offset (height/2)
    }
  })

  return { nodes, edges }
}

// ----------------------------------------------------------------------
// 3. Tree Flattener (Recursive -> Flat) with Expansion logic
// ----------------------------------------------------------------------
const flattenTree = (root: MindMapNode, expanded: Record<string, boolean>, onToggle: (id: string) => void) => {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const traverse = (node: MindMapNode, parentId: string | null = null) => {
    const isExpanded = expanded[node.id]
    const hasChildren = node.children && node.children.length > 0

    // Add Node
    nodes.push({
      id: node.id,
      type: "custom",
      data: { 
        label: node.label, 
        isRoot: !parentId,
        hasChildren,
        expanded: isExpanded,
        id: node.id,
        onToggle
      },
      position: { x: 0, y: 0 }, 
    })

    // Add Edge
    if (parentId) {
      edges.push({
        id: `e${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "default", // Organic bezier
        style: { stroke: "var(--border)", strokeWidth: 2, opacity: 0.5 },
        animated: false,
      })
    }

    // Only traverse children if expanded
    if (hasChildren && isExpanded) {
      node.children!.forEach((child) => traverse(child, node.id))
    }
  }

  traverse(root)
  return { layoutedNodes: nodes, layoutedEdges: edges }
}

// ----------------------------------------------------------------------
// 4. Main Component Wrapper
// ----------------------------------------------------------------------
// Inner component to access useReactFlow hook
function MindMapInner({
  title,
  sourceCount,
  onBack,
  rootNode,
  contentId,
}: MindMapViewProps) {
  // State for expanded nodes
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [rootNode.id]: true, // Root always expanded
  })

  // Toggle handler
  const handleToggle = useCallback((id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // Recalculate layout when expansion changes
  const { nodes: computedNodes, edges: computedEdges } = useMemo(() => {
    const { layoutedNodes, layoutedEdges } = flattenTree(rootNode, expanded, handleToggle)
    return getLayoutedElements(layoutedNodes, layoutedEdges)
  }, [rootNode, expanded, handleToggle])

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges)

  // Sync state when computed changes (layout update)
  useEffect(() => {
    setNodes(computedNodes)
    setEdges(computedEdges)
  }, [computedNodes, computedEdges, setNodes, setEdges])
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackRating | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const { fitView, zoomIn, zoomOut, getNodes } = useReactFlow()

  // Download Handler (Full Graph)
  const downloadImage = () => {
    const nodesBounds = getRectOfNodes(getNodes())
    const transform = getTransformForBounds(nodesBounds, nodesBounds.width, nodesBounds.height, 0.5, 2)
    
    const selector = ".react-flow__viewport"
    const element = document.querySelector(selector) as HTMLElement
    if (!element) return

    toPng(element, {
      backgroundColor: "var(--background)",
      width: nodesBounds.width + 100, // Add padding
      height: nodesBounds.height + 100,
      style: {
        width: `${nodesBounds.width + 100}px`,
        height: `${nodesBounds.height + 100}px`,
        transform: `translate(${50 - nodesBounds.x}px, ${50 - nodesBounds.y}px) scale(1)`,
      },
    }).then((dataUrl) => {
      const a = document.createElement("a")
      a.setAttribute("download", `${title.replace(/\s+/g, "_")}_mindmap.png`)
      a.setAttribute("href", dataUrl)
      a.click()
    })
  }

  // Handle feedback submission
  const handleFeedback = async (rating: FeedbackRating) => {
    if (!contentId || feedbackStatus === rating) return

    setIsSubmittingFeedback(true)
    try {
      await submitFeedback({
        content_type: "mindmap",
        content_id: contentId,
        rating: rating,
      })
      setFeedbackStatus(rating)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  // Center view on layout change but maintain readable zoom
  useEffect(() => {
    // We prefer to center on the root node at zoom 1, rather than fitting everything
    // But if we don't know root pos, fitView with maxZoom limit is good
    window.requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400, minZoom: 0.5, maxZoom: 1 }))
  }, [nodes.length, fitView])

  return (
    <div className="w-full h-full bg-background relative flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-8 z-20 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto space-y-1">
          <h2 className="text-3xl font-light text-foreground tracking-tight">{title}</h2>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
            <p className="text-sm text-muted-foreground font-medium">Based on {sourceCount} sources</p>
          </div>
        </div>
        <div className="flex items-center gap-1 pointer-events-auto bg-card/80 p-1 rounded-full border border-border/30 backdrop-blur-sm shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadImage}
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 w-8 h-8"
            aria-label="Download mind map as PNG"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" aria-hidden="true" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 w-8 h-8"
            aria-label="Close mind map view"
          >
            <Minimize2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={3}
        defaultEdgeOptions={{
          type: "default", // Bezier
          style: { stroke: "var(--border)", strokeWidth: 1.5 },
        }}
        className="bg-background"
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={40} size={1} color="var(--muted-foreground)" variant={("dots" as any)} className="opacity-20" />

        {/* Custom Controls Bottom Right */}
        <Panel position="bottom-right" className="mb-8 mr-8">
           <div className="flex flex-col bg-card/90 backdrop-blur-md border border-border rounded-full shadow-2xl p-1 gap-1" role="toolbar" aria-label="Mind map zoom controls">
             <Button
               variant="ghost"
               size="icon"
               className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 w-8 h-8"
               onClick={() => zoomIn({ duration: 300 })}
               aria-label="Zoom in"
             >
               <Plus className="w-4 h-4" aria-hidden="true" />
             </Button>
             <Button
               variant="ghost"
               size="icon"
               className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 w-8 h-8"
               onClick={() => zoomOut({ duration: 300 })}
               aria-label="Zoom out"
             >
               <Minus className="w-4 h-4" aria-hidden="true" />
             </Button>
             <Button
               variant="ghost"
               size="icon"
               className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 w-8 h-8"
               onClick={() => fitView({ duration: 800 })}
               aria-label="Fit to view"
             >
               <Maximize2 className="w-4 h-4" aria-hidden="true" />
             </Button>
           </div>
        </Panel>
      </ReactFlow>

      {/* Feedback Controls (Bottom Left) */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-2">
        <Button
          variant="outline"
          className={cn(
            "h-9 px-4 rounded-full bg-card/80 border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-all backdrop-blur-md",
            feedbackStatus === "thumbs_up" && "bg-success/10 border-success/50 text-success hover:bg-success/20"
          )}
          disabled={isSubmittingFeedback || !contentId}
          onClick={() => handleFeedback("thumbs_up")}
        >
          <ThumbsUp
            className={cn("w-3.5 h-3.5 mr-2", feedbackStatus === "thumbs_up" && "fill-current")}
          />{" "}
          Good
        </Button>
        <Button
          variant="outline"
          className={cn(
            "h-9 px-4 rounded-full bg-card/80 border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-all backdrop-blur-md",
            feedbackStatus === "thumbs_down" && "bg-destructive/10 border-destructive/50 text-destructive hover:bg-destructive/20"
          )}
          disabled={isSubmittingFeedback || !contentId}
          onClick={() => handleFeedback("thumbs_down")}
        >
          <ThumbsDown
            className={cn("w-3.5 h-3.5 mr-2", feedbackStatus === "thumbs_down" && "fill-current")}
          />{" "}
          Bad
        </Button>
      </div>
    </div>
  )
}

export function MindMapView(props: MindMapViewProps) {
  return (
    <ReactFlowProvider>
      <MindMapInner {...props} />
    </ReactFlowProvider>
  )
}



