"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { NotebookHeader } from "@/components/notebook-header"
import { SourcesPanel } from "@/components/sources-panel"
import { ChatPanel } from "@/components/chat-panel"
import { StudioPanel, studioTools } from "@/components/studio-panel"
import { useStudio } from "@/hooks/use-studio"
import { AddSourcesModal } from "@/components/add-sources-modal"
import { ResizablePanel } from "@/components/resizable-panel"
import { PanelLeft, Plus, FileText, FileImage, FileVideo, FileAudio, Globe, Loader2 } from "lucide-react"

import { Source, SourceType } from "@/lib/types"
import { FlashcardView } from "@/components/flashcard-view"
import { QuizView } from "@/components/quiz-view"
import { MindMapView } from "@/components/mind-map-view"
import { NotebookSettingsModal, defaultSettings, type NotebookSettings } from "@/components/notebook-settings-modal"
import { notebooksApi, documentsApi, chatApi } from "@/lib/api"
import type { Notebook, Document as ApiDocument, ChatMessage as ApiChatMessage, Citation } from "@/lib/api/types"

interface FullScreenView {
  type: "flashcards" | "quiz" | "mindmap"
  data: any
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  citations?: Citation[]
  isStreaming?: boolean
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

// Convert API document to Source type
function documentToSource(doc: ApiDocument): Source {
  const mimeToType: Record<string, SourceType> = {
    "application/pdf": "pdf",
    "text/plain": "text",
    "text/markdown": "text",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc",
    "image/png": "image",
    "image/jpeg": "image",
    "audio/mpeg": "audio",
    "video/mp4": "video",
  }
  const type = mimeToType[doc.mime_type] || "file"

  return {
    id: doc.id,
    name: doc.filename,
    type,
    status: doc.status,
    chunkCount: doc.chunk_count,
    mimeType: doc.mime_type,
    errorMessage: doc.error_message,
  }
}

// Convert API chat message to local Message type
function apiMessageToMessage(msg: ApiChatMessage): Message {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at).toLocaleString(),
    citations: msg.citations || [],
  }
}

interface NotebookPageContentProps {
  notebookId: string
}

