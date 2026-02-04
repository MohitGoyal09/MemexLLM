/**
 * Google Drive types and interfaces
 */

export type GoogleDriveFileType = 
  | "folder"
  | "pdf"
  | "doc"
  | "sheet"
  | "slide"
  | "image"
  | "video"
  | "audio"
  | "text"
  | "file"

export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  type: GoogleDriveFileType
  size?: string | number
  sizeBytes?: number
  thumbnailUrl?: string | null
  webViewUrl?: string
  createdTime?: string
  modifiedTime?: string
  parents?: string[]
  owner?: {
    displayName?: string
    email?: string
  }
  indexed?: boolean
  status?: "idle" | "indexing" | "indexed" | "error"
  errorMessage?: string | null
}

export interface GoogleDriveFolder {
  id: string
  name: string
  path: string // Breadcrumb path
}

export interface GoogleDriveAuthStatus {
  configured: boolean
  connected: boolean
  email: string | null
}

export interface GoogleDriveFileListResponse {
  success: boolean
  files: GoogleDriveFile[]
  nextPageToken: string | null
  folderId: string | null
}

export interface GoogleDriveImportResponse {
  success: boolean
  documentId: string | null
  message: string
}

export interface GoogleDriveImportProgress {
  fileId: string
  fileName: string
  status: "pending" | "importing" | "completed" | "failed"
  progress: number
  error?: string
}

export interface GoogleDriveSearchParams {
  query?: string
  mimeTypes?: string[]
  pageSize?: number
  pageToken?: string
  folderId?: string
}
