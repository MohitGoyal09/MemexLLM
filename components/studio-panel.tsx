"use client"

import { useState, useEffect, useRef } from "react"
import {
  PanelRightClose,
  Plus,
  Headphones,
  Video,
  FileText,
  Pencil,
  MoreVertical,
  Trash2,
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
import { NoteEditor } from "@/components/note-editor"
import { notesApi } from "@/lib/api/notes"
import { toast } from "sonner"

interface StudioPanelProps {
  notebookId: string
  onCollapse: () => void
  onOpenView?: (type: "flashcards" | "quiz" | "mindmap", data: unknown) => void
  triggerTool?: string | null
  refreshKey?: number
  onSourceCreated?: () => void
  onExpandStudio?: () => void
  onResetStudioWidth?: () => void
}

export const studioTools = [
  {
    icon: AudioWaveform,
    label: "Audio",
    fullLabel: "Audio Overview",
    beta: false,
    // Purple theme for Audio
    bgColor: "bg-purple-900 dark:bg-purple-900/80",
    hoverBg: "hover:bg-purple-800 dark:hover:bg-purple-800/80",
    borderColor: "border-purple-700/50",
    iconColor: "text-purple-400",
  },
  {
    icon: Workflow,
    label: "Mind Map",
    fullLabel: "Mind Map",
    beta: false,
    // Teal/Cyan theme for Mind Map
    bgColor: "bg-teal-900 dark:bg-teal-900/80",
    hoverBg: "hover:bg-teal-800 dark:hover:bg-teal-800/80",
    borderColor: "border-teal-700/50",
    iconColor: "text-teal-400",
  },
  {
    icon: GalleryVerticalEnd,
    label: "Flashcards",
    fullLabel: "Flashcards",
    beta: false,
    // Blue theme for Flashcards
    bgColor: "bg-blue-900 dark:bg-blue-900/80",
    hoverBg: "hover:bg-blue-800 dark:hover:bg-blue-800/80",
    borderColor: "border-blue-700/50",
    iconColor: "text-blue-400",
  },
  {
    icon: BrainCircuit,
    label: "Quiz",
    fullLabel: "Quiz",
    beta: false,
    // Green theme for Quiz
    bgColor: "bg-emerald-900 dark:bg-emerald-900/80",
    hoverBg: "hover:bg-emerald-800 dark:hover:bg-emerald-800/80",
    borderColor: "border-emerald-700/50",
    iconColor: "text-emerald-400",
  },
]

export interface GeneratedItem {
  id: string
  title: string
  sourceCount: number
  timeAgo: string
  type: "quiz" | "audio" | "flashcards" | "mindmap" | "report" | "video" | "infographic" | "slides" | "table" | "note"
  status?: "pending" | "processing" | "completed" | "failed"
  isNew: boolean
  hasInteractive?: boolean
  content?: Record<string, unknown>
  audioUrl?: string | null
}

export function StudioPanel({ 
  notebookId, 
  onCollapse, 
  onOpenView, 
  triggerTool,
  refreshKey,
  onSourceCreated,
  onExpandStudio,
  onResetStudioWidth
}: StudioPanelProps) {
  const [activeView, setActiveView] = useState<"studio" | "note" | "flashcard" | "quiz">("studio")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [isConvertingNote, setIsConvertingNote] = useState(false)
  const [animatingTool, setAnimatingTool] = useState<string | null>(null)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<{ id: string; title: string; duration: string; url?: string } | null>(null)
  const [selectedItem, setSelectedItem] = useState<StudioItem | null>(null)
  const noteEditorRef = useRef<{ getContent: () => string } | null>(null)
  
  const isSavedResponse = noteTitle.startsWith("Chat Response")


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

  useEffect(() => {
    if (refreshKey) {
      refresh()
    }
  }, [refreshKey, refresh])

  // Convert note to source document
  const handleConvertToSource = async () => {
    // Get plain text content from HTML (strip tags) for validation
    const plainTextContent = noteContent.replace(/<[^>]*>/g, '').trim()

    if (!plainTextContent) {
      toast.error("Cannot convert empty note")
      return
    }

    setIsConvertingNote(true)
    try {
      // Generate a unique note ID for the conversion
      const noteId = selectedItem?.id || `note_${Date.now()}`
      const title = noteTitle.trim() || "Untitled Note"

      // Call the backend API to convert the note to a source
      // The backend will:
      // 1. Create a Document record
      // 2. Index the content in the vector store
      // 3. Make it searchable in the Sources tab
      const response = await notesApi.convertToSource(
        noteId,
        title,
        noteContent, // Send the HTML content - backend will strip tags
        notebookId
      )

      if (response.success) {
        // If this was an existing studio item (saved note), delete it from studio
        // since it's now a source
        if (selectedItem?.id) {
          await deleteContent(selectedItem.id)
        }

        // Clear the note and return to studio view
        setNoteTitle("")
        setNoteContent("")
        setSelectedItem(null)
        setActiveView("studio")
        onResetStudioWidth?.()

        toast.success("Note converted to source! It will appear in Sources once indexed.")
        onSourceCreated?.()
      } else {
        toast.error(response.message || "Failed to convert note to source")
      }
    } catch (error) {
      console.error("Failed to convert note to source:", error)
      toast.error("Failed to convert note to source")
    } finally {
      setIsConvertingNote(false)
    }
  }

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
      // Backend sends: { root: { label: string, children: [...] }, mermaid_syntax: string }
      // Component needs: { id: string, label: string, children?: MindMapNode[] }
      
      const mindmapContent = item.content as {
        root?: { label: string; children?: any[] }
        mermaid_syntax?: string
      }
      
      // Helper to add IDs recursively
      const addIds = (node: any, prefix: string = "node"): any => {
        return {
          id: `${prefix}-${node.label.replace(/\s+/g, "-").toLowerCase()}`,
          label: node.label,
          children: node.children?.map((child: any, idx: number) =>
            addIds(child, `${prefix}-${idx}`)
          ) || [],
        }
      }
      
      // Extract and transform the root node
      const rootNode = mindmapContent.root
        ? addIds(mindmapContent.root, "root")
        : { id: "root", label: "Mind Map", children: [] }
      
      onOpenView?.("mindmap", {
        title: item.title,
        sourceCount: item.sourceCount,
        rootNode,
        contentId: item.id, // Pass contentId
      })
    } else if (item.type === "audio") {
      const content = item.content as any
      const durationSeconds = content?.audio_duration
      
      const formatDuration = (sec?: number) => {
        if (!sec) return "--:--"
        const m = Math.floor(sec / 60)
        const s = Math.floor(sec % 60)
        return `${m}:${s.toString().padStart(2, "0")}`
      }

      setCurrentAudio({ 
        id: item.id,
        title: item.title, 
        duration: formatDuration(durationSeconds),
        url: item.audioUrl || undefined
      })
      setShowAudioPlayer(true)
    } else if (item.type === "note") {
      // Load note content into editor
      const noteData = item.content as { content: string }
      setNoteTitle(item.title)
      setNoteTitle(item.title)
      setNoteContent(noteData.content || "")
      setActiveView("note")
      onExpandStudio?.()
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
      note: FileText,
    }
    return iconMap[type] || NotebookText
  }

  const getItemIconStyle = (type: GeneratedItem["type"]) => {
    // Unique colors per type - matching the studio tool colors
    const styleMap: Record<string, { bg: string; icon: string }> = {
      audio: { bg: "bg-purple-500/15 dark:bg-purple-500/20", icon: "text-purple-600 dark:text-purple-400" },
      mindmap: { bg: "bg-teal-500/15 dark:bg-teal-500/20", icon: "text-teal-600 dark:text-teal-400" },
      flashcards: { bg: "bg-blue-500/15 dark:bg-blue-500/20", icon: "text-blue-600 dark:text-blue-400" },
      quiz: { bg: "bg-emerald-500/15 dark:bg-emerald-500/20", icon: "text-emerald-600 dark:text-emerald-400" },
      note: { bg: "bg-synapse-500/15 dark:bg-synapse-500/20", icon: "text-synapse-600 dark:text-synapse-500" },
      report: { bg: "bg-orange-500/15 dark:bg-orange-500/20", icon: "text-orange-600 dark:text-orange-400" },
      video: { bg: "bg-rose-500/15 dark:bg-rose-500/20", icon: "text-rose-600 dark:text-rose-400" },
      infographic: { bg: "bg-indigo-500/15 dark:bg-indigo-500/20", icon: "text-indigo-600 dark:text-indigo-400" },
      slides: { bg: "bg-amber-500/15 dark:bg-amber-500/20", icon: "text-amber-600 dark:text-amber-400" },
      table: { bg: "bg-cyan-500/15 dark:bg-cyan-500/20", icon: "text-cyan-600 dark:text-cyan-400" },
    }
    return styleMap[type] || { bg: "bg-synapse-500/15 dark:bg-synapse-500/20", icon: "text-synapse-600 dark:text-synapse-500" }
  }

  const getStatusBadge = (status?: string) => {
    if (!status || status === "completed") return null

    const statusStyles = {
      pending: "bg-warning/20 text-warning",
      processing: "bg-info/20 text-info",
      failed: "bg-destructive/20 text-destructive",
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
    // Backend schema uses 'cards' field with 'front'/'back' properties
    const content = selectedItem.content as { 
      cards?: Array<{ front: string; back: string }>
      flashcards?: Array<{ front: string; back: string; question?: string; answer?: string }> 
    }
    // Support both 'cards' (backend schema) and 'flashcards' (legacy)
    const cardArray = content.cards || content.flashcards || []
    return cardArray.map((fc, idx) => ({
      id: String(idx + 1),
      question: fc.front || (fc as any).question || "",
      answer: fc.back || (fc as any).answer || "",
    }))
  }

  // Get quiz questions from selected item content
  const getQuizFromContent = () => {
    if (!selectedItem?.content) return []
    const content = selectedItem.content as { questions?: Array<{ question: string; options: string[] | Array<{label: string, text: string}>; correct_answer: number | string; explanation?: string }> }
    
    return (content.questions || []).map((q, idx) => {
      // Map options: Backend sends objects {label, text}, Frontend expects strings
      const options = (q.options || []).map((opt: any) => {
        if (typeof opt === 'string') return opt
        if (typeof opt === 'object' && opt.text) return opt.text
        return String(opt)
      })

      // Map correct_answer: Backend sends string "A", "B", Frontend expects index 0, 1
      let correctAnswer = 0
      if (typeof q.correct_answer === 'number') {
        correctAnswer = q.correct_answer
      } else if (typeof q.correct_answer === 'string') {
         const clean = q.correct_answer.trim().toUpperCase()
         if (clean.length === 1) {
           correctAnswer = clean.charCodeAt(0) - 65 // 'A' (65) -> 0
         }
      }

      return {
        id: String(idx + 1),
        question: q.question,
        options: options,
        correctAnswer: correctAnswer,
      }
    })
  }

  if (activeView === "flashcard" && selectedItem) {
    return (
      <div className="w-full h-full rounded-2xl overflow-hidden bg-card flex flex-col shadow-sm border border-border/40">
        <FlashcardView
          title={selectedItem.title}
          sourceCount={selectedItem.sourceCount}
          flashcards={getFlashcardsFromContent()}
          contentId={selectedItem.id}
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
      <div className="w-full h-full rounded-2xl overflow-hidden bg-card flex flex-col shadow-sm border border-border/40">
        <QuizView
          title={selectedItem.title}
          sourceCount={selectedItem.sourceCount}
          questions={getQuizFromContent()}
          contentId={selectedItem.id}
          onBack={() => {
            setActiveView("studio")
            setSelectedItem(null)
          }}
        />
      </div>
    )
  }



  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-card flex flex-col relative shadow-sm border border-border/40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-synapse-500" />
            <button 
              onClick={() => {
                setActiveView("studio")
                setSelectedItem(null)
                setNoteTitle("")
                setNoteContent("")
                onResetStudioWidth?.()
              }} 
              className={`font-semibold hover:text-primary transition-colors ${activeView !== "studio" ? "text-muted-foreground" : ""}`}
            >
              Studio
            </button>
            {activeView === "note" && (
              <>
                <span className="text-muted-foreground">{">"}</span>
                <span className="text-sm">Note</span>
              </>
            )}
          </div>
          {activeView === "studio" && (
            <p className="text-xs text-muted-foreground mt-0.5 ml-7">
              Generate content from your sources
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCollapse} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
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
                      ${tool.hoverBg} active:scale-[0.98]
                      transition-all duration-200 ease-out
                      text-left group overflow-hidden
                      text-white dark:text-neural-100
                      ${animatingTool === tool.label ? "ring-2 ring-synapse-500 ring-offset-2 ring-offset-card" : ""}
                      ${generatingTool === tool.label ? "opacity-70" : ""}
                    `}
                  >
                    {animatingTool === tool.label && (
                      <div className="absolute inset-0 pointer-events-none">
                        <Sparkles className="absolute top-1 right-1 w-3 h-3 text-synapse-400 animate-ping" />
                        <Sparkles className="absolute bottom-1 left-1 w-3 h-3 text-synapse-400 animate-ping delay-100" />
                      </div>
                    )}

                    <tool.icon className={`w-5 h-5 ${tool.iconColor} flex-shrink-0`} />
                    <span className="text-sm font-medium flex-1">{tool.label}</span>
                    {tool.beta && (
                      <span className="absolute top-1.5 right-2 text-[9px] bg-synapse-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                        BETA
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generating Status - Removed to use list item state instead */}
            {/* {generatingTool && (
              <div className="mx-4 mb-4 flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Generating {generatingTool}...</p>
                  <p className="text-xs text-muted-foreground">This may take a moment</p>
                </div>
              </div>
            )} */}

            {/* Error Display */}
            {error && (
              <div className="mx-4 mb-4 flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
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
            <div className="px-4 py-4 space-y-2">
              {items.map((item) => {
                const ItemIcon = getItemIcon(item.type)
                const iconStyle = getItemIconStyle(item.type)
                const isProcessing = item.status === "pending" || item.status === "processing"
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl cursor-pointer
                      bg-surface-1 dark:bg-surface-2 border border-border/50
                      hover:bg-surface-2 dark:hover:bg-surface-3 hover:border-synapse-500/30
                      transition-all duration-200 group shadow-sm hover:shadow-md
                      ${item.isNew ? "animate-in fade-in slide-in-from-top-2 ring-2 ring-synapse-500/30" : ""}
                      ${isProcessing ? "opacity-80" : ""}
                      ${item.status === "failed" ? "opacity-60 border-destructive/30" : ""}
                    `}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${iconStyle.bg} flex items-center justify-center flex-shrink-0 border border-synapse-500/10`}
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
                      {item.type === "audio" && item.status === "completed" && (
                        <button className="p-1.5 rounded-full bg-synapse-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3 h-3 text-synapse-500 fill-synapse-500" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Floating Add Note Button */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <Button
              onClick={() => {
                setActiveView("note")
                onExpandStudio?.()
              }}
              className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border-none px-5 font-medium h-11 text-sm"
            >
              <FileText className="w-4 h-4" />
              Add note
            </Button>
          </div>

          {showAudioPlayer && currentAudio && (
            <AudioPlayerView
              title={currentAudio.title}
              duration={currentAudio.duration}
              url={currentAudio.url}
              contentId={currentAudio.id}
              onClose={() => setShowAudioPlayer(false)}
            />
          )}
        </>
      ) : activeView === "note" ? (
        <div className="flex flex-col h-full">

                {/* Note Editor Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="New Note"
                      disabled={isSavedResponse}
                      className="w-full text-lg font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 h-auto p-0 disabled:opacity-80 disabled:cursor-not-allowed"
                    />
                    {isSavedResponse && (
                      <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md w-fit">
                        (Saved responses are view only)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      if (selectedItem?.id) {
                        handleDeleteItem(e as any, selectedItem.id)
                        setActiveView("studio")
                        setSelectedItem(null)
                        onResetStudioWidth?.()
                      } else {
                        setNoteTitle("")
                        setNoteContent("")
                      }
                    }}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors group self-start"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                  </button>
                </div>

                {/* NoteEditor Component */}
                <div className="flex-1 overflow-hidden min-h-0">
                  <NoteEditor
                    initialTitle={noteTitle}
                    initialContent={noteContent}
                    showTitle={false}
                    readOnly={isSavedResponse}
              onSave={async (title, content) => {
                setNoteTitle(title)
                setNoteContent(content)
                
                try {
                  // Save as generated content (Studio Item)
                  // Use generationApi to create a "note" type content
                  // This keeps it in the "Studio" tab until explicitly converted
                  await import("@/lib/api/generation").then(({ generationApi }) => 
                    generationApi.createContent(
                      notebookId,
                      "note",
                      { content: content }, // Store HTML content in the JSON payload
                      title || "Untitled Note"
                    )
                  );
                  
                  toast.success("Note saved to Studio")
                  // Refresh list
                  refresh()
                } catch (error) {
                  console.error("Failed to save note:", error)
                  toast.error("Failed to save note")
                }
              }}
              onAutoSave={(title, content) => {
                setNoteTitle(title)
                setNoteContent(content)
              }}
              placeholder="Start writing your note..."
              className="h-full pb-24"
            />
          </div>

          {/* Convert Button - Floating */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-[200px]">
            <Button
              onClick={handleConvertToSource}
              disabled={isConvertingNote}
              variant="secondary"
              className="w-full justify-center gap-2 rounded-full font-medium shadow-xl border border-border/50"
            >
              {isConvertingNote ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Convert to source
                </>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
