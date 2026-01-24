"use client";

import { useState, useEffect, useCallback } from "react";
import { chatApi } from "@/lib/api/chat";
import type { SuggestedQuestion, SuggestionsResponse } from "@/lib/api/types";

interface UseSuggestedQuestionsResult {
  questions: SuggestedQuestion[];
  conversationQuestions: string[];
  isLoading: boolean;
  isLoadingConversation: boolean;
  error: Error | null;
  documentCount: number;
  refresh: () => Promise<void>;
  refreshFromConversation: (userMsg: string, aiMsg: string) => Promise<void>;
}

/**
 * Hook for fetching AI-generated suggested questions.
 * 
 * Supports two modes:
 * 1. Document-based: Initial questions based on notebook content (on mount)
 * 2. Conversation-based (Option B): Dynamic questions after each chat response
 * 
 * @param notebookId - The notebook ID to fetch suggestions for
 * @returns Object with questions, loading states, and refresh functions
 */
export function useSuggestedQuestions(notebookId: string | null): UseSuggestedQuestionsResult {
  // Document-based suggestions (initial state)
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [documentCount, setDocumentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Conversation-based suggestions (Option B)
  const [conversationQuestions, setConversationQuestions] = useState<string[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  
  const [error, setError] = useState<Error | null>(null);

  // Fetch document-based suggestions (on mount or refresh)
  const fetchSuggestions = useCallback(async () => {
    if (!notebookId) {
      setQuestions([]);
      setDocumentCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.getSuggestions(notebookId);
      setQuestions(response.questions);
      setDocumentCount(response.document_count);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch suggestions"));
    } finally {
      setIsLoading(false);
    }
  }, [notebookId]);

  // Fetch conversation-based suggestions (Option B - after chat response)
  const refreshFromConversation = useCallback(async (userMsg: string, aiMsg: string) => {
    if (!notebookId || !userMsg || !aiMsg) {
      return;
    }

    setIsLoadingConversation(true);
    setError(null);

    try {
      const newQuestions = await chatApi.getConversationSuggestions(
        notebookId,
        userMsg,
        aiMsg
      );
      
      // Replace document-based with conversation-based suggestions
      setConversationQuestions(newQuestions);
    } catch (err) {
      console.error("Failed to fetch conversation suggestions:", err);
      // Keep existing suggestions on error (graceful degradation)
    } finally {
      setIsLoadingConversation(false);
    }
  }, [notebookId]);

  // Fetch document-based suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    questions,
    conversationQuestions,
    isLoading,
    isLoadingConversation,
    error,
    documentCount,
    refresh: fetchSuggestions,
    refreshFromConversation,
  };
}
