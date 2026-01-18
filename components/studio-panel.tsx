"use client"

import { useState, useEffect } from "react"
import {
  PanelRightClose,
  Plus,
  Headphones,
  Video,
  FileText,
  Pencil,
  MoreVertical,
  Trash2,
  Undo,
  Redo,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Wand2,
  Play,
  Loader2,
  Sparkles,
  BarChart2,
  Presentation,
  Table2,
  CircleHelp,
  Layers,
  BookOpen,
  Network,
  MonitorPlay,
  Workflow,
  NotebookText,
  GalleryVerticalEnd,
  BrainCircuit,
  ChartPie,
  AudioWaveform,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AudioPlayerView } from "@/components/audio-player-view"
import { FlashcardView } from "@/components/flashcard-view"
import { QuizView } from "@/components/quiz-view"
import { useStudio, StudioItem } from "@/hooks/use-studio"

interface StudioPanelProps {
  notebookId: string
  onCollapse: () => void
  onOpenView?: (type: "flashcards" | "quiz" | "mindmap", data: unknown) => void
  triggerTool?: string | null
}

export const studioTools = [
  {
    icon: AudioWaveform,
    label: "Audio",
    fullLabel: "Audio Overview",
    beta: false,
    bgColor: "bg-[#2a1f3d]",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    icon: Workflow,
    label: "Mind Map",
    fullLabel: "Mind Map",
    beta: false,
    bgColor: "bg-[#1f2a3d]",
    borderColor: "border-violet-500/30",
    iconColor: "text-violet-400",
  },
  {
    icon: GalleryVerticalEnd,
    label: "Flashcards",
    fullLabel: "Flashcards",
    beta: false,
    bgColor: "bg-[#1f2d3d]",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: BrainCircuit,
    label: "Quiz",
    fullLabel: "Quiz",
    beta: false,
    bgColor: "bg-[#2a3d1f]",
    borderColor: "border-lime-500/30",
    iconColor: "text-lime-400",
  },
]

export interface GeneratedItem {
  id: string
  title: string
  sourceCount: number
  timeAgo: string
  type: "quiz" | "audio" | "flashcards" | "mindmap" | "report" | "video" | "infographic" | "slides" | "table"
  status?: "pending" | "processing" | "completed" | "failed"
  isNew: boolean
  hasInteractive?: boolean
  content?: Record<string, unknown>
  audioUrl?: string | null
}

