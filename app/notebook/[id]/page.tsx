"use client"

import { useState } from "react"
import { NotebookHeader } from "@/components/notebook-header"
import { SourcesPanel } from "@/components/sources-panel"
import { ChatPanel } from "@/components/chat-panel"
import { StudioPanel, studioTools, sampleGeneratedItems } from "@/components/studio-panel"
import { AddSourcesModal } from "@/components/add-sources-modal"
import { ResizablePanel } from "@/components/resizable-panel"
import { PanelLeft, Plus, FileText, FileImage, FileVideo, FileAudio, Globe } from "lucide-react"

import { Source, SourceType } from "@/lib/types"
import { FlashcardView } from "@/components/flashcard-view"
import { QuizView } from "@/components/quiz-view"
import { MindMapView } from "@/components/mind-map-view"
import { NotebookSettingsModal, defaultSettings, type NotebookSettings } from "@/components/notebook-settings-modal"

interface FullScreenView {
  type: "flashcards" | "quiz" | "mindmap"
  data: any
 
}

const getSourceIcon = (type: Source["type"]) => {
  const iconMap = {
    pdf: { icon: FileText, bg: "bg-red-500/20", color: "text-red-400" },
    doc: { icon: FileText, bg: "bg-blue-500/20", color: "text-blue-400" },
    image: { icon: FileImage, bg: "bg-green-500/20", color: "text-green-400" },
    video: { icon: FileVideo, bg: "bg-purple-500/20", color: "text-purple-400" },
    audio: { icon: FileAudio, bg: "bg-orange-500/20", color: "text-orange-400" },
    link: { icon: Globe, bg: "bg-cyan-500/20", color: "text-cyan-400" },
    text: { icon: FileText, bg: "bg-slate-500/20", color: "text-slate-400" },
    file: { icon: FileText, bg: "bg-gray-500/20", color: "text-gray-400" },
  }
  return (iconMap as any)[type] || iconMap.text
}

