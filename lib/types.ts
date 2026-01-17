export type SourceType = "pdf" | "doc" | "image" | "video" | "audio" | "link" | "text" | "file"

export interface Source {
  id: string
  name: string
  type: SourceType
}
