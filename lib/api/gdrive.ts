/**
 * Google Drive API client
 */

import { apiClient } from "./client"
import type {
  GoogleDriveAuthStatus,
  GoogleDriveFileListResponse,
  GoogleDriveFile,
  GoogleDriveImportResponse,
  GoogleDriveSearchParams,
} from "@/lib/types-gdrive"

const GDRIVE_ENDPOINT = "/sources/google"

/**
 * Get Google Drive connection status
 */
export async function getGoogleDriveStatus(): Promise<GoogleDriveAuthStatus> {
  return apiClient<GoogleDriveAuthStatus>(`${GDRIVE_ENDPOINT}/auth/status`)
}

/**
 * Get Google OAuth authorization URL
 */
export async function getGoogleDriveAuthUrl(state?: string): Promise<{ auth_url: string }> {
  const params = state ? `?state=${encodeURIComponent(state)}` : ""
  return apiClient<{ auth_url: string }>(`${GDRIVE_ENDPOINT}/auth/url${params}`)
}

/**
 * Handle OAuth callback (Legacy GET)
 */
export async function handleGoogleDriveCallback(
  code: string,
  state?: string
): Promise<{ success: boolean; message: string; redirect_url: string }> {
  // Use POST exchange if possible, otherwise fallback to GET
  // We'll wrap the POST response to match the expected return type
  try {
     const result = await exchangeGoogleDriveCode(code, state);
     return {
        success: result.success,
        message: result.message,
        redirect_url: "/settings?google=connected"
     };
  } catch (e) {
      console.warn("POST Exchange failed, falling back to legacy GET (likely fail too but worth trying if API mismatch)", e);
      const params = new URLSearchParams({ code });
      if (state) params.set("state", state);
      return apiClient(`${GDRIVE_ENDPOINT}/auth/callback?${params.toString()}`);
  }
}

/**
 * Exchange OAuth code for tokens (POST)
 */
export async function exchangeGoogleDriveCode(
    code: string,
    state?: string
): Promise<{ success: boolean; message: string }> {
    return apiClient(`${GDRIVE_ENDPOINT}/auth/exchange`, {
        method: "POST",
        body: JSON.stringify({ code, state }),
    });
}

/**
 * Disconnect Google Drive
 */
export async function disconnectGoogleDrive(): Promise<{ success: boolean; message: string }> {
  return apiClient(`${GDRIVE_ENDPOINT}/disconnect`, { method: "POST" })
}

/**
 * List files from Google Drive
 */
export async function listGoogleDriveFiles(
  params?: {
    folderId?: string | null
    pageSize?: number
    pageToken?: string | null
  }
): Promise<GoogleDriveFileListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.folderId) searchParams.set("folder_id", params.folderId)
  if (params?.pageSize) searchParams.set("page_size", params.pageSize.toString())
  if (params?.pageToken) searchParams.set("page_token", params.pageToken)

  const queryString = searchParams.toString()
  return apiClient<GoogleDriveFileListResponse>(
    `${GDRIVE_ENDPOINT}/files${queryString ? `?${queryString}` : ""}`
  )
}

/**
 * Search files in Google Drive
 */
export async function searchGoogleDriveFiles(
  searchParams: GoogleDriveSearchParams
): Promise<GoogleDriveFileListResponse> {
  const params = new URLSearchParams()
  params.set("query", searchParams.query || "")
  if (searchParams.mimeTypes?.length) {
    searchParams.mimeTypes.forEach((mime) => params.append("mime_types", mime))
  }
  if (searchParams.pageSize) params.set("page_size", searchParams.pageSize.toString())
  if (searchParams.pageToken) params.set("page_token", searchParams.pageToken)

  return apiClient<GoogleDriveFileListResponse>(
    `${GDRIVE_ENDPOINT}/files/search?${params.toString()}`
  )
}

/**
 * Get file metadata
 */
export async function getGoogleDriveFileMetadata(
  fileId: string
): Promise<{ success: boolean; file: GoogleDriveFile | null; error: string | null }> {
  return apiClient(`${GDRIVE_ENDPOINT}/files/${fileId}/metadata`)
}

/**
 * Import a file from Google Drive to a notebook
 */
export async function importGoogleDriveFile(
  fileId: string,
  notebookId: string,
  fileName?: string
): Promise<GoogleDriveImportResponse> {
  const params = new URLSearchParams()
  params.set("notebook_id", notebookId)
  if (fileName) params.set("file_name", fileName)

  return apiClient<GoogleDriveImportResponse>(
    `${GDRIVE_ENDPOINT}/files/${fileId}/import?${params.toString()}`,
    { method: "POST" }
  )
}

/**
 * Get icon for Google Drive file type
 */
export function getGoogleDriveFileIcon(mimeType: string): string {
  if (mimeType.includes("folder")) return "folder"
  if (mimeType.includes("pdf")) return "pdf"
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "sheet"
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "slide"
  if (mimeType.includes("document") || mimeType.includes("word")) return "doc"
  if (mimeType.includes("image")) return "image"
  if (mimeType.includes("video")) return "video"
  if (mimeType.includes("audio")) return "audio"
  if (mimeType.includes("text")) return "text"
  return "file"
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes?: number | string): string {
  if (!bytes) return ""
  
  const size = typeof bytes === "string" ? parseInt(bytes, 10) : bytes
  if (isNaN(size)) return ""

  const units = ["B", "KB", "MB", "GB", "TB"]
  let unitIndex = 0
  let fileSize = size

  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }

  return `${fileSize.toFixed(fileSize >= 10 ? 0 : 1)} ${units[unitIndex]}`
}
