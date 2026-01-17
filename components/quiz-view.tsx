"use client"

import { useState } from "react"
import { Minimize2, Maximize2, ThumbsUp, ThumbsDown, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  onBack: () => void
}

export function QuizView({ title, sourceCount, questions, onBack }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (index: number) => {
    if (!showResult) {
      setSelectedAnswer(index)
    }
  }

  const handleNext = () => {
    if (selectedAnswer === null) return

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setShowResult(true)
    }
  }

  const getOptionStyle = (index: number) => {
    if (showResult) {
      if (index === currentQuestion.correctAnswer) {
        return "border-green-500 bg-green-500/10"
      }
      if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
        return "border-red-500 bg-red-500/10"
      }
    }
    if (selectedAnswer === index) {
      return "border-primary bg-primary/10"
    }
    return "border-border hover:border-muted-foreground"
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
        <div className="mb-6">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <p className="text-lg font-medium mb-6 leading-relaxed">{currentQuestion?.question}</p>

        <div className="space-y-3">
          {currentQuestion?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                ${getOptionStyle(index)}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {showResult && index === currentQuestion.correctAnswer && <Check className="w-5 h-5 text-green-500" />}
                {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center">
          <div className="h-1 bg-muted rounded-full w-full max-w-xs overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-3">
        <Button onClick={handleNext} disabled={selectedAnswer === null} className="w-full rounded-full">
          {currentIndex < questions.length - 1 ? "Next" : "Finish"}
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 rounded-full bg-transparent">
            <ThumbsUp className="w-4 h-4" />
            Good content
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-full bg-transparent">
            <ThumbsDown className="w-4 h-4" />
            Bad content
          </Button>
        </div>
      </div>
    </div>
  )
}
