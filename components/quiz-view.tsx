"use client"

import { useState } from "react"
import { Minimize2, Maximize2, ThumbsUp, ThumbsDown, Check, X, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitFeedback } from "@/lib/api/feedback"
import type { FeedbackRating } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizViewProps {
  title: string
  sourceCount: number
  questions: QuizQuestion[]
  contentId?: string
  onBack: () => void
}

export function QuizView({ title, sourceCount, questions, contentId, onBack }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false) // Track if current question is answered
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false) // Track if quiz is finished
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackRating | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  // Handle feedback submission
  const handleFeedback = async (rating: FeedbackRating) => {
    if (!contentId || feedbackStatus === rating) return

    setIsSubmittingFeedback(true)
    try {
      await submitFeedback({
        content_type: "quiz",
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

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (index: number) => {
    // Only allow selection if not already answered
    if (hasAnswered) return
    
    setSelectedAnswer(index)
    setHasAnswered(true)
    
    // Update score immediately
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (!hasAnswered) return

    if (currentIndex < questions.length - 1) {
      // Go to next question
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setHasAnswered(false)
    } else {
      // Quiz complete - show results
      setIsComplete(true)
    }
  }

  const handleFinish = () => {
    // Return to studio panel
    onBack()
  }

  const getOptionStyle = (index: number) => {
    // Show result immediately after answering
    if (hasAnswered) {
      if (index === currentQuestion.correctAnswer) {
        return "border-green-500 bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
      }
      if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
        return "border-red-500 bg-red-500/20"
      }
    }
    if (selectedAnswer === index && !hasAnswered) {
      return "border-primary bg-primary/10"
    }
    return "border-border hover:border-muted-foreground"
  }

  // Show completion screen
  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100)
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

        {/* Completion Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-4xl font-bold text-primary mb-2">{score}/{questions.length}</p>
          <p className="text-muted-foreground mb-6">{percentage}% correct</p>
          
          <div className="w-full max-w-xs h-3 bg-muted rounded-full overflow-hidden mb-6">
            <div
              className={`h-full transition-all duration-500 ${percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {percentage >= 70 ? "Great job! You've mastered this material." :
             percentage >= 40 ? "Good effort! Review the material to improve." :
             "Keep studying! Practice makes perfect."}
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <Button onClick={handleFinish} className="w-full rounded-full">
            Back to Studio
          </Button>
        </div>
      </div>
    )
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

      {/* Quiz Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-sm font-medium text-primary">
            Score: {score}
          </span>
        </div>

        <p className="text-lg font-medium mb-6 leading-relaxed">{currentQuestion?.question}</p>

        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={hasAnswered}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                ${getOptionStyle(index)}
                ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {hasAnswered && index === currentQuestion.correctAnswer && <Check className="w-5 h-5 text-green-500" />}
                {hasAnswered && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback message after answering */}
        {hasAnswered && (
          <div className={`mt-4 p-3 rounded-lg ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {selectedAnswer === currentQuestion.correctAnswer
              ? <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Correct!</span>
              : `✗ Incorrect. The correct answer is ${String.fromCharCode(65 + currentQuestion.correctAnswer)}.`
            }
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center">
          <div className="h-1 bg-muted rounded-full w-full max-w-xs overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${score / questions.length >= 0.7 ? 'bg-green-500' : score / questions.length >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-3">
        <Button onClick={handleNext} disabled={!hasAnswered} className="w-full rounded-full">
          {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-full bg-transparent transition-colors",
              feedbackStatus === "thumbs_up" && "bg-success/10 border-success/50"
            )}
            disabled={isSubmittingFeedback || !contentId}
            onClick={() => handleFeedback("thumbs_up")}
          >
            <ThumbsUp className={cn(
              "w-4 h-4",
              feedbackStatus === "thumbs_up" && "fill-current text-success"
            )} />
            Good content
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-full bg-transparent transition-colors",
              feedbackStatus === "thumbs_down" && "bg-destructive/10 border-destructive/50"
            )}
            disabled={isSubmittingFeedback || !contentId}
            onClick={() => handleFeedback("thumbs_down")}
          >
            <ThumbsDown className={cn(
              "w-4 h-4",
              feedbackStatus === "thumbs_down" && "fill-current text-destructive"
            )} />
            Bad content
          </Button>
        </div>
      </div>
    </div>
  )
}
