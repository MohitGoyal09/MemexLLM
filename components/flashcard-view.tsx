"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Minimize2, Maximize2, ThumbsUp, ThumbsDown, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitFeedback } from "@/lib/api/feedback"
import type { FeedbackRating } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface FlashcardViewProps {
  title: string
  sourceCount: number
  flashcards: Flashcard[]
  contentId?: string
  onBack: () => void
}

export function FlashcardView({ title, sourceCount, flashcards, contentId, onBack }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackRating | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  // Handle feedback submission
  const handleFeedback = async (rating: FeedbackRating) => {
    if (!contentId || feedbackStatus === rating) return

    setIsSubmittingFeedback(true)
    try {
      await submitFeedback({
        content_type: "flashcard",
        content_id: contentId,
        rating: rating
      })
      setFeedbackStatus(rating)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const currentCard = flashcards[currentIndex]

  const goNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">
            Studio {">"} App
          </button>
          <button onClick={onBack} className="p-1 hover:bg-secondary rounded">
            <Minimize2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-primary">Based on {sourceCount} sources</p>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm perspective-1000" style={{ perspective: "1000px" }}>
          <div
            onClick={() => !isFlipped && setIsFlipped(true)}
            className={`
              relative w-full min-h-[200px] cursor-pointer
              transition-transform duration-500 transform-style-3d
              ${isFlipped ? "rotate-y-180" : ""}
            `}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className={`
                absolute inset-0
                bg-gradient-to-br from-slate-700 to-slate-800 
                rounded-2xl p-6 flex flex-col justify-between
                border border-slate-600/50 shadow-xl
              `}
              style={{ 
                backfaceVisibility: "hidden",
                transform: "rotateY(0deg)",
                WebkitBackfaceVisibility: "hidden"
              }}
            >
              <p className="text-lg font-medium leading-relaxed">{currentCard?.question}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFlipped(true)
                }}
                className="text-sm text-muted-foreground hover:text-foreground mt-4"
              >
                See answer
              </button>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-600 rounded-b-2xl overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Back */}
            <div
              className={`
                absolute inset-0
                bg-gradient-to-br from-slate-700 to-slate-800 
                rounded-2xl p-6 flex flex-col justify-between
                border border-slate-600/50 shadow-xl
              `}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-base leading-relaxed">{currentCard?.answer}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit gap-2 mt-4 bg-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-4 h-4" />
                Explain
              </Button>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-600 rounded-b-2xl overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-full bg-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            disabled={currentIndex === flashcards.length - 1}
            className="rounded-full bg-primary text-primary-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {/* Feedback */}
      <div className="p-4 border-t border-border flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 rounded-full bg-transparent transition-colors",
            feedbackStatus === "thumbs_up" && "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700"
          )}
          disabled={isSubmittingFeedback || !contentId}
          onClick={() => handleFeedback("thumbs_up")}
        >
          <ThumbsUp className={cn(
            "w-4 h-4",
            feedbackStatus === "thumbs_up" && "fill-current text-green-600 dark:text-green-400"
          )} />
          Good content
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2 rounded-full bg-transparent transition-colors",
            feedbackStatus === "thumbs_down" && "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
          )}
          disabled={isSubmittingFeedback || !contentId}
          onClick={() => handleFeedback("thumbs_down")}
        >
          <ThumbsDown className={cn(
            "w-4 h-4",
            feedbackStatus === "thumbs_down" && "fill-current text-red-600 dark:text-red-400"
          )} />
          Bad content
        </Button>
      </div>
    </div>
  )
}
