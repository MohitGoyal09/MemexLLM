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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AudioPlayerView } from "@/components/audio-player-view"
import { FlashcardView } from "@/components/flashcard-view"
import { QuizView } from "@/components/quiz-view"

interface StudioPanelProps {
  onCollapse: () => void
  onOpenView?: (type: "flashcards" | "quiz" | "mindmap", data: any) => void
  triggerTool?: string | null
}

export const studioTools = [
  {
    icon: AudioWaveform,
    label: "Audio Overview",
    beta: false,
    bgColor: "bg-[#2a1f3d]",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    icon: Workflow,
    label: "Mind Map",
    beta: false,
    bgColor: "bg-[#1f2a3d]",
    borderColor: "border-violet-500/30",
    iconColor: "text-violet-400",
  },
  {
    icon: GalleryVerticalEnd,
    label: "Flashcards",
    beta: false,
    bgColor: "bg-[#1f2d3d]",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: BrainCircuit,
    label: "Quiz",
    beta: false,
    bgColor: "bg-[#2a3d1f]",
    borderColor: "border-lime-500/30",
    iconColor: "text-lime-400",
  },
]

// Sample data for generated content
const sampleFlashcards = [
  {
    id: "1",
    question: "In the context of recommender systems, what is the 'item cold-start problem'?",
    answer:
      "The item cold-start problem refers to the difficulty in recommending new items that have no or very few user interactions, making it challenging for the system to learn user preferences for these items.",
  },
  {
    id: "2",
    question: "What is collaborative filtering in recommender systems?",
    answer:
      "Collaborative filtering is a technique that makes automatic predictions about a user's interests by collecting preferences from many users, assuming that if users agreed in the past, they will agree in the future.",
  },
  {
    id: "3",
    question: "What is the difference between content-based and collaborative filtering?",
    answer:
      "Content-based filtering recommends items similar to those a user liked before based on item features, while collaborative filtering recommends items that similar users liked, without needing item features.",
  },
]

const sampleQuizQuestions = [
  {
    id: "1",
    question:
      "According to Saini and Singh (2024), what specific 'bare minimum' information is leveraged in their self-supervised learning paradigm to address the item cold-start problem?",
    options: [
      "Product title and product description",
      "High-resolution product images and pricing",
      "User browsing history and purchase data",
      "Social media mentions and reviews",
    ],
    correctAnswer: 0,
  },
  {
    id: "2",
    question: "What is the primary advantage of using transformers in recommender systems?",
    options: [
      "Lower computational cost",
      "Better handling of sequential data and attention mechanisms",
      "Simpler implementation",
      "Reduced training time",
    ],
    correctAnswer: 1,
  },
]

const sampleMindMapData = {
  id: "root",
  label: "Advanced Recommender Systems Research",
  children: [
    { id: "1", label: "Architectures and Models", children: [] },
    { id: "2", label: "Data Sources and Features", children: [] },
    { id: "3", label: "Challenges and Solutions", children: [] },
    { id: "4", label: "Evaluation Metrics", children: [] },
  ],
}

export interface GeneratedItem {
  id: string
  title: string
  sourceCount: number
  timeAgo: string
  type: "quiz" | "audio" | "flashcards" | "mindmap" | "report" | "video" | "infographic" | "slides" | "table"
  isNew: boolean
  hasInteractive?: boolean
}

export const sampleGeneratedItems: GeneratedItem[] = [
  {
    id: "1",
    title: "Recommender Quiz",
    sourceCount: 5,
    timeAgo: "13m ago",
    type: "quiz",
    isNew: false,
  },
  {
    id: "2",
    title: "How Algorithms Read See And Predict Disappointment",
    sourceCount: 5,
    timeAgo: "14m ago",
    type: "audio",
    isNew: false,
    hasInteractive: true,
  },
  {
    id: "3",
    title: "AI's Recommendation Quest",
    sourceCount: 5,
    timeAgo: "15m ago",
    type: "flashcards",
    isNew: false,
  },
  {
    id: "4",
    title: "System Architecture Overview",
    sourceCount: 3,
    timeAgo: "1d ago",
    type: "mindmap",
    isNew: false,
  },
  {
    id: "5",
    title: "Data Pipeline Report",
    sourceCount: 8,
    timeAgo: "2d ago",
    type: "report",
    isNew: false,
  },
]