export function NotebookPageContent({ notebookId }: NotebookPageContentProps) {
  const router = useRouter()

  // State
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showSourcesModal, setShowSourcesModal] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [lastChatTurn, setLastChatTurn] = useState<{ userMessage: string; assistantMessage: string } | null>(null)

  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  // Narrower default widths to match NotebookLM proportions
  const [leftPanelWidth, setLeftPanelWidth] = useState(260)
  const [rightPanelWidth, setRightPanelWidth] = useState(300)

  const [fullScreenView, setFullScreenView] = useState<FullScreenView | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [notebookSettings, setNotebookSettings] = useState<NotebookSettings>(defaultSettings)
  const [triggerTool, setTriggerTool] = useState<string | null>(null)

  // Use studio hook for collapsed sidebar items
  const { items: studioItems } = useStudio({ notebookId, pollInterval: 5000 })

  // Fetch notebook data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch notebook details
        const notebookData = await notebooksApi.get(notebookId)
        setNotebook(notebookData)

        // Apply notebook settings if present
        if (notebookData.settings) {
          setNotebookSettings((prev) => ({
            ...prev,
            ...notebookData.settings,
          }))
        }

        // Fetch documents
        const documents = await documentsApi.list(notebookId)
        const sourcesFromDocs = documents.map(documentToSource)
        setSources(sourcesFromDocs)
        setSelectedSources(sourcesFromDocs.map((s) => s.id))

        // Fetch chat history
        const history = await chatApi.getHistory(notebookId)
        setMessages(history.map(apiMessageToMessage))

        setError(null)
      } catch (err) {
        console.error("Failed to load notebook:", err)
        if (err instanceof Error && err.message.includes("authenticated")) {
          router.push("/auth/login")
          return
        }
        setError("Failed to load notebook. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [notebookId, router])

  const refreshSources = useCallback(async () => {
    try {
      const documents = await documentsApi.list(notebookId)
      const sourcesFromDocs = documents.map(documentToSource)
      setSources(sourcesFromDocs)
    } catch (err) {
      console.error("Failed to refresh sources:", err)
    }
  }, [notebookId])

  // Poll for document processing status
  useEffect(() => {
    const hasProcessing = sources.some((s) => s.status === "pending" || s.status === "processing")
    
    if (!hasProcessing) return

    const pollInterval = setInterval(async () => {
      try {
        const documents = await documentsApi.list(notebookId)
        const updatedSources = documents.map(documentToSource)
        setSources(updatedSources)
      } catch (err) {
        console.error("Failed to poll document status:", err)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [sources, notebookId])

  const handleAddSource = useCallback((newSources: Source[]) => {
    setSources((prev) => [...prev, ...newSources])
    setSelectedSources((prev) => [...prev, ...newSources.map((s) => s.id)])
    setShowSourcesModal(false)
  }, [])

  const toggleSourceSelection = useCallback((id: string) => {
    setSelectedSources((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }, [])

  const selectAllSources = useCallback(() => {
    setSelectedSources((prev) => (prev.length === sources.length ? [] : sources.map((s) => s.id)))
  }, [sources])

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: "Now",
      }
      setMessages((prev) => [...prev, userMessage])

      // Add placeholder for assistant response
      const assistantId = (Date.now() + 1).toString()
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: "Now",
        isStreaming: true,
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsStreaming(true)

      const isStreamingEnabled = notebookSettings.streaming !== false // Default to true

      try {
        if (isStreamingEnabled) {
          await chatApi.sendMessageStream(
            notebookId,
            content,
            // On token
            (token) => {
              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + token } : msg))
              )
            },
            // On citations
            (citations: Citation[]) => {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, citations: citations } : msg
                )
              )
            },
            // On complete
            () => {
              setMessages((prev) => {
                // Get the final assistant message content for suggestions
                const finalAssistantMsg = prev.find(msg => msg.id === assistantId)
                if (finalAssistantMsg) {
                  // Set last chat turn to trigger conversation-based suggestions
                  setLastChatTurn({
                    userMessage: content,
                    assistantMessage: finalAssistantMsg.content
                  })
                }
                return prev.map((msg) => (msg.id === assistantId ? { ...msg, isStreaming: false } : msg))
              })
              setIsStreaming(false)
            },
            // On error
            (error) => {
              console.error("Chat stream error:", error)
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: "Sorry, an error occurred. Please try again.", isStreaming: false }
                    : msg
                )
              )
              setIsStreaming(false)
            }
          )
        } else {
          // Non-streaming request
          const response = await chatApi.sendMessage(notebookId, content)
          
          // Use 'response.content' if the API returns { role, content, citations } structure
          // Checking types.ts: ChatResponse has content and citations
          const responseContent = (response as any).content || (response as any).message || "" 
          const responseCitations = (response as any).citations || []

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? {
                    ...msg,
                    content: responseContent,
                    citations: responseCitations,
                    isStreaming: false,
                  }
                : msg
            )
          )
          // Set last chat turn for non-streaming response
          setLastChatTurn({
            userMessage: content,
            assistantMessage: responseContent
          })
          setIsStreaming(false)
        }
      } catch (err) {
        console.error("Failed to send message:", err)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: "Sorry, an error occurred. Please try again.", isStreaming: false }
              : msg
          )
        )
        setIsStreaming(false)
      }
    },
    [notebookId, notebookSettings.streaming]
  )

  const handleDeleteHistory = useCallback(async () => {
    try {
      await chatApi.deleteHistory(notebookId)
      setMessages([])
    } catch (err) {
      console.error("Failed to delete chat history:", err)
    }
  }, [notebookId])

  const handleSaveSettings = useCallback(
    async (settings: NotebookSettings) => {
      try {
        await notebooksApi.update(notebookId, { settings })
        setNotebookSettings(settings)
      } catch (err) {
        console.error("Failed to save settings:", err)
      }
    },
    [notebookId]
  )

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading notebook...</p>
      </div>
    )
  }

  if (error || !notebook) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-destructive">{error || "Notebook not found"}</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex flex-col relative">
      <NotebookHeader 
        title={notebook.title} 
        notebookId={notebookId}
        onOpenSettings={() => setShowSettingsModal(true)} 
        onTitleChange={(newTitle) => setNotebook(prev => prev ? { ...prev, title: newTitle } : null)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel Toggle */}
        {leftPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border-r border-border bg-card w-[60px] flex-shrink-0 z-10">
            <button onClick={() => setLeftPanelCollapsed(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <PanelLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="h-px w-8 bg-border my-3" />
            <button onClick={() => setShowSourcesModal(true)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="mt-4 space-y-3 w-full flex flex-col items-center overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar">
              {sources.map((source) => {
                const { icon: SourceIcon, bg, color } = getSourceIcon(source.type)
                return (
                  <div
                    key={source.id}
                    className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 shadow-sm ${
                      source.status === "processing" ? "animate-pulse" : ""
                    }`}
                    title={source.name}
                  >
                    <SourceIcon className={`w-4 h-4 ${color}`} />
                    <span className="sr-only">{source.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!leftPanelCollapsed && (
          <ResizablePanel defaultWidth={leftPanelWidth} minWidth={240} maxWidth={500} side="left" onResize={setLeftPanelWidth}>
            <SourcesPanel
              sources={sources}
              selectedSources={selectedSources}
              onAddSource={() => setShowSourcesModal(true)}
              onToggleSource={toggleSourceSelection}
              onSelectAll={selectAllSources}
              onCollapse={() => setLeftPanelCollapsed(true)}
              onRefresh={refreshSources}
            />
          </ResizablePanel>
        )}

        {/* Chat Panel - takes remaining space */}
        <div className="flex-1 min-w-[300px]">
          <ChatPanel
            messages={messages}
            sourceCount={selectedSources.length}
            notebookId={notebookId}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setShowSettingsModal(true)}
            onDeleteHistory={handleDeleteHistory}
            lastChatTurn={lastChatTurn}
          />
        </div>

        {!rightPanelCollapsed && (
          <ResizablePanel defaultWidth={rightPanelWidth} minWidth={300} maxWidth={600} side="right" onResize={setRightPanelWidth}>
            <StudioPanel
              notebookId={notebookId}
              onCollapse={() => setRightPanelCollapsed(true)}
              onOpenView={(type, data) => setFullScreenView({ type, data })}
              triggerTool={triggerTool}
            />
          </ResizablePanel>
        )}

        {/* Right Panel Toggle */}
        {rightPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border-l border-border bg-card w-[60px] flex-shrink-0 z-10">
            <button onClick={() => setRightPanelCollapsed(false)} className="p-2 hover:bg-secondary rounded-lg transition-colors mb-3">
              <PanelLeft className="w-5 h-5 text-muted-foreground rotate-180" />
            </button>
            <div className="flex flex-col gap-3 w-full items-center overflow-y-auto no-scrollbar">
              {studioTools.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => {
                    setRightPanelCollapsed(false)
                    setTriggerTool(tool.label)
                    setTimeout(() => setTriggerTool(null), 500)
                  }}
                  className={`w-9 h-9 rounded-lg ${tool.bgColor} flex items-center justify-center flex-shrink-0 relative group hover:scale-105 transition-transform`}
                  title={tool.fullLabel || tool.label}
                >
                  <tool.icon className={`w-4 h-4 ${tool.iconColor}`} />
                  <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-secondary rounded-full flex items-center justify-center border border-border">
                    <Plus className="w-2 h-2 text-muted-foreground" />
                  </div>
                </button>
              ))}

              <div className="h-px w-8 bg-border my-2" />

              {studioItems.slice(0, 5).map((item) => {
                let iconColor = "text-muted-foreground"
                let bgColor = "bg-secondary"

                if (item.type === "audio") {
                  iconColor = "text-purple-400"
                  bgColor = "bg-purple-500/20"
                } else if (item.type === "mindmap") {
                  iconColor = "text-violet-400"
                  bgColor = "bg-violet-500/20"
                } else if (item.type === "flashcards") {
                  iconColor = "text-blue-400"
                  bgColor = "bg-blue-500/20"
                } else if (item.type === "quiz") {
                  iconColor = "text-lime-400"
                  bgColor = "bg-lime-500/20"
                }

                return (
                  <div
                    key={item.id}
                    className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}
                    title={item.title}
                  >
                    <span className={`text-[10px] font-bold ${iconColor}`}>{item.type[0].toUpperCase()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <AddSourcesModal
        open={showSourcesModal}
        onOpenChange={setShowSourcesModal}
        onAddSources={handleAddSource}
        notebookId={notebookId}
      />

      <NotebookSettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        settings={notebookSettings}
        onSave={handleSaveSettings}
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
