"use client"

import type React from "react"

import { useState } from "react"
import { SlidersHorizontal, MoreVertical, Pin, Copy, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  citations?: number[]
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
                  {message.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-sm leading-relaxed">
                      {paragraph.split("**").map((part, j) => (j % 2 === 1 ? <strong key={j}>{part}</strong> : part))}
                      {message.citations && i === 0 && (
                        <span className="inline-flex gap-1 ml-1">
                          {message.citations.map((cite) => (
                            <span
                              key={cite}
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-medium"
                            >
                              {cite}
                            </span>
                          ))}
                        </span>
                      )}
                    </p>
                  ))}
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
