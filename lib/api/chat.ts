import { apiClient, getApiBaseUrl, getStreamingHeaders } from "./client";
import type { ChatMessage, ChatResponse, Citation, SuggestionsResponse, ConversationSuggestionsResponse } from "./types";

export const chatApi = {
  /**
   * Get chat history for a notebook
   */
  getHistory: (notebookId: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) });
    return apiClient<ChatMessage[]>(`/chat/${notebookId}/history?${params}`);
  },

  /**
   * Delete all chat messages for a notebook
   */
  deleteHistory: (notebookId: string) =>
    apiClient<void>(`/chat/${notebookId}/history`, { method: "DELETE" }),

  /**
   * Get AI-generated suggested questions based on notebook content
   * (Used for initial suggestions when chat is empty)
   */
  getSuggestions: (notebookId: string) =>
    apiClient<SuggestionsResponse>(`/chat/${notebookId}/suggestions`),

  /**
   * Get dynamic follow-up suggestions based on the last conversation turn
   * (Option B: Post-Response API Call - used after each chat response)
   */
  getConversationSuggestions: async (
    notebookId: string,
    lastUserMessage: string,
    lastAssistantMessage: string
  ): Promise<string[]> => {
    try {
      const response = await apiClient<ConversationSuggestionsResponse>(
        `/chat/${notebookId}/suggestions`,
        {
          method: "POST",
          body: JSON.stringify({
            last_user_message: lastUserMessage,
            last_assistant_message: lastAssistantMessage ,
          }),
        }
      );
      return response.questions || [];
    } catch (error) {
      console.error("Failed to fetch conversation suggestions:", error);
      return []; // Graceful degradation
    }
  },

  /**
   * Send a message and get a non-streaming response
   */
  sendMessage: (notebookId: string, message: string) =>
    apiClient<ChatResponse>(`/chat/${notebookId}/message`, {
      method: "POST",
      body: JSON.stringify({ message, stream: false }),
    }),

  /**
   * Send a message with streaming response (SSE)
   * @param notebookId - The notebook ID
   * @param message - The user's message
   * @param onToken - Callback for each token received
   * @param onCitations - Callback when citations are received
   * @param onComplete - Callback when stream completes
   * @param onError - Callback when an error occurs
   * @param signal - Optional AbortSignal to cancel the stream
   */
  sendMessageStream: async (
    notebookId: string,
    message: string,
    onToken: (token: string) => void,
    onCitations?: (citations: Citation[]) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void,
    signal?: AbortSignal
  ) => {
    try {
      const headers = await getStreamingHeaders();

      const response = await fetch(
        `${getApiBaseUrl()}/api/v1/chat/${notebookId}/message`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ message, stream: true }),
          signal,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Stream failed" }));
        throw new Error(error.detail || "Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            
            // Check if it's a citations event (JSON object with citations key)
            if (data.startsWith("{")) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.citations && onCitations) {
                  onCitations(parsed.citations);
                }
              } catch {
                // Not valid JSON, treat as token
                onToken(data);
              }
            } else if (data === "[DONE]") {
              // Stream complete marker
              break;
            } else {
              // Token is JSON-encoded string, parse to get actual content with newlines
              try {
                const token = JSON.parse(data);
                onToken(token);
              } catch {
                // Fallback: use raw data if not valid JSON
                onToken(data);
              }
            }
          }
        }
      }

      onComplete?.();
    } catch (error) {
      // Don't treat abort as an error - it's expected behavior when cancelled
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      if (onError) {
        onError(error instanceof Error ? error : new Error("Unknown streaming error"));
      } else {
        throw error;
      }
    }
  },
};
