import { apiClient } from "./client";
import type { Notebook, CreateNotebookRequest, UpdateNotebookRequest } from "./types";

export const notebooksApi = {
  /**
   * List all notebooks for the authenticated user
   */
  list: () => apiClient<Notebook[]>("/notebooks"),

  /**
   * Get a specific notebook by ID
   */
  get: (id: string) => apiClient<Notebook>(`/notebooks/${id}`),

  /**
   * Create a new notebook
   */
  create: (data: CreateNotebookRequest) =>
    apiClient<Notebook>("/notebooks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Update notebook title and/or settings
   */
  update: (id: string, data: UpdateNotebookRequest) =>
    apiClient<Notebook>(`/notebooks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /**
   * Delete a notebook and all associated data
   */
  delete: (id: string) =>
    apiClient<void>(`/notebooks/${id}`, { method: "DELETE" }),
};
