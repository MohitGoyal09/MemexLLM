"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize from "rehype-sanitize"
import {
  SlidersHorizontal,
  MoreVertical,
  Pin,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  RefreshCw,
  Sparkles,
  FileText,
  Check,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Citation, FeedbackRating } from "@/lib/api/types"
import { submitFeedback } from "@/lib/api/feedback"
import { CitationPreview, CitationFooter, CitationSheet } from "@/components/citation-preview"
import { useSuggestedQuestions } from "@/hooks/use-suggested-questions"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  citations?: Citation[]
  isStreaming?: boolean
}

interface LastChatTurn {
  userMessage: string
  assistantMessage: string
}

interface ChatPanelProps {
  messages: Message[]
  sourceCount: number
  notebookId: string | null
  onSendMessage: (content: string) => void
  onOpenSettings?: () => void
  onDeleteHistory?: () => void
  onViewSource?: (documentId: string, pageNumber?: number | null) => void
  lastChatTurn?: LastChatTurn | null
  onNoteSaved?: () => void
}

// Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Detects if the user is on a mobile device
 */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches ||
        ("ontouchstart" in window && navigator.maxTouchPoints > 0)
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

/**
 * Dynamic thinking indicator with contextual messages
 */
function ThinkingIndicator({ hasContent }: { hasContent: boolean }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [dots, setDots] = useState("")
  
  const phases = useMemo(() => [
    "Thinking",
    "Searching sources",
    "Analyzing",
    "Generating response",
  ], [])
  
  useEffect(() => {
    // Only cycle through phases if no content yet
    if (hasContent) return
    
    const phaseInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length)
    }, 2500)
    
    return () => clearInterval(phaseInterval)
  }, [hasContent, phases])
  
  // Animate dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)
    
    return () => clearInterval(dotsInterval)
  }, [])
  
  // If content has started, show typing indicator
  if (hasContent) {
    return (
      <span className="inline-flex items-center gap-1.5 ml-1">
        <span className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </span>
    )
  }
  
  return (
    <div className="flex items-center gap-2.5 text-muted-foreground py-3">
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <span className="text-sm font-medium">
        {phases[phaseIndex]}
        <span className="inline-block w-5 text-left">{dots}</span>
      </span>
    </div>
  )
}

/**
 * Pre-processes markdown content to fix common LLM formatting issues
 * and normalize citation formats for consistent rendering
 */
