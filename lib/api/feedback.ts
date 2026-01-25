/**
 * Feedback API client for submitting and retrieving content feedback.
 */
import { apiClient } from "./client";
import type {
  FeedbackCreateRequest,
  FeedbackResponse,
  FeedbackStatusResponse,
  FeedbackContentType,
} from "./types";

/**
 * Submit feedback (thumbs up/down) for content.
 * If feedback already exists, it will be updated.
 */
export async function submitFeedback(
  request: FeedbackCreateRequest
): Promise<FeedbackResponse> {
  return apiClient<FeedbackResponse>("/feedback", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Get existing feedback for specific content.
 */
export async function getFeedback(
  contentType: FeedbackContentType,
  contentId: string
): Promise<FeedbackStatusResponse> {
  return apiClient<FeedbackStatusResponse>(
    `/feedback/${contentType}/${contentId}`
  );
}

/**
 * Delete feedback for specific content.
 */
export async function deleteFeedback(
  contentType: FeedbackContentType,
  contentId: string
): Promise<void> {
  return apiClient<void>(`/feedback/${contentType}/${contentId}`, {
    method: "DELETE",
  });
}
