export type SourceType = "pdf" | "doc" | "image" | "video" | "audio" | "link" | "text" | "file"
export type SourceStatus = "pending" | "processing" | "completed" | "failed"

export interface Source {
  id: string
  name: string
  type: SourceType
  status?: SourceStatus
  chunkCount?: number
  mimeType?: string
  errorMessage?: string | null
  preview?: string | null
}