function preprocessMarkdownContent(content: string): string {
  if (!content) return ""

  let processed = content

  // 1. Force headers to be on their own lines (fix "text.### Header")
  processed = processed.replace(/([^\n])\s*(#{1,6})\s+/g, "$1\n\n$2 ")

  // 2. Fix bullet points mashed into text (fix "text.* Item" or "text.- Item")
  processed = processed.replace(/([.!?])\s*([*-])\s+/g, "$1\n\n$2 ")

  // 3. Ensure proper spacing before numbered lists
  processed = processed.replace(/([.!?])\s*(\d+\.)\s+/g, "$1\n\n$2 ")

  // 4. Handle comma-separated citation lists like [1, 2, 3, 4, 5] or **[1, 2, 3]**
  // Convert them to individual bold citations: **[1]** **[2]** **[3]**
  processed = processed.replace(
    /\*?\*?\[(\d+(?:\s*,\s*\d+)+)\]\*?\*?/g,
    (match, numbers: string) => {
      const nums = numbers.split(/\s*,\s*/)
      return nums.map((n: string) => `**[${n.trim()}]**`).join(" ")
    }
  )

  // 5. Normalize citation formats to **[N]** for consistent rendering
  // Handle various LLM citation formats:
  // - [1] -> **[1]**
  // - [[1]] -> **[1]**
  // - [^1] -> **[1]** (footnote style)
  // But avoid double-bolding already formatted citations

  // First, normalize bracketed citations that aren't already bold
  processed = processed.replace(/(?<!\*)\[(\d+)\](?!\*)/g, "**[$1]**")

  // Handle double brackets [[1]] -> **[1]**
  processed = processed.replace(/\[\[(\d+)\]\]/g, "**[$1]**")

  // Handle footnote style [^1] -> **[1]**
  processed = processed.replace(/\[\^(\d+)\]/g, "**[$1]**")

  // 6. Clean up any excessive newlines (more than 2 consecutive)
  processed = processed.replace(/\n{3,}/g, "\n\n")

  return processed
}

/**
 * Extracts citation indices from text content
 */
function extractCitationIndices(content: string): number[] {
  const matches = content.match(/\[(\d+)\]/g) || []
  return [...new Set(matches.map(m => parseInt(m.replace(/[\[\]]/g, ""), 10)))]
}

// ============================================================================
// ASSISTANT MESSAGE COMPONENT
// ============================================================================

interface AssistantMessageProps {
  message: Message
  isMobile: boolean
  onViewSource?: (documentId: string, pageNumber?: number | null) => void
  onCitationClick?: (citation: Citation, index: number) => void
  feedbackStatus: FeedbackRating | null
  isSubmittingFeedback: boolean
  onFeedback: (rating: FeedbackRating) => void
  onSaveToNote?: (content: string) => void
}

function AssistantMessage({
  message,
  isMobile,
  onViewSource,
  onCitationClick,
  feedbackStatus,
  isSubmittingFeedback,
  onFeedback,
  onSaveToNote
}: AssistantMessageProps) {
  const [copied, setCopied] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [debouncedContent, setDebouncedContent] = useState(message.content || "")

  // Debounce content updates during streaming for smoother markdown rendering
  useEffect(() => {
    if (!message.isStreaming) {
      // Not streaming - use content directly
      setDebouncedContent(message.content || "")
      return
    }
    
    // During streaming, debounce updates for better markdown parsing
    const timer = setTimeout(() => {
      setDebouncedContent(message.content || "")
    }, 50) // Small delay to batch token updates
    
    return () => clearTimeout(timer)
  }, [message.content, message.isStreaming])

  // Preprocess content once
  const processedContent = useMemo(
    () => preprocessMarkdownContent(debouncedContent),
    [debouncedContent]
  )

  // Extract used citation indices for the footer
  const usedCitationIndices = useMemo(
    () => extractCitationIndices(message.content || ""),
    [message.content]
  )

  // Copy message content
  const handleCopy = useCallback(async () => {
    try {
      // Strip markdown for plain text copy
      const plainText = message.content
        .replace(/\*\*\[(\d+)\]\*\*/g, "[$1]") // Keep citations as [N]
        .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
        .replace(/\*([^*]+)\*/g, "$1") // Remove italic
        .replace(/#{1,6}\s/g, "") // Remove headers
        .trim()

      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error("Failed to copy message")
    }
  }, [message.content])

  // Custom component for rendering citations in markdown
  const MarkdownComponents = useMemo(() => ({
    // Paragraph styling
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="leading-relaxed mb-4 last:mb-0">{children}</p>
    ),

    // Header styling with proper hierarchy
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-xl font-bold mb-3 mt-6 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-lg font-bold mb-2 mt-5 first:mt-0">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-base font-bold mb-2 mt-4 first:mt-0">{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h4>
    ),

    // List styling
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-5 mb-4 space-y-1.5">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-5 mb-4 space-y-1.5">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="mb-1 leading-relaxed">{children}</li>
    ),

    // Code styling
    code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
      if (inline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
            {children}
          </code>
        )
      }
      return (
        <code className={cn("block p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto", className)}>
          {children}
        </code>
      )
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="mb-4 rounded-lg overflow-hidden">{children}</pre>
    ),

    // Blockquote styling
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-3 border-primary/40 pl-4 my-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),

    // Link styling
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
      >
        {children}
      </a>
    ),

    // Strong/bold - handles citation rendering
    strong: ({ children }: { children?: React.ReactNode }) => {
      const text = String(children)
      const match = text.match(/^\[(\d+)\]$/)

      if (match) {
        let citationId = parseInt(match[1], 10)

        // Handle 0-indexed citations from LLM (map 0 -> 1)
        if (citationId === 0) citationId = 1

        const citation = message.citations && citationId <= message.citations.length
          ? message.citations[citationId - 1]
          : undefined

        if (citation) {
          // On mobile, trigger the sheet instead of popover
          if (isMobile && onCitationClick) {
            return (
              <button
                onClick={() => onCitationClick(citation, citationId)}
                className={cn(
                  "inline-flex items-center justify-center",
                  "min-w-[1.25rem] h-[1.25rem] px-1 mx-0.5",
                  "text-[10px] font-bold",
                  "rounded-sm transition-all duration-150",
                  "bg-primary/20 text-primary hover:bg-primary/30 hover:scale-105",
                  "active:bg-primary active:text-primary-foreground active:scale-110"
                )}
                aria-label={`View source ${citationId}: ${citation.filename || "Unknown"}`}
              >
                {citationId}
              </button>
            )
          }

          // Desktop: use the popover component
          return (
            <CitationPreview
              citation={citation}
              index={citationId}
              onViewSource={onViewSource}
              className="mx-0.5"
            />
          )
        }

        // Citation not found - render as inactive badge
        return (
          <span
            className="inline-flex items-center justify-center min-w-[1.25rem] h-[1.25rem] px-1 mx-0.5 text-[10px] font-bold rounded bg-muted/50 text-muted-foreground"
            title="Source not found"
          >
            {citationId}
          </span>
        )
      }

      // Regular bold text
      return <strong className="font-semibold">{children}</strong>
    },

    // Emphasis/italic
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),

    // Horizontal rule
    hr: () => <hr className="my-6 border-border" />,

    // Table styling
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-3 py-2 bg-muted text-left text-sm font-semibold border-b border-border">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-3 py-2 text-sm border-b border-border">{children}</td>
    ),
  }), [message.citations, isMobile, onCitationClick, onViewSource])

  return (
    <div className="space-y-3">
      {/* Markdown Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={MarkdownComponents as React.ComponentProps<typeof ReactMarkdown>["components"]}
        >
          {processedContent}
        </ReactMarkdown>

        {/* Streaming indicator */}
        {message.isStreaming && (
          <ThinkingIndicator hasContent={!!message.content} />
        )}

        {/* Citation Footer */}
        {message.citations && message.citations.length > 0 && !message.isStreaming && (
          <CitationFooter
            citations={message.citations}
            onViewSource={onViewSource}
          />
        )}
      </div>

      {/* Action Buttons */}
      {!message.isStreaming && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full bg-transparent"
            disabled={!onSaveToNote || isSavingNote}
            onClick={async () => {
              if (!onSaveToNote) return
              setIsSavingNote(true)
              try {
                await onSaveToNote(message.content)
              } finally {
                setIsSavingNote(false)
              }
            }}
          >
            {isSavingNote ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isSavingNote ? "Saving..." : "Save to note"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy message"}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-colors",
              feedbackStatus === "thumbs_up" && "bg-green-100 dark:bg-green-900/30"
            )}
            title="Helpful"
            disabled={isSubmittingFeedback}
            onClick={() => onFeedback("thumbs_up")}
          >
            <ThumbsUp className={cn(
              "w-4 h-4",
              feedbackStatus === "thumbs_up" && "fill-current text-green-600 dark:text-green-400"
            )} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full transition-colors",
              feedbackStatus === "thumbs_down" && "bg-red-100 dark:bg-red-900/30"
            )}
            title="Not helpful"
            disabled={isSubmittingFeedback}
            onClick={() => onFeedback("thumbs_down")}
          >
            <ThumbsDown className={cn(
              "w-4 h-4",
              feedbackStatus === "thumbs_down" && "fill-current text-red-600 dark:text-red-400"
            )} />
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN CHAT PANEL COMPONENT
// ============================================================================

