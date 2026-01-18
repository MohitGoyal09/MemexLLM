"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { NotebookHeader } from "@/components/notebook-header"
import { SourcesPanel } from "@/components/sources-panel"
import { ChatPanel } from "@/components/chat-panel"
import { StudioPanel } from "@/components/studio-panel"
import { AddSourcesModal } from "@/components/add-sources-modal"
import { PanelLeft, Plus, FileText, Upload, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Source } from "@/lib/types"
import { notebooksApi } from "@/lib/api"

export default function NewNotebookPage() {
  const router = useRouter()
  const [showSourcesModal, setShowSourcesModal] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [messages, setMessages] = useState<
    Array<{
      id: string
      role: "user" | "assistant"
      content: string
      timestamp: string
      citations?: number[]
    }>
  >([])
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [showInitialPrompt, setShowInitialPrompt] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [notebookId, setNotebookId] = useState<string | null>(null)
  const [notebookTitle] = useState("Untitled notebook")

  // Create notebook when first source is added
  const handleAddSource = useCallback(
    async (newSources: Source[]) => {
      // If notebook doesn't exist yet, create it first
      if (!notebookId) {
        setIsCreating(true)
        try {
          // Create the notebook
          const notebook = await notebooksApi.create({ title: notebookTitle })
          setNotebookId(notebook.id)

          // Add sources to state
          setSources(newSources)
          setSelectedSources(newSources.map((s) => s.id))
          setShowSourcesModal(false)
          setShowInitialPrompt(false)

          // Redirect to the notebook page
          router.push(`/notebook/${notebook.id}`)
        } catch (err) {
          console.error("Failed to create notebook:", err)
        } finally {
          setIsCreating(false)
        }
      } else {
        // Notebook already exists, just add sources
        setSources([...sources, ...newSources])
        setSelectedSources([...selectedSources, ...newSources.map((s) => s.id)])
        setShowSourcesModal(false)
        setShowInitialPrompt(false)
      }
    },
    [notebookId, notebookTitle, router, sources, selectedSources]
  )

  // Quick create without sources - just create and redirect
  const handleQuickCreate = async () => {
    setIsCreating(true)
    try {
      const notebook = await notebooksApi.create({ title: "Untitled notebook" })
      router.push(`/notebook/${notebook.id}`)
    } catch (err) {
      console.error("Failed to create notebook:", err)
      setIsCreating(false)
    }
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
      <NotebookHeader title={notebookTitle} isNew />

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

        {/* Sources Panel */}
        {!leftPanelCollapsed && (
          <SourcesPanel
            sources={sources}
            selectedSources={selectedSources}
            onAddSource={() => setShowSourcesModal(true)}
            onToggleSource={toggleSourceSelection}
            onSelectAll={selectAllSources}
            onCollapse={() => setLeftPanelCollapsed(true)}
          />
        )}

        {showInitialPrompt && sources.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-background">
            {/* Upload Icon */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
              {isCreating ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
              {isCreating ? "Creating notebook..." : "Add a source to get started"}
            </h2>

            {/* Buttons */}
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
              <Button
                onClick={() => setShowSourcesModal(true)}
                variant="secondary"
                className="rounded-full px-6 py-5 text-base gap-2"
                disabled={isCreating}
              >
                Upload a source
              </Button>
              <Button
                onClick={handleQuickCreate}
                variant="outline"
                className="rounded-full px-6 py-5 text-base gap-2"
                disabled={isCreating}
              >
                Create empty notebook
              </Button>
            </div>

            {/* Input Bar at Bottom */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
              <div className="flex items-center gap-3 bg-card border border-border rounded-full px-4 py-3">
                <input
                  type="text"
                  placeholder="Upload a source to get started"
                  className="flex-1 bg-transparent outline-none text-sm text-muted-foreground"
                  disabled
                />
                <span className="text-sm text-muted-foreground">0 sources</span>
                <button
                  className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                  onClick={() => setShowSourcesModal(true)}
                  disabled={isCreating}
                >
                  <ArrowRight className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {/* Studio Panel */}
        {!rightPanelCollapsed && <StudioPanel onCollapse={() => setRightPanelCollapsed(true)} />}

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

      <AddSourcesModal
        open={showSourcesModal}
        onOpenChange={setShowSourcesModal}
        onAddSources={handleAddSource}
        notebookId={notebookId || undefined}
      />
    </div>
  )
}
