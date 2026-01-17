"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, ThumbsUp, ThumbsDown, X, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AudioPlayerViewProps {
  title: string
  duration: string
  onClose: () => void
}

export function AudioPlayerView({ title, duration, onClose }: AudioPlayerViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration] = useState(978) // 16:18 in seconds
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, totalDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      setCurrentTime(Math.floor(percentage * totalDuration))
    }
  }

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate max-w-[200px]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <ThumbsDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7">
            <MoreVertical className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          size="icon"
          className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90"
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
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${(currentTime / totalDuration) * 100}% - 6px)` }}
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
