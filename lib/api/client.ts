import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { authLogger } from "@/lib/auth-logger";
import {
  updateRateLimitState,
  clearRateLimitedState,
  getRateLimitStatus,
  calculateBackoffDelay,
  sleep,
  type RateLimitStatus,
} from "./rate-limit";

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
};

const API_BASE_URL = getBaseUrl();
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 3; // Maximum retry attempts for rate limited requests

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public rateLimitStatus?: RateLimitStatus
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export class RateLimitError extends ApiError {
  constructor(
    public retryAfterSeconds: number | null,
    public rateLimitStatus: RateLimitStatus,
    detail: string = "Too many requests. Please try again later."
  ) {
    super(429, detail, rateLimitStatus);
    this.name = "RateLimitError";
  }
}

/**
 * Handles 401/403 responses by logging the event and redirecting to login page (browser-side only)
 * Note: 403 for /tasks/ endpoints is NOT redirected as it often indicates a race condition
 * (task_progress record not yet created), not an actual auth failure.
 */
function handleAuthError(status: number, endpoint: string): void {
  if (status === 401 && typeof window !== "undefined") {
    authLogger.logUnauthorizedAccess(endpoint, status);
    window.location.href = "/auth/login";
  } else if (status === 403 && typeof window !== "undefined") {
    // Don't redirect for task endpoints - 403 often means race condition, not auth failure
    if (endpoint.includes("/tasks/")) {
      authLogger.logForbiddenAccess(endpoint);
      // Don't redirect, just let the error propagate and be handled by caller
      return;
    }
    authLogger.logForbiddenAccess(endpoint);
    window.location.href = "/auth/login";
  }
}


/**
 * Creates an AbortController with a timeout
 */
function createTimeoutController(timeoutMs: number = DEFAULT_TIMEOUT_MS): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeoutId };
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new ApiError(401, "Not authenticated");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Process response and update rate limit state
 */
function processRateLimitHeaders(response: Response, isRateLimited: boolean = false): void {
  updateRateLimitState(response, isRateLimited);
}

/**
 * Handle rate limit error and determine if we should retry
 */
function handleRateLimitResponse(response: Response): RateLimitError {
  processRateLimitHeaders(response, true);
  const status = getRateLimitStatus();

  return new RateLimitError(
    status.retryAfterSeconds,
    status,
    `Rate limit exceeded. ${status.retryAfterSeconds ? `Retry after ${status.retryAfterSeconds} seconds.` : "Please try again later."}`
  );
}

interface ApiClientOptions extends RequestInit {
  /** Maximum number of retries for rate limited requests (default: 3) */
  maxRetries?: number;
  /** Whether to automatically retry on rate limit (default: true) */
  retryOnRateLimit?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    retryOnRateLimit = true,
    ...fetchOptions
  } = options;

  const headers = await getAuthHeaders();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { controller, timeoutId } = createTimeoutController(timeoutMs);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
        ...fetchOptions,
        headers: { ...headers, ...fetchOptions.headers },
        signal: controller.signal,
      });

      // Always process rate limit headers from response
      processRateLimitHeaders(response, response.status === 429);

      if (response.status === 429) {
        const rateLimitError = handleRateLimitResponse(response);

        // If we shouldn't retry or we've exhausted retries, throw the error
        if (!retryOnRateLimit || attempt === maxRetries) {
          throw rateLimitError;
        }

        // Calculate delay and wait before retrying
        const delayMs = calculateBackoffDelay(
          attempt,
          1000,
          30000,
          rateLimitError.retryAfterSeconds
        );

        console.warn(
          `Rate limited (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${Math.round(delayMs / 1000)}s...`
        );

        lastError = rateLimitError;
        await sleep(delayMs);
        continue;
      }

      // Clear rate limited state on successful response
      if (lastError instanceof RateLimitError) {
        clearRateLimitedState();
      }

      if (!response.ok) {
        handleAuthError(response.status, endpoint);
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new ApiError(response.status, error.detail || "Request failed");
      }

      if (response.status === 204) return undefined as T;
      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(408, "Request timeout");
      }
      // Re-throw rate limit errors if we've exhausted retries
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // This should not be reached, but just in case
  throw lastError || new ApiError(500, "Unexpected error in API client");
}

interface ApiUploadOptions {
  /** Maximum number of retries for rate limited requests (default: 3) */
  maxRetries?: number;
  /** Whether to automatically retry on rate limit (default: true) */
  retryOnRateLimit?: boolean;
}

// For multipart/form-data uploads (don't set Content-Type header)
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  options: ApiUploadOptions = {}
): Promise<T> {
  const { maxRetries = DEFAULT_MAX_RETRIES, retryOnRateLimit = true } = options;

  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new ApiError(401, "Not authenticated");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { controller, timeoutId } = createTimeoutController(timeoutMs);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
        signal: controller.signal,
      });

      // Always process rate limit headers from response
      processRateLimitHeaders(response, response.status === 429);

      if (response.status === 429) {
        const rateLimitError = handleRateLimitResponse(response);

        // If we shouldn't retry or we've exhausted retries, throw the error
        if (!retryOnRateLimit || attempt === maxRetries) {
          throw rateLimitError;
        }

        // Calculate delay and wait before retrying
        const delayMs = calculateBackoffDelay(
          attempt,
          1000,
          30000,
          rateLimitError.retryAfterSeconds
        );

        console.warn(
          `Rate limited (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${Math.round(delayMs / 1000)}s...`
        );

        lastError = rateLimitError;
        await sleep(delayMs);
        continue;
      }

      // Clear rate limited state on successful response
      if (lastError instanceof RateLimitError) {
        clearRateLimitedState();
      }

      if (!response.ok) {
        handleAuthError(response.status, endpoint);
        const error = await response.json().catch(() => ({ detail: "Upload failed" }));
        throw new ApiError(response.status, error.detail);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(408, "Request timeout");
      }
      // Re-throw rate limit errors if we've exhausted retries
      if (error instanceof RateLimitError) {
        throw error;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // This should not be reached, but just in case
  throw lastError || new ApiError(500, "Unexpected error in API upload");
}

// For SSE streaming responses
export async function getStreamingHeaders(): Promise<HeadersInit> {
  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new ApiError(401, "Not authenticated");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

// Re-export rate limit utilities for convenience
export {
  getRateLimitStatus,
  subscribeToRateLimitChanges,
  resetRateLimitState,
  getRawRateLimitState,
  type RateLimitStatus,
  type RateLimitState,
} from "./rate-limit";

/**
 * Check if we can currently make API requests based on rate limit status
 * This is a convenience function that wraps getRateLimitStatus().canMakeRequest
 */
export function canMakeApiRequest(): boolean {
  return getRateLimitStatus().canMakeRequest;
}

/**
 * Get a human-readable message about the current rate limit status
 */
export function getRateLimitMessage(): string {
  const status = getRateLimitStatus();

  if (status.isRateLimited) {
    if (status.retryAfterSeconds !== null) {
      return `Rate limited. Please wait ${status.retryAfterSeconds} seconds before retrying.`;
    }
    return "Rate limited. Please wait before making more requests.";
  }

  if (status.remaining <= 5) {
    return `Warning: Only ${status.remaining} API requests remaining until rate limit resets.`;
  }

  return `${status.remaining} requests remaining (${status.usagePercentage}% used).`;
}
