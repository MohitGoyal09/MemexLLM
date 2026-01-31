"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generationApi, ContentItemResponse, tasksApi } from "@/lib/api/generation";
import type { ContentType, TaskStatusResponse } from "@/lib/api/types";

export interface StudioItem {
  id: string;
  title: string;
  sourceCount: number;
  timeAgo: string;
  type: "quiz" | "audio" | "flashcards" | "mindmap" | "report" | "note";
  status: "pending" | "processing" | "completed" | "failed";
  isNew: boolean;
  hasInteractive?: boolean;
  content?: Record<string, unknown>;
  audioUrl?: string | null;
}

// Map backend content types to frontend display types
const contentTypeToDisplayType = (
  contentType: ContentType
): StudioItem["type"] => {
  const map: Record<ContentType, StudioItem["type"]> = {
    podcast: "audio",
    quiz: "quiz",
    flashcard: "flashcards",
    mindmap: "mindmap",
    note: "note",
  };
  return map[contentType] || "report";
};

// Map tool labels to content types
const toolLabelToContentType = (toolLabel: string): ContentType | null => {
  const map: Record<string, ContentType> = {
    "Audio": "podcast",
    "Audio Overview": "podcast", // Keep for backwards compatibility
    Quiz: "quiz",
    Flashcards: "flashcard",
    "Mind Map": "mindmap",
  };
  return map[toolLabel] || null;
};

// Generate display title from content type
const generateTitle = (contentType: ContentType, content?: Record<string, unknown>): string => {
  // Try to get title from content if available
  if (content && typeof content === "object") {
    if ("title" in content && typeof content.title === "string") {
      return content.title;
    }
  }
  
  const defaultTitles: Record<ContentType, string> = {
    podcast: "Audio Overview",
    quiz: "Quiz",
    flashcard: "Flashcards",
    mindmap: "Mind Map",
    note: "Note",
  };
  return defaultTitles[contentType] || "Generated Content";
};

// Format time ago from ISO string
const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Convert backend response to frontend StudioItem
const toStudioItem = (item: ContentItemResponse, isNew = false): StudioItem => ({
  id: item.id,
  title: generateTitle(item.content_type, item.content),
  sourceCount: 5, // TODO: Get actual source count from backend
  timeAgo: formatTimeAgo(item.created_at),
  type: contentTypeToDisplayType(item.content_type),
  status: item.status,
  isNew,
  hasInteractive: item.content_type === "podcast",
  content: item.content,
  audioUrl: item.audio_url,
});

interface UseStudioOptions {
  notebookId: string;
  pollInterval?: number;
}

interface GeneratingTask {
  toolLabel: string;
  taskId?: number;
  contentId: string;
}

