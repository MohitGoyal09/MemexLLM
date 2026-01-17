import { apiClient, apiUpload } from "./client";
import type { Document, UploadDocumentResponse, DocumentUrlResponse } from "./types";

export const documentsApi = {
  /**
   * List all documents in a notebook
   */
  list: (notebookId: string) =>
    apiClient<Document[]>(`/documents/notebook/${notebookId}`),

  /**
   * Upload a document to a notebook
   */
  upload: (notebookId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notebook_id", notebookId);
    return apiUpload<UploadDocumentResponse>("/documents/upload", formData);
  },

  /**
   * Get a signed URL to view/download a document
   */
  getUrl: (documentId: string) =>
    apiClient<DocumentUrlResponse>(`/documents/${documentId}/url`),

  /**
   * Delete a document
   */
  delete: (documentId: string) =>
    apiClient<void>(`/documents/${documentId}`, { method: "DELETE" }),
};
