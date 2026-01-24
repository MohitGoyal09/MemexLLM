"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { SlidersHorizontal, MoreVertical, Pin, Copy, ThumbsUp, ThumbsDown, ArrowRight, RefreshCw, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Citation } from "@/lib/api/types"
import { CitationPreview, CitationFooter } from "@/components/citation-preview"
import { useSuggestedQuestions } from "@/hooks/use-suggested-questions"
import { cn } from "@/lib/utils"

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
  lastChatTurn?: LastChatTurn | null
}

export function ChatPanel({ 
  messages, 
  sourceCount, 
  notebookId, 
  onSendMessage, 
  onOpenSettings, 
  onDeleteHistory,
  lastChatTurn 
}: ChatPanelProps) {
  const [input, setInput] = useState("")
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

  // Trigger conversation-based suggestions when last chat turn changes
  useEffect(() => {
    if (lastChatTurn?.userMessage && lastChatTurn?.assistantMessage) {
      refreshFromConversation(lastChatTurn.userMessage, lastChatTurn.assistantMessage)
    }
  }, [lastChatTurn, refreshFromConversation])

  // Determine which questions to show:
  // - If we have conversation-based questions, use those (they're more relevant)
  // - Otherwise fall back to document-based questions
  const displayQuestions = conversationQuestions.length > 0 
    ? conversationQuestions.map((text, i) => ({ id: `conv-${i}`, text, context: null }))
    : questions
  
  const isLoadingSuggestions = suggestionsLoading || isLoadingConversation

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">Chat</h2>
        <div className="flex items-center gap-2">
          {onOpenSettings && (
            <Button variant="ghost" size="icon" onClick={onOpenSettings} className="rounded-lg">
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
                <DropdownMenuItem onClick={onDeleteHistory} className="text-destructive focus:text-destructive cursor-pointer">
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
              <div className="flex justify-end">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground mb-1">{message.timestamp}</span>
                  <div className="bg-secondary px-4 py-2 rounded-2xl rounded-br-sm max-w-md">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {/* Renders properly formatted markdown with line breaks and citations */}
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Custom styling for common elements
                        p: ({children}) => <p className="leading-relaxed mb-4 last:mb-0">{children}</p>,
                        h1: ({children}) => <h1 className="text-xl font-bold mb-3 mt-6">{children}</h1>,
                        h2: ({children}) => <h2 className="text-lg font-bold mb-2 mt-5">{children}</h2>,
                        h3: ({children}) => <h3 className="text-md font-bold mb-2 mt-4">{children}</h3>,
                        ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        strong: ({children}) => {
                            const text = String(children);
                            const match = text.match(/^\[(\d+)\]$/);
                            if (match) {
                                let id = parseInt(match[1]);

                                // Handle 0-indexed citations from LLM (map 0 -> 1)
                                if (id === 0) id = 1;

                                // Assuming citations are 1-indexed in text, so index is id-1
                                // Safety check for bounds
                                const citation = message.citations && id <= message.citations.length ? message.citations[id - 1] : undefined;

                                if (citation) {
                                    return (
                                        <CitationPreview
                                            citation={citation}
                                            index={id}
                                            className="mx-0.5"
                                        />
                                    );
                                }
                            }
                            return <strong className="font-bold">{children}</strong>;
                        },
                    }}
                  >
                    {/* Pre-process content to fix common LLM formatting issues */}
                    {(() => {
                        let content = message.content || "";
                        
                        // 1. Force headers to be on their own lines (fix "text.### Header")
                        content = content.replace(/([^\n])\s*(#{1,3})\s/g, '$1\n\n$2 ');
                        
                        // 2. Fix bullet points mashed into text (fix "text.* Item")
                        content = content.replace(/([^\n])\s*(\*|\-)\s/g, '$1\n\n$2 ');

                        // 3. AUTO-FIX CITATIONS: Convert plain [1] to **[1]** if not already bold
                        // This uses a negative lookbehind/lookahead equivalent logic to avoid double-bolding
                        // Regex explanation: Match [N] that is NOT preceded by ** and NOT followed by **
                        content = content.replace(/(?<!\*\* )(\[\d+\])(?!\*\*)/g, '**$1**');
                        
                        return content;
                    })()}
                  </ReactMarkdown>
                  
                  {/* Enhanced citation footer with expandable previews */}
                  {message.citations && message.citations.length > 0 && (
                    <CitationFooter citations={message.citations} />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full bg-transparent">
                    <Pin className="w-4 h-4" />
                    Save to note
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Suggested Questions Section */}
        <div className="space-y-3">
          {/* Header with refresh button */}
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{conversationQuestions.length > 0 ? 'Follow-up questions' : 'Suggested questions'}</span>
              {documentCount > 0 && conversationQuestions.length === 0 && (
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                  {documentCount} {documentCount === 1 ? 'source' : 'sources'}
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
              <RefreshCw className={cn("w-3.5 h-3.5", isLoadingSuggestions && "animate-spin")} />
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
          {!isLoadingSuggestions && documentCount === 0 && conversationQuestions.length === 0 && (
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

          {/* Questions list - shows conversation or document-based questions */}
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
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex items-center gap-3 bg-secondary rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Start typing..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-xs text-white">G</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{sourceCount} sources</span>
            <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90 w-8 h-8">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground pb-3">
        SynapseAI can be inaccurate; please double-check its responses.
      </p>
    </div>
  )
}
