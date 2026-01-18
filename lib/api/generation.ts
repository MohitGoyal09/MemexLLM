import { apiClient } from "./client";
import type {
  ContentType,
  GeneratedContent,
  AsyncGenerationResponse,
  TaskStatusResponse,
  TaskProgressResponse,
} from "./types";

// Response types for content listing
export interface ContentItemResponse {
  id: string;
  notebook_id: string;
  document_id: string | null;
  content_type: ContentType;
  status: "pending" | "processing" | "completed" | "failed";
  content: Record<string, unknown>;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentListResponse {
  items: ContentItemResponse[];
  total: number;
}

export const generationApi = {
  /**
   * List all generated content for a notebook
   */
  listContent: (notebookId: string, contentType?: ContentType) => {
    const params = contentType ? `?content_type=${contentType}` : "";
    return apiClient<ContentListResponse>(
      `/generation/${notebookId}/content${params}`
    );
  },

  /**
   * Get a specific generated content item
   */
  getContent: (notebookId: string, contentId: string) =>
    apiClient<ContentItemResponse>(
      `/generation/${notebookId}/content/${contentId}`
    ),

  /**
   * Generate content synchronously (waits for completion)
   */
  generate: (
    notebookId: string,
    contentType: ContentType,
    documentIds?: string[]
  ) =>
    apiClient<GeneratedContent>(`/generation/${notebookId}/generate`, {
      method: "POST",
      body: JSON.stringify({
        content_type: contentType,
        document_ids: documentIds || null,
      }),
    }),

  /**
   * Generate content asynchronously (returns task ID for polling)
   */
  generateAsync: (
    notebookId: string,
    contentType: ContentType,
    documentIds?: string[]
  ) =>
    apiClient<AsyncGenerationResponse>(
      `/generation/${notebookId}/generate?async_mode=true`,
      {
        method: "POST",
        body: JSON.stringify({
          content_type: contentType,
          document_ids: documentIds || null,
        }),
      }
    ),

  /**
   * Delete a specific generated content item
   */
  deleteContent: (notebookId: string, contentId: string) =>
    apiClient<void>(`/generation/${notebookId}/content/${contentId}`, {
      method: "DELETE",
    }),

  /**
   * Delete all generated content of a specific type
   */
  deleteByType: (notebookId: string, contentType: ContentType) =>
    apiClient<void>(`/generation/${notebookId}?content_type=${contentType}`, {
      method: "DELETE",
    }),
};

export const tasksApi = {
  /**
   * Get the status of a background task
   */
  getStatus: (jobId: number) =>
    apiClient<TaskStatusResponse>(`/tasks/${jobId}`),

  /**
   * Get detailed progress of a background task
   */
  getProgress: (jobId: number) =>
    apiClient<TaskProgressResponse>(`/tasks/${jobId}/progress`),

  /**
   * Request cancellation of a background task
   */
  cancel: (jobId: number) =>
    apiClient<{ message: string; job_id: number }>(`/tasks/${jobId}/cancel`, {
      method: "POST",
    }),

  /**
   * Poll task progress until completion
   * @param jobId - The task ID to poll
   * @param onProgress - Callback for progress updates
   * @param intervalMs - Polling interval in milliseconds
   * @returns Final task status
   */
  pollUntilComplete: async (
    jobId: number,
    onProgress?: (progress: TaskProgressResponse) => void,
    intervalMs = 2000
  ): Promise<TaskStatusResponse> => {
    const terminalStatuses = ["succeeded", "failed", "aborted"];

    while (true) {
      const status = await tasksApi.getStatus(jobId);

      if (terminalStatuses.includes(status.status)) {
        return status;
      }

      // Get progress and notify
      try {
        const progress = await tasksApi.getProgress(jobId);
        onProgress?.(progress);
      } catch {
        // Progress might not be available yet
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  },
};