export function StudioPanel({ onCollapse, onOpenView, triggerTool }: StudioPanelProps) {
  const [activeView, setActiveView] = useState<"studio" | "note" | "flashcard" | "quiz">("studio")
  const [noteContent, setNoteContent] = useState("")
  const [generatingTool, setGeneratingTool] = useState<string | null>(null)
  const [animatingTool, setAnimatingTool] = useState<string | null>(null)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<{ title: string; duration: string } | null>(null)
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>(sampleGeneratedItems)

  useEffect(() => {
    if (triggerTool) {
      if (activeView !== "studio") setActiveView("studio")
      handleToolClick(triggerTool)
    }
  }, [triggerTool])

  const handleToolClick = (toolLabel: string) => {
    setAnimatingTool(toolLabel)

    setTimeout(() => {
      setAnimatingTool(null)
      setGeneratingTool(toolLabel)
    }, 400)

    // Simulate generation completion
    setTimeout(() => {
      setGeneratingTool(null)
      const typeMap: Record<string, GeneratedItem["type"]> = {
        "Audio Overview": "audio",
        "Video Overview": "video",
        "Mind Map": "mindmap",
        Reports: "report",
        Flashcards: "flashcards",
        Quiz: "quiz",
        Infographic: "infographic",
        "Slide Deck": "slides",
        "Data Table": "table",
      }
      const newItem: GeneratedItem = {
        id: Date.now().toString(),
        title: `${toolLabel} Result`,
        sourceCount: 5,
        timeAgo: "Just now",
        type: typeMap[toolLabel] || "report",
        isNew: true,
        hasInteractive: toolLabel === "Audio Overview",
      }
      setGeneratedItems((prev) => [newItem, ...prev])

      // If it's audio, show the player
      if (toolLabel === "Audio Overview") {
        setCurrentAudio({ title: "How Algorithms Read...", duration: "16:18" })
        setShowAudioPlayer(true)
      }

      // Remove "new" flag after animation
      setTimeout(() => {
        setGeneratedItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, isNew: false } : item)))
      }, 2000)
    }, 3000)
  }

  const handleItemClick = (item: GeneratedItem) => {
    if (item.type === "flashcards") {
      setActiveView("flashcard")
    } else if (item.type === "quiz") {
      setActiveView("quiz")
    } else if (item.type === "mindmap") {
      onOpenView?.("mindmap", { title: item.title, sourceCount: item.sourceCount, rootNode: sampleMindMapData })
    } else if (item.type === "audio") {
      setCurrentAudio({ title: item.title, duration: "16:18" })
      setShowAudioPlayer(true)
    }
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

  if (activeView === "flashcard") {
    return (
      <div className="w-full h-full border-l border-border bg-card flex flex-col">
        <FlashcardView
          title="Recommender Flashcards"
          sourceCount={5}
          flashcards={sampleFlashcards}
          onBack={() => setActiveView("studio")}
        />
      </div>
    )
  }

  if (activeView === "quiz") {
    return (
      <div className="w-full h-full border-l border-border bg-card flex flex-col">
        <QuizView
          title="Recommender Quiz"
          sourceCount={5}
          questions={sampleQuizQuestions}
          onBack={() => setActiveView("studio")}
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
            {/* Language Banner */}
            {/* <div className="mx-4 mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs leading-relaxed">
                Create an Audio Overview in:{" "}
                <span className="text-primary">हिन्दी, বাংলা, ગુજરાતી, ಕನ್ನಡ, മലയാളം, मराठी, ਪੰਜਾਬੀ, தமிழ், తెలుగు</span>
              </p>
            </div> */}

            <div className="p-4">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
                {studioTools.map((tool) => (
                  <button
                    key={tool.label}
                    onClick={() => handleToolClick(tool.label)}
                    disabled={generatingTool === tool.label}
                    className={`
                      relative flex flex-col p-3 rounded-lg 
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

                    <div className="flex items-start justify-between w-full mb-1">
                      <tool.icon className={`w-4 h-4 ${tool.iconColor}`} />
                      <Pencil className="w-3 h-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs font-medium mt-auto">{tool.label}</span>
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
                  <p className="text-xs text-muted-foreground">based on 5 sources</p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="mx-4 border-t border-border" />

            <div className="px-4 py-4 space-y-1">
              {generatedItems.map((item) => {
                const ItemIcon = getItemIcon(item.type)
                const iconStyle = getItemIconStyle(item.type)
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`
                      flex items-center gap-3 p-2.5 rounded-lg cursor-pointer
                      hover:bg-secondary/80 transition-all duration-300 group
                      ${item.isNew ? "animate-in fade-in slide-in-from-top-2 bg-primary/5 border border-primary/20" : ""}
                    `}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${iconStyle.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <ItemIcon className={`w-4 h-4 ${iconStyle.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.sourceCount} sources · {item.timeAgo}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.hasInteractive && (
                        <span className="px-2 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full font-medium">
                          Interactive
                        </span>
                      )}
                      {item.type === "audio" && (
                        <button className="p-1.5 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3 h-3 text-primary fill-primary" />
                        </button>
                      )}
                      <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
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