export function ChatPanel({
  messages,
  sourceCount,
  notebookId,
  onSendMessage,
  onOpenSettings,
  onDeleteHistory,
  onViewSource,
  lastChatTurn,
  onNoteSaved
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const speechRecognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
    }
  }, [])
  const [mobileCitation, setMobileCitation] = useState<{
    citation: Citation
    index: number
  } | null>(null)
  const [messageFeedback, setMessageFeedback] = useState<Record<string, FeedbackRating | null>>({})
  const [submittingFeedback, setSubmittingFeedback] = useState<Record<string, boolean>>({})
  const [isEnhancing, setIsEnhancing] = useState(false)

  // Handle feedback submission for a message
  const handleFeedback = useCallback(async (messageId: string, rating: FeedbackRating) => {
    // If already the same rating, skip
    if (messageFeedback[messageId] === rating) return

    setSubmittingFeedback(prev => ({ ...prev, [messageId]: true }))
    try {
      await submitFeedback({
        content_type: "chat_response",
        content_id: messageId,
        rating: rating
      })
      setMessageFeedback(prev => ({ ...prev, [messageId]: rating }))
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setSubmittingFeedback(prev => ({ ...prev, [messageId]: false }))
    }
  }, [messageFeedback])

  // Handle saving a message to Studio notes
  const handleSaveToNote = useCallback(async (content: string) => {
    if (!notebookId) return
    
    try {
      const { generationApi } = await import("@/lib/api/generation")
      const { toast } = await import("sonner")
      const { marked } = await import("marked")
      const { sanitizeHtml } = await import("@/lib/sanitize")
      // Preprocess markdown (fix headers, bullets, etc.) then convert to HTML
      const preprocessed = preprocessMarkdownContent(content)
      const htmlContent = sanitizeHtml(await marked.parse(preprocessed))
      const title = `Chat Response - ${new Date().toLocaleDateString()}`
      
      await generationApi.createContent(
        notebookId,
        "note",
        { content: htmlContent },
        title
      )
      
      toast.success("Saved to Studio notes!")
      onNoteSaved?.()
    } catch (error) {
      console.error("Failed to save to note:", error)
      const { toast } = await import("sonner")
      toast.error("Failed to save to note")
    }
  }, [notebookId, onNoteSaved])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const {
    questions,
    conversationQuestions,
    isLoading: suggestionsLoading,
    isLoadingConversation,
    error: suggestionsError,
    documentCount,
    refresh: refreshSuggestions,
    refreshFromConversation
  } = useSuggestedQuestions(notebookId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Trigger conversation-based suggestions when last chat turn changes
  useEffect(() => {
    if (lastChatTurn?.userMessage && lastChatTurn?.assistantMessage) {
      refreshFromConversation(lastChatTurn.userMessage, lastChatTurn.assistantMessage)
    }
  }, [lastChatTurn, refreshFromConversation])

  // Determine which questions to show
  const displayQuestions = conversationQuestions.length > 0
    ? conversationQuestions.map((text, i) => ({ id: `conv-${i}`, text, context: null }))
    : questions

  const isLoadingSuggestions = suggestionsLoading || isLoadingConversation

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }, [input, onSendMessage])

  // Handle mobile citation click - opens the sheet
  const handleMobileCitationClick = useCallback((citation: Citation, index: number) => {
    setMobileCitation({ citation, index })
  }, [])

  // Handle closing mobile citation sheet
  const handleCloseMobileCitation = useCallback(() => {
    setMobileCitation(null)
  }, [])

  // Speech-to-Text handler
  const toggleSpeechRecognition = useCallback(() => {
    // Check if browser supports Web Speech API
    if (!speechSupported) {
      import("sonner").then(mod => mod.toast.error("Speech recognition is not supported in this browser. Use Chrome, Edge, or Safari."))
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      import("sonner").then(mod => mod.toast.error("Speech recognition is not supported in this browser. Use Chrome, Edge, or Safari."))
      return
    }

    if (isListening) {
      // Stop listening
      speechRecognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    // Start listening directly - let browser handle permissions natively with the "grey bubble"
    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = true // Let user speak continuously until they manually stop or submit
      recognition.interimResults = true // Enable interim results for live feedback in input
      recognition.lang = 'en-US'

      let baseText = ""

      recognition.onstart = () => {
        setIsListening(true)
        // Capture exactly what was in the input box before they started speaking
        setInput(prev => {
          baseText = prev ? prev.trim() + " " : ""
          return prev
        })
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Collect everything spoken in this exact recording session (both final and interim)
        const results = Array.from(event.results)
        const sessionTranscript = results
          .map((result: SpeechRecognitionResult) => result[0].transcript)
          .join('')
        
        // Update input live with previous text + what they are speaking right now
        setInput(baseText + sessionTranscript)
      }

      recognition.onerror = async (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') {
             // Ignore no-speech error, just stop
             setIsListening(false)
             return
        }
        
        console.error('Speech recognition error:', event.error)
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          const { toast } = await import("sonner")
          toast.error("Microphone access blocked. Click the lock icon in your address bar to allow.")
        } else {
             setIsListening(false)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      speechRecognitionRef.current = recognition
      recognition.start()
    } catch (e) {
      console.error("Failed to start speech recognition", e)
      setIsListening(false)
    }
  }, [isListening, speechSupported])

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm border border-border/40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-synapse-500" />
          <h2 className="font-semibold">Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="rounded-lg"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {onDeleteHistory && (
                <DropdownMenuItem
                  onClick={onDeleteHistory}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  Delete chat history
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div key={message.id}>
            {message.role === "user" ? (
              // User Message
              <div className="flex justify-end">
                <div className="flex flex-col items-end max-w-[85%] sm:max-w-md">
                  <span className="text-xs text-muted-foreground mb-1">
                    {message.timestamp}
                  </span>
                  <div className="bg-secondary px-4 py-2 rounded-2xl rounded-br-sm">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Assistant Message
              <AssistantMessage
                message={message}
                isMobile={isMobile}
                onViewSource={onViewSource}
                onCitationClick={handleMobileCitationClick}
                feedbackStatus={messageFeedback[message.id] || null}
                isSubmittingFeedback={submittingFeedback[message.id] || false}
                onFeedback={(rating) => handleFeedback(message.id, rating)}
                onSaveToNote={handleSaveToNote}
              />
            )}
          </div>
        ))}

        {/* Suggested Questions Section */}
        <div className="space-y-3">
          {/* Header with refresh button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                {conversationQuestions.length > 0
                  ? "Follow-up questions"
                  : "Suggested questions"}
              </span>
              {documentCount > 0 && conversationQuestions.length === 0 && (
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                  {documentCount} {documentCount === 1 ? "source" : "sources"}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={refreshSuggestions}
              disabled={isLoadingSuggestions}
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isLoadingSuggestions && "animate-spin")}
              />
            </Button>
          </div>

          {/* Loading skeleton */}
          {isLoadingSuggestions && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-14 rounded-lg border border-border bg-secondary/30 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty state - no documents */}
          {!isLoadingSuggestions &&
            documentCount === 0 &&
            conversationQuestions.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Add documents to get AI-generated question suggestions
                </p>
              </div>
            )}

          {/* Error state */}
          {!isLoadingSuggestions && suggestionsError && documentCount > 0 && (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Couldn't load suggestions
              </p>
              <Button variant="outline" size="sm" onClick={refreshSuggestions}>
                Try again
              </Button>
            </div>
          )}

          {/* Questions list */}
          {!isLoadingSuggestions && displayQuestions.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {displayQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => onSendMessage(question.text)}
                  className="group relative flex flex-col items-start p-3 h-auto text-left rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 shadow-sm"
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                      {question.text}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mt-1 shrink-0" />
                  </div>

                  {/* Context tooltip on hover */}
                  {question.context && (
                    <div className="max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 ease-in-out w-full">
                      <div className="pt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        <span className="truncate opacity-0 group-hover:opacity-100 transition-opacity delay-75">
                          {question.context.replace("Based on: ", "")}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-center gap-3 bg-secondary rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Start typing..."}
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Prompt Enhancer Button (New) */}
            <button
               type="button"
               disabled={isEnhancing || !input.trim()}
               onClick={async () => {
                   if (!input.trim() || !notebookId) return;
                   setIsEnhancing(true);
                   try {
                       const { apiClient } = await import("@/lib/api/client");
                       const { toast } = await import("sonner");
                       
                       const response = await apiClient<{ enhanced_message: string }>(
                           `/chat/${notebookId}/enhance_prompt`,
                           {
                               method: "POST",
                               body: JSON.stringify({ message: input })
                           }
                       );
                       
                       setInput(response.enhanced_message);
                       toast.success("Prompt enhanced!");
                   } catch (error) {
                       console.error("Failed to enhance prompt", error);
                       import("sonner").then(mod => mod.toast.error("Failed to enhance prompt"));
                   } finally {
                       setIsEnhancing(false);
                   }
               }}
               className={cn(
                   "p-2 hover:bg-secondary-foreground/10 rounded-full transition-colors text-muted-foreground hover:text-foreground",
                   isEnhancing && "animate-pulse cursor-not-allowed opacity-70"
               )}
               title="Enhance prompt"
            >
               {isEnhancing ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                   <Sparkles className="w-4 h-4" />
               )}
            </button>

            {/* Microphone button for STT */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              disabled={!speechSupported}
              className={cn(
                "p-2 rounded-full transition-all",
                !speechSupported && "opacity-50 cursor-not-allowed",
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "hover:bg-secondary-foreground/10 text-muted-foreground hover:text-foreground"
              )}
              title={!speechSupported ? "Speech recognition not supported in this browser" : isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {sourceCount} sources
            </span>
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 w-8 h-8"
              disabled={!input.trim()}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground pt-3 px-4 opacity-60">
          SynapseAI can be inaccurate; please double-check its responses.
        </p>
      </form>

      {/* Mobile Citation Sheet */}
      <CitationSheet
        citation={mobileCitation?.citation || null}
        isOpen={!!mobileCitation}
        onClose={handleCloseMobileCitation}
        onViewSource={onViewSource}
      />
    </div>
  )
}