export function StudioPanel({ notebookId, onCollapse, onOpenView, triggerTool }: StudioPanelProps) {
  const [activeView, setActiveView] = useState<"studio" | "note" | "flashcard" | "quiz">("studio")
  const [noteContent, setNoteContent] = useState("")
  const [animatingTool, setAnimatingTool] = useState<string | null>(null)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<{ title: string; duration: string; url?: string } | null>(null)
  const [selectedItem, setSelectedItem] = useState<StudioItem | null>(null)

  // Use real API hook
  const { items, loading, error, generatingTool, generateContent, deleteContent, refresh } = useStudio({
    notebookId,
    pollInterval: 2000,
  })

  useEffect(() => {
    if (triggerTool) {
      if (activeView !== "studio") setActiveView("studio")
      handleToolClick(triggerTool)
    }
  }, [triggerTool])

  const handleToolClick = async (toolLabel: string) => {
    setAnimatingTool(toolLabel)

    setTimeout(() => {
      setAnimatingTool(null)
    }, 400)

    // Trigger real API generation
    await generateContent(toolLabel)
  }

  const handleItemClick = (item: StudioItem) => {
    // Don't open if still processing
    if (item.status === "pending" || item.status === "processing") {
      return
    }

    setSelectedItem(item)

    if (item.type === "flashcards" && item.content) {
      setActiveView("flashcard")
    } else if (item.type === "quiz" && item.content) {
      setActiveView("quiz")
    } else if (item.type === "mindmap" && item.content) {
      onOpenView?.("mindmap", { 
        title: item.title, 
        sourceCount: item.sourceCount, 
        rootNode: item.content 
      })
    } else if (item.type === "audio") {
      setCurrentAudio({ 
        title: item.title, 
        duration: "16:18",
        url: item.audioUrl || undefined
      })
      setShowAudioPlayer(true)
    }
  }

  const handleDeleteItem = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    await deleteContent(itemId)
  }

  const getItemIcon = (type: GeneratedItem["type"]) => {
    const iconMap = {
      quiz: BrainCircuit,
      audio: AudioWaveform,
      flashcards: GalleryVerticalEnd,
      mindmap: Workflow,
      report: NotebookText,
      video: MonitorPlay,
      infographic: ChartPie,
      slides: Presentation,
      table: Table2,
    }
    return iconMap[type] || NotebookText
  }

  const getItemIconStyle = (type: GeneratedItem["type"]) => {
    const styleMap = {
      quiz: { bg: "bg-lime-500/20", icon: "text-lime-400" },
      audio: { bg: "bg-purple-500/20", icon: "text-purple-400" },
      flashcards: { bg: "bg-blue-500/20", icon: "text-blue-400" },
      mindmap: { bg: "bg-violet-500/20", icon: "text-violet-400" },
      report: { bg: "bg-emerald-500/20", icon: "text-emerald-400" },
      video: { bg: "bg-cyan-500/20", icon: "text-cyan-400" },
      infographic: { bg: "bg-orange-500/20", icon: "text-orange-400" },
      slides: { bg: "bg-teal-500/20", icon: "text-teal-400" },
      table: { bg: "bg-green-500/20", icon: "text-green-400" },
    }
    return styleMap[type] || { bg: "bg-muted", icon: "text-muted-foreground" }
  }

  const getStatusBadge = (status?: string) => {
    if (!status || status === "completed") return null
    
    const statusStyles = {
      pending: "bg-yellow-500/20 text-yellow-400",
      processing: "bg-blue-500/20 text-blue-400",
      failed: "bg-red-500/20 text-red-400",
    }
    
    return (
      <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${statusStyles[status as keyof typeof statusStyles] || ""}`}>
        {status === "processing" && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
        {status === "failed" && <AlertCircle className="w-3 h-3 inline mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // Get flashcards from selected item content
  const getFlashcardsFromContent = () => {
    if (!selectedItem?.content) return []
    const content = selectedItem.content as { flashcards?: Array<{ question: string; answer: string }> }
    return (content.flashcards || []).map((fc, idx) => ({
      id: String(idx + 1),
      question: fc.question,
      answer: fc.answer,
    }))
  }

  // Get quiz questions from selected item content
  const getQuizFromContent = () => {
    if (!selectedItem?.content) return []
    const content = selectedItem.content as { questions?: Array<{ question: string; options: string[]; correct_answer: number; explanation?: string }> }
    return (content.questions || []).map((q, idx) => ({
      id: String(idx + 1),
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
    }))
  }

  if (activeView === "flashcard" && selectedItem) {
    return (
      <div className="w-full h-full border-l border-border bg-card flex flex-col">
        <FlashcardView
          title={selectedItem.title}
          sourceCount={selectedItem.sourceCount}
          flashcards={getFlashcardsFromContent()}
          onBack={() => {
            setActiveView("studio")
            setSelectedItem(null)
          }}
        />
      </div>
    )
  }

  if (activeView === "quiz" && selectedItem) {
    return (
      <div className="w-full h-full border-l border-border bg-card flex flex-col">
        <QuizView
          title={selectedItem.title}
          sourceCount={selectedItem.sourceCount}
          questions={getQuizFromContent()}
          onBack={() => {
            setActiveView("studio")
            setSelectedItem(null)
          }}
        />
      </div>
    )
  }



  return (
    <div className="w-full h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Studio</h2>
          {activeView === "note" && (
            <>
              <span className="text-muted-foreground">{">"}</span>
              <span className="text-sm">Note</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setActiveView("studio")} className="p-1 hover:bg-secondary rounded transition-colors">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </button>
          <button onClick={onCollapse} className="p-1 hover:bg-secondary rounded transition-colors">
            <PanelRightClose className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {activeView === "studio" ? (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {studioTools.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => handleToolClick(tool.label)}
                    disabled={generatingTool === tool.label}
                    className={`
                      relative flex items-center gap-3 p-3 rounded-xl
                      ${tool.bgColor} border ${tool.borderColor}
                      hover:brightness-110 active:scale-[0.98]
                      transition-all duration-200 ease-out
                      text-left group overflow-hidden
                      ${animatingTool === tool.label ? "animate-bounce scale-105 ring-2 ring-primary" : ""}
                      ${generatingTool === tool.label ? "opacity-70" : ""}
                    `}
                  >
                    {animatingTool === tool.label && (
                      <div className="absolute inset-0 pointer-events-none">
                        <Sparkles className="absolute top-1 right-1 w-3 h-3 text-yellow-400 animate-ping" />
                        <Sparkles className="absolute bottom-1 left-1 w-3 h-3 text-yellow-400 animate-ping delay-100" />
                      </div>
                    )}

                    <tool.icon className={`w-5 h-5 ${tool.iconColor} flex-shrink-0`} />
                    <span className="text-xs font-medium flex-1">{tool.label}</span>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    {tool.beta && (
                      <span className="absolute top-1.5 right-6 text-[9px] bg-primary/40 text-primary px-1 py-0.5 rounded font-medium">
                        BETA
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generating Status */}
            {generatingTool && (
              <div className="mx-4 mb-4 flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Generating {generatingTool}...</p>
                  <p className="text-xs text-muted-foreground">This may take a moment</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mx-4 mb-4 flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Divider */}
            <div className="mx-4 border-t border-border" />

            {/* Loading State */}
            {loading && items.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Sparkles className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No generated content yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                  Click a tool above to generate content from your notebook
                </p>
              </div>
            )}

            {/* Generated Items List */}
            <div className="px-4 py-4 space-y-1">
              {items.map((item) => {
                const ItemIcon = getItemIcon(item.type)
                const iconStyle = getItemIconStyle(item.type)
                const isProcessing = item.status === "pending" || item.status === "processing"
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`
                      flex items-center gap-3 p-2.5 rounded-lg cursor-pointer
                      hover:bg-secondary/80 transition-all duration-300 group
                      ${item.isNew ? "animate-in fade-in slide-in-from-top-2 bg-primary/5 border border-primary/20" : ""}
                      ${isProcessing ? "opacity-70" : ""}
                      ${item.status === "failed" ? "opacity-60" : ""}
                    `}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${iconStyle.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      {isProcessing ? (
                        <Loader2 className={`w-4 h-4 ${iconStyle.icon} animate-spin`} />
                      ) : (
                        <ItemIcon className={`w-4 h-4 ${iconStyle.icon}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sourceCount} sources · {item.timeAgo}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getStatusBadge(item.status)}
                      {item.hasInteractive && item.status === "completed" && (
                        <span className="px-2 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full font-medium">
                          Interactive
                        </span>
                      )}
                      {item.type === "audio" && item.status === "completed" && (
                        <button className="p-1.5 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3 h-3 text-primary fill-primary" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Note Button */}
          <div className="p-4 border-t border-border mt-auto">
            <Button
              onClick={() => setActiveView("note")}
              variant="outline"
              className="w-full justify-center gap-2 rounded-full bg-background hover:bg-secondary"
            >
              <BookOpen className="w-4 h-4" />
              Add note
            </Button>
          </div>

          {showAudioPlayer && currentAudio && (
            <AudioPlayerView
              title={currentAudio.title}
              duration={currentAudio.duration}
              onClose={() => setShowAudioPlayer(false)}
            />
          )}
        </>
      ) : activeView === "note" ? (
        <>
          {/* Note Editor */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">New Note</h3>
              <button className="p-1 hover:bg-secondary rounded transition-colors">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 mb-4 flex-wrap">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Redo className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <select className="bg-secondary text-sm px-2 py-1 rounded">
                <option>Normal</option>
                <option>Heading 1</option>
                <option>Heading 2</option>
              </select>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Link className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Editor */}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start writing..."
              className="w-full h-64 bg-transparent resize-none outline-none text-sm"
            />
          </div>

          {/* Convert Button */}
          <div className="mt-auto p-4 border-t border-border">
            <Button className="w-full justify-center gap-2 rounded-full">
              <FileText className="w-4 h-4" />
              Convert to source
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
