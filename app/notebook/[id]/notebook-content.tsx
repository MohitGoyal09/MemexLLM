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

// Track highlighted source for citation linking
interface HighlightedSource {
  documentId: string
  pageNumber?: number | null
  timestamp: number
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
    "video/youtube": "video",
    "text/html": "link",
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
    preview: doc.preview || null,
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
  const [studioRefreshKey, setStudioRefreshKey] = useState(0)

  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  // Narrower default widths to match NotebookLM proportions
  const [leftPanelWidth, setLeftPanelWidth] = useState(260)
  const [rightPanelWidth, setRightPanelWidth] = useState(380)

  const [fullScreenView, setFullScreenView] = useState<FullScreenView | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [notebookSettings, setNotebookSettings] = useState<NotebookSettings>(defaultSettings)
  const [triggerTool, setTriggerTool] = useState<string | null>(null)
  const [highlightedSource, setHighlightedSource] = useState<HighlightedSource | null>(null)

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

  const handleDeleteSource = useCallback(async (documentId: string) => {
    try {
      await documentsApi.delete(documentId)
      // Remove from selected sources if it was selected
      setSelectedSources(prev => prev.filter(id => id !== documentId))
      // Refresh the sources list
      await refreshSources()
    } catch (err) {
      console.error("Failed to delete source:", err)
      throw err
    }
  }, [refreshSources])

  // Poll for document processing status
  // IMPORTANT: Do NOT include `sources` in dependencies - it causes infinite re-render loops
  // Instead, track processing state separately
  useEffect(() => {
    // Check if any source is still processing
    const hasProcessing = sources.some((s) => s.status === "pending" || s.status === "processing")
    
    if (!hasProcessing) return

    // Use a longer interval (5s) to reduce server load
    const pollInterval = setInterval(async () => {
      try {
        const documents = await documentsApi.list(notebookId)
        const updatedSources = documents.map(documentToSource)
        
        // Only update state if there's a change (compare IDs and statuses)
        setSources((prev) => {
          const prevKey = prev.map(s => `${s.id}:${s.status}`).join(',')
          const newKey = updatedSources.map(s => `${s.id}:${s.status}`).join(',')
          
          if (prevKey !== newKey) {
            return updatedSources
          }
          return prev // No change, avoid re-render
        })
      } catch (err) {
        console.error("Failed to poll document status:", err)
      }
    }, 5000) // Increased from 3000 to 5000ms

    return () => clearInterval(pollInterval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId, sources.map(s => `${s.id}:${s.status}`).join(',')]) // Stable dependency key

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

  const handleExpandStudio = useCallback(() => {
    setRightPanelWidth((prev) => Math.max(prev, 600))
  }, [])

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
          // Accumulate full response for suggestions
          let fullResponse = ""

          await chatApi.sendMessageStream(
            notebookId,
            content,
            // On token
            (token) => {
              // Debug: log tokens with newlines
              if (token.includes('\n')) {
                console.log('Token with newline:', JSON.stringify(token))
              }
              fullResponse += token
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
              // Trigger conversation-based suggestions with guaranteed full text
              setLastChatTurn({
                userMessage: content,
                assistantMessage: fullResponse
              })

              setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantId ? { ...msg, isStreaming: false } : msg))
              )
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

  // Handle viewing a source from a citation
  const handleViewSource = useCallback((documentId: string, pageNumber?: number | null) => {
    // Validate documentId
    if (!documentId) {
      console.warn("handleViewSource called with invalid documentId")
      return
    }

    // Check if the document exists in sources
    const sourceExists = sources.some(s => s.id === documentId)
    if (!sourceExists) {
      console.warn(`Source ${documentId} not found in notebook sources`)
      // Still try to highlight in case it's just not loaded yet
    }

    // Expand the left panel if collapsed
    if (leftPanelCollapsed) {
      setLeftPanelCollapsed(false)
    }

    // Set the highlighted source to trigger scroll and highlight effect
    setHighlightedSource({
      documentId,
      pageNumber,
      timestamp: Date.now()
    })

    // Clear the highlight after animation completes
    setTimeout(() => {
      setHighlightedSource(null)
    }, 3000)
  }, [leftPanelCollapsed, sources])

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
    <div className="h-screen bg-background flex flex-col relative text-foreground overflow-hidden">
      <NotebookHeader
        title={notebook.title}
        notebookId={notebookId}
        onTitleChange={(newTitle) => setNotebook(prev => prev ? { ...prev, title: newTitle } : null)}
      />

      <div className="flex-1 flex p-3 pt-1 gap-3 bg-background min-h-0 overflow-hidden">
        {/* Left Panel Toggle */}
        {leftPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border border-border/40 bg-card w-[60px] flex-shrink-0 z-10 rounded-2xl shadow-sm">
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
              onDeleteSource={handleDeleteSource}
              highlightedSourceId={highlightedSource?.documentId}
            />
          </ResizablePanel>
        )}

        {/* Chat Panel - takes remaining space */}
        <div className="flex-1 min-w-[300px] flex flex-col overflow-hidden">
          <ChatPanel
            messages={messages}
            sourceCount={selectedSources.length}
            notebookId={notebookId}
            onSendMessage={handleSendMessage}
            onOpenSettings={() => setShowSettingsModal(true)}
            onDeleteHistory={handleDeleteHistory}
            onViewSource={handleViewSource}
            lastChatTurn={lastChatTurn}
            onNoteSaved={() => setStudioRefreshKey(prev => prev + 1)}
          />
        </div>

        {!rightPanelCollapsed && (
          <ResizablePanel defaultWidth={rightPanelWidth} minWidth={300} maxWidth={600} side="right" onResize={setRightPanelWidth}>
            <StudioPanel
              notebookId={notebookId}
              onCollapse={() => setRightPanelCollapsed(true)}
              onOpenView={(type, data) => setFullScreenView({ type, data })}
              triggerTool={triggerTool}
              refreshKey={studioRefreshKey}
              onSourceCreated={refreshSources}
              onExpandStudio={handleExpandStudio}
              onResetStudioWidth={() => setRightPanelWidth(380)}
            />
          </ResizablePanel>
        )}

        {/* Right Panel Toggle */}
        {rightPanelCollapsed && (
          <div className="flex flex-col items-center py-4 px-2 border border-border/40 bg-card w-[60px] flex-shrink-0 z-10 rounded-2xl shadow-sm">
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
                // Unified neutral styling - amber only for primary actions
                const iconColor = "text-muted-foreground"
                const bgColor = "bg-surface-2"

                return (
                  <div
                    key={item.id}
                    className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0 border border-border`}
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
              contentId={fullScreenView.data.contentId}
              onBack={() => setFullScreenView(null)}
            />
          )}
          {fullScreenView.type === "flashcards" && (
            <FlashcardView
              title={fullScreenView.data.title}
              sourceCount={fullScreenView.data.sourceCount}
              flashcards={fullScreenView.data.flashcards}
              contentId={fullScreenView.data.contentId}
              onBack={() => setFullScreenView(null)}
            />
          )}
          {fullScreenView.type === "quiz" && (
            <QuizView
              title={fullScreenView.data.title}
              sourceCount={fullScreenView.data.sourceCount}
              questions={fullScreenView.data.questions}
              contentId={fullScreenView.data.contentId}
              onBack={() => setFullScreenView(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
