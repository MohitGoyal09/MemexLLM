"use client"

import type React from "react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { SlidersHorizontal, MoreVertical, Pin, Copy, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Citation } from "@/lib/api/types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  citations?: Citation[]
}

interface ChatPanelProps {
  messages: Message[]
  sourceCount: number
  onSendMessage: (content: string) => void
  onOpenSettings?: () => void
  onDeleteHistory?: () => void
}

const suggestedQuestions = [
  "How does the Transformer-Squared framework enable large language models to adapt dynamically?",
  "What role does Singular Value Decomposition play in modifying model weights efficiently?",
  "Which challenges regarding resource intensity and ethics impact the deployment of these models?",
]

export function ChatPanel({ messages, sourceCount, onSendMessage, onOpenSettings, onDeleteHistory }: ChatPanelProps) {
  const [input, setInput] = useState("")

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
                                const id = parseInt(match[1]);
                                // Assuming citations are 1-indexed in text, so index is id-1
                                const citation = message.citations && message.citations[id - 1];
                                if (citation) {
                                    return (
                                        <span className="relative group inline-block cursor-help text-teal-500 hover:bg-teal-500/10 rounded px-0.5 transition-colors align-baseline mx-0.5">
                                            <span className="font-bold">[{id}]</span>
                                            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-secondary text-secondary-foreground text-xs rounded-md border shadow-md z-50 pointer-events-none">
                                                <span className="block font-semibold mb-1 text-teal-600">Source {id}</span>
                                                <span className="line-clamp-4 italic">"{citation.text_preview}"</span>
                                            </div>
                                        </span>
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
                  
                  {/* Append separate citation tags if they exist in metadata but not in text */}
                  {message.citations && message.citations.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground mr-1">Sources:</span>
                         {message.citations.map((cite, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 text-teal-500 text-[10px] font-bold border border-teal-500/20 cursor-help"
                              title={cite.text_preview}
                            >
                              {idx + 1}
                            </span>
                          ))}
                     </div>
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

        {/* Suggested Questions */}
        <div className="space-y-2">
          {suggestedQuestions.map((question, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(question)}
              className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
            >
              {question}
            </button>
          ))}
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