export function useStudio({ notebookId, pollInterval = 3000 }: UseStudioOptions) {
  const [items, setItems] = useState<StudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingTool, setGeneratingTool] = useState<string | null>(null);
  const [generatingTasks, setGeneratingTasks] = useState<GeneratingTask[]>([]);
  
  const newItemIds = useRef<Set<string>>(new Set());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch content list
  const fetchContent = useCallback(async () => {
    try {
      const response = await generationApi.listContent(notebookId);
      
      // Deduplicate by content ID (in case backend returns duplicates)
      const seenIds = new Map<string, ContentItemResponse>();
      response.items.forEach((item) => {
        seenIds.set(item.id, item);
      });
      
      const studioItems = Array.from(seenIds.values()).map((item) =>
        toStudioItem(item, newItemIds.current.has(item.id))
      );
      setItems(studioItems);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch studio content:", err);
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  // Initial fetch
  useEffect(() => {
    if (notebookId) {
      fetchContent();
    } else {
      // No notebook ID - nothing to fetch
      setLoading(false);
      setItems([]);
    }
  }, [notebookId, fetchContent]);

  // Poll for updates when there are generating tasks
  useEffect(() => {
    if (generatingTasks.length === 0) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const pollTasks = async () => {
      for (const task of generatingTasks) {
        try {
          if (task.taskId) {
            // Poll task status
            const status = await tasksApi.getStatus(task.taskId);
            
            if (status.status === "succeeded" || status.status === "failed" || status.status === "aborted") {
              // Task completed - remove from generating list
              setGeneratingTasks((prev) =>
                prev.filter((t) => t.contentId !== task.contentId)
              );
              
              if (status.status === "succeeded") {
                // Mark as new and refresh
                newItemIds.current.add(task.contentId);
                setTimeout(() => {
                  newItemIds.current.delete(task.contentId);
                }, 5000);
              }
              
              // Refresh content list
              await fetchContent();
              
              // Only clear generatingTool if NO tasks remaining
              setGeneratingTasks((prev) => {
                if (prev.length === 0) {
                  setGeneratingTool(null);
                }
                return prev;
              });
            }
          } else {
            // No task ID - poll content directly
            const content = await generationApi.getContent(notebookId, task.contentId);
            
            if (content.status === "completed" || content.status === "failed") {
              setGeneratingTasks((prev) =>
                prev.filter((t) => t.contentId !== task.contentId)
              );
              
              if (content.status === "completed") {
                newItemIds.current.add(task.contentId);
                setTimeout(() => {
                  newItemIds.current.delete(task.contentId);
                }, 5000);
              }
              
              await fetchContent();
              
              // Only clear generatingTool if NO tasks remaining
              setGeneratingTasks((prev) => {
                if (prev.length === 0) {
                  setGeneratingTool(null);
                }
                return prev;
              });
            }
          }
        } catch (err) {
          // 403 often means task_progress record not created yet - just retry next interval
          if (err instanceof Error && err.message.includes("403")) {
            console.log("Task polling: 403 (likely race condition), will retry...");
          } else {
            console.error("Failed to poll task:", err);
          }
        }
      }
    };

    pollIntervalRef.current = setInterval(pollTasks, pollInterval);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [generatingTasks, notebookId, pollInterval, fetchContent]);

  // Generate content
  const generateContent = useCallback(
    async (toolLabel: string) => {
      const contentType = toolLabelToContentType(toolLabel);
      if (!contentType) {
        console.error("Unknown tool label:", toolLabel);
        return;
      }

      setGeneratingTool(toolLabel);

      try {
        // Try async generation first
        const response = await generationApi.generateAsync(notebookId, contentType);
        
        // Optimistically add to list immediately
        const optimisticItem: StudioItem = {
          id: response.content_id,
          title: generateTitle(contentType),
          sourceCount: 5, // Placeholder until refetch
          timeAgo: "Just now",
          type: contentTypeToDisplayType(contentType),
          status: "processing", // Show as processing immediately
          isNew: true,
          hasInteractive: contentType === "podcast",
          content: undefined
        };

        setItems(prev => [optimisticItem, ...prev]);
        newItemIds.current.add(response.content_id);

        // Fetch latest state from server to confirm
        fetchContent();
        
        // Add to generating tasks for polling (check for duplicates first)
        setGeneratingTasks((prev) => {
          // Don't add if already tracking this content
          if (prev.some((t) => t.contentId === response.content_id)) {
            console.log("Already tracking content generation:", response.content_id);
            return prev;
          }
          
          return [
            ...prev,
            {
              toolLabel,
              taskId: response.task_id,
              contentId: response.content_id,
            },
          ];
        });
      } catch (err) {
        console.error("Async generation failed, trying sync:", err);
        
        try {
          // Fallback to sync generation
          const result = await generationApi.generate(notebookId, contentType);
          
          // Refresh content list
          await fetchContent();
          setGeneratingTool(null);
        } catch (syncErr) {
          console.error("Sync generation also failed:", syncErr);
          setError("Failed to generate content");
          setGeneratingTool(null);
        }
      }
    },
    [notebookId, fetchContent]
  );

  // Delete content
  const deleteContent = useCallback(
    async (contentId: string) => {
      try {
        await generationApi.deleteContent(notebookId, contentId);
        setItems((prev) => prev.filter((item) => item.id !== contentId));
      } catch (err) {
        console.error("Failed to delete content:", err);
        setError("Failed to delete content");
      }
    },
    [notebookId]
  );

  // Refresh content list
  const refresh = useCallback(() => {
    setLoading(true);
    fetchContent();
  }, [fetchContent]);

  return {
    items,
    loading,
    error,
    generatingTool,
    generateContent,
    deleteContent,
    refresh,
  };
}
