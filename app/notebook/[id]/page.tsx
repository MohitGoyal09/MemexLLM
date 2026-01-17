"use client"

import { useState } from "react"
import { NotebookHeader } from "@/components/notebook-header"
import { SourcesPanel } from "@/components/sources-panel"
import { ChatPanel } from "@/components/chat-panel"
import { StudioPanel } from "@/components/studio-panel"
import { AddSourcesModal } from "@/components/add-sources-modal"
import { ResizablePanel } from "@/components/resizable-panel"
import { PanelLeft, Plus, FileText } from "lucide-react"

import { Source, SourceType } from "@/lib/types"


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
    <div className="h-screen bg-background flex flex-col">
      <NotebookHeader title="Transformer-Squared LLMs: Self-Adaptive Language Models" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel Toggle */}
        {leftPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border-r border-border bg-card">
            <button
              onClick={() => setLeftPanelCollapsed(false)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <PanelLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowSourcesModal(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors mt-2"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors mt-2">
              <FileText className="w-5 h-5 text-primary" />
            </button>
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
            <StudioPanel onCollapse={() => setRightPanelCollapsed(true)} />
          </ResizablePanel>
        )}

        {/* Right Panel Toggle */}
        {rightPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border-l border-border bg-card">
            <button
              onClick={() => setRightPanelCollapsed(false)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <PanelLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </button>
          </div>
        )}
      </div>

      <AddSourcesModal open={showSourcesModal} onOpenChange={setShowSourcesModal} onAddSources={handleAddSource} />
    </div>
  )
}