export default function NotebookPage() {
  const [showSourcesModal, setShowSourcesModal] = useState(false)
  const [sources, setSources] = useState<Source[]>([
    { id: "1", name: "Self-Adaptive LLMs: How Trans...", type: "pdf" },
    { id: "2", name: "TRANSFORMER-SQUARED SEL...", type: "pdf" },
    { id: "3", name: "Research Notes - ML Fundamentals", type: "doc" },
    { id: "4", name: "Architecture Diagram v2.png", type: "image" },
    { id: "5", name: "https://arxiv.org/paper/2024...", type: "link" },
  ])
  const [selectedSources, setSelectedSources] = useState<string[]>(["1", "2", "3", "4", "5"])
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "user" as const,
      content: "Tell me about this paper",
      timestamp: "Today • 16:57",
    },
    {
      id: "2",
      role: "assistant" as const,
      content: `The paper, titled **Transformer² (Transformer Squared)**, was introduced by **Sakana AI** to establish a framework for **self-adaptive large language models (LLMs)**. This framework allows a model to dynamically adjust its internal weights in response to specific tasks or environments without requiring external intervention.

**Core Concept and Analogy**

The central inspiration for the paper is the octopus, which changes its colour to blend into its surroundings; similarly, a Transformer² model adapts its "colour" (its internal parameters) to match the task at hand.`,
      timestamp: "Today • 16:57",
      citations: [1, 2],
    },
  ])
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(320)
  const [rightPanelWidth, setRightPanelWidth] = useState(380)

  const [fullScreenView, setFullScreenView] = useState<FullScreenView | null>(null)

  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [notebookSettings, setNotebookSettings] = useState<NotebookSettings>(defaultSettings)
  const [triggerTool, setTriggerTool] = useState<string | null>(null)

  const handleAddSource = (newSources: Source[]) => {
    setSources([...sources, ...newSources])
    setShowSourcesModal(false)
  }

  const toggleSourceSelection = (id: string) => {
    if (selectedSources.includes(id)) {
      setSelectedSources(selectedSources.filter((s) => s !== id))
    } else {
      setSelectedSources([...selectedSources, id])
    }
  }

  const selectAllSources = () => {
    if (selectedSources.length === sources.length) {
      setSelectedSources([])
    } else {
      setSelectedSources(sources.map((s) => s.id))
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col relative">
      <NotebookHeader 
        title="Transformer-Squared LLMs: Self-Adaptive Language Models" 
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel Toggle */}
        {leftPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border-r border-border bg-card w-[60px] flex-shrink-0 z-10">
            <button
              onClick={() => setLeftPanelCollapsed(false)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <PanelLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="h-px w-8 bg-border my-3" />
            <button
              onClick={() => setShowSourcesModal(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="mt-4 space-y-3 w-full flex flex-col items-center overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
              {sources.map((source) => {
                const { icon: SourceIcon, bg, color } = getSourceIcon(source.type)
                return (
                  <div key={source.id} className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 shadow-sm`} title={source.name}>
                    <SourceIcon className={`w-4 h-4 ${color}`} />
                    <span className="sr-only">{source.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!leftPanelCollapsed && (
          <ResizablePanel
            defaultWidth={leftPanelWidth}
            minWidth={240}
            maxWidth={500}
            side="left"
            onResize={setLeftPanelWidth}
          >
            <SourcesPanel
              sources={sources}
              selectedSources={selectedSources}
              onAddSource={() => setShowSourcesModal(true)}
              onToggleSource={toggleSourceSelection}
              onSelectAll={selectAllSources}
              onCollapse={() => setLeftPanelCollapsed(true)}
            />
          </ResizablePanel>
        )}

        {/* Chat Panel - takes remaining space */}
        <div className="flex-1 min-w-[300px]">
          <ChatPanel
            messages={messages}
            sourceCount={selectedSources.length}
            onSendMessage={(content) => {
              const newMessage = {
                id: Date.now().toString(),
                role: "user" as const,
                content,
                timestamp: "Now",
              }
              setMessages([...messages, newMessage])
            }}
            onOpenSettings={() => setShowSettingsModal(true)}
            onDeleteHistory={() => setMessages([])}
          />
        </div>

        {!rightPanelCollapsed && (
          <ResizablePanel
            defaultWidth={rightPanelWidth}
            minWidth={300}
            maxWidth={600}
            side="right"
            onResize={setRightPanelWidth}
          >
            <StudioPanel
              onCollapse={() => setRightPanelCollapsed(true)}
              onOpenView={(type, data) => setFullScreenView({ type, data })}
              triggerTool={triggerTool}
            />
          </ResizablePanel>
        )}

        {/* Right Panel Toggle */}
        {rightPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border-l border-border bg-card w-[60px] flex-shrink-0 z-10">
            <button
              onClick={() => setRightPanelCollapsed(false)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors mb-3"
            >
              <PanelLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </button>
            <div className="flex flex-col gap-3 w-full items-center overflow-y-auto no-scrollbar">
               {/* Tools (Compact) */}
               {/* Tools (Compact) */}
              {studioTools.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => {
                    setRightPanelCollapsed(false)
                    setTriggerTool(tool.label)
                    setTimeout(() => setTriggerTool(null), 500)
                  }}
                  className={`w-9 h-9 rounded-lg ${tool.bgColor} flex items-center justify-center flex-shrink-0 relative group hover:scale-105 transition-transform`}
                  title={tool.label}
                >
                   <tool.icon className={`w-4 h-4 ${tool.iconColor}`} />
                   <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-secondary rounded-full flex items-center justify-center border border-border">
                      <Plus className="w-2 h-2 text-muted-foreground" />
                   </div>
                </button>
              ))}
              
              <div className="h-px w-8 bg-border my-2" />

              {/* Items (Compact) */}
              {sampleGeneratedItems.map((item) => {
                 // Simple mapping for icon style since we can't easily import the complex logic from StudioPanel without more refactoring
                 // We'll reuse the basic logic here for now or just generic icons
                 // Or better yet, just use a generic colored box based on type
                   
                 let iconColor = "text-muted-foreground"
                 let bgColor = "bg-secondary"
                 
                 if (item.type === "audio") { iconColor = "text-purple-400"; bgColor="bg-purple-500/20" }
                 else if (item.type === "mindmap") { iconColor = "text-violet-400"; bgColor="bg-violet-500/20" }
                 else if (item.type === "flashcards") { iconColor = "text-blue-400"; bgColor="bg-blue-500/20" }
                 else if (item.type === "quiz") { iconColor = "text-lime-400"; bgColor="bg-lime-500/20" }
                 
                 return (
                  <div key={item.id} className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`} title={item.title}>
                     {/* We can't easily get the specific icon without importing the huge list, so we'll just check type */}
                      <span className={`text-[10px] font-bold ${iconColor}`}>{item.type[0].toUpperCase()}</span>
                  </div>
                 )
              })}

            </div>
          </div>
        )}
      </div>

      <AddSourcesModal open={showSourcesModal} onOpenChange={setShowSourcesModal} onAddSources={handleAddSource} />
      
      <NotebookSettingsModal 
        open={showSettingsModal} 
        onOpenChange={setShowSettingsModal}
        settings={notebookSettings}
        onSave={setNotebookSettings}
      />

      {/* Full Screen View Overlay */}
      {fullScreenView && (
        <div className="absolute inset-0 z-50 bg-background animate-in fade-in duration-300">
          {fullScreenView.type === "mindmap" && (
            <MindMapView
              title={fullScreenView.data.title}
              sourceCount={fullScreenView.data.sourceCount}
              rootNode={fullScreenView.data.rootNode}
              onBack={() => setFullScreenView(null)}
            />
          )}
          {fullScreenView.type === "flashcards" && (
            <FlashcardView
              title={fullScreenView.data.title}
              sourceCount={fullScreenView.data.sourceCount}
              flashcards={fullScreenView.data.flashcards}
              onBack={() => setFullScreenView(null)}
            />
          )}
          {fullScreenView.type === "quiz" && (
            <QuizView
              title={fullScreenView.data.title}
              sourceCount={fullScreenView.data.sourceCount}
              questions={fullScreenView.data.questions}
              onBack={() => setFullScreenView(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
