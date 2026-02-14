

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, ThumbsUp, ThumbsDown, X, MoreVertical, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { submitFeedback } from "@/lib/api/feedback"
import type { FeedbackRating } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface AudioPlayerViewProps {
  title: string
  duration: string
  url?: string
  contentId?: string
  onClose: () => void
}

export function AudioPlayerView({ title, duration, url, contentId, onClose }: AudioPlayerViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackRating | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Handle feedback submission
  const handleFeedback = async (rating: FeedbackRating) => {
    if (!contentId || feedbackStatus === rating) return

    setIsSubmittingFeedback(true)
    try {
      await submitFeedback({
        content_type: "podcast",
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

  // Reset feedback when content changes
  useEffect(() => {
    setFeedbackStatus(null)
  }, [contentId])

  // Handle URL changes - Managed by key={url} and src={url} now
  useEffect(() => {
    if (url) {
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [url])

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((e) => {
        console.error("Playback failed:", e)
        // Ensure UI reflects failed state
        setIsPlaying(false)
      })
    }
  }

  // Update time and state
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  // Event Driven State Sync
  const onPlay = () => setIsPlaying(true)
  const onPause = () => setIsPlaying(false)

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const newTime = percentage * (audioDuration || 1)
      
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Use the loaded duration for progress bar if available, otherwise 0
  const totalSeconds = audioDuration || 0
  const progressPercent = totalSeconds > 0 ? (currentTime / totalSeconds) * 100 : 0

  return (
    <div className="border-t border-border bg-card p-4">
      {/* Hidden Audio Element */}
      <audio
        key={url} // Force re-mount on URL change to fix caching issues
        ref={audioRef}
        src={url}
        preload="auto"
        crossOrigin="anonymous" // Support CORS for audio data
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={onPlay}
        onPause={onPause}
        onError={(e) => {
          const target = e.currentTarget;
          console.error("Audio error code:", target.error?.code);
          console.error("Audio error message:", target.error?.message);
          console.error("Audio source:", url);
        }}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate max-w-[200px]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-7 h-7 transition-colors",
              feedbackStatus === "thumbs_up" && "bg-success/10"
            )}
            disabled={isSubmittingFeedback || !contentId}
            onClick={() => handleFeedback("thumbs_up")}
          >
            <ThumbsUp className={cn(
              "w-4 h-4",
              feedbackStatus === "thumbs_up" && "fill-current text-success"
            )} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-7 h-7 transition-colors",
              feedbackStatus === "thumbs_down" && "bg-destructive/10"
            )}
            disabled={isSubmittingFeedback || !contentId}
            onClick={() => handleFeedback("thumbs_down")}
          >
            <ThumbsDown className={cn(
              "w-4 h-4",
              feedbackStatus === "thumbs_down" && "fill-current text-destructive"
            )} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-7 h-7">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  if (url) {
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`
                    link.target = '_blank'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }
                }}
                disabled={!url}
                className="cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" />
                Download audio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={togglePlay}
          size="icon"
          className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90"
          disabled={!url}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>

        <div className="flex-1">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 bg-muted rounded-full cursor-pointer relative group"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(currentTime)} / {duration}
        </span>
      </div>
    </div>
  )
}
