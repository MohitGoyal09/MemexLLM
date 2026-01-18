/**
 * Rate limit state management for API client
 *
 * Tracks rate limit headers from API responses and provides
 * utilities for checking current rate limit status.
 */

export interface RateLimitState {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** Unix timestamp (seconds) when the rate limit resets */
  resetTimestamp: number;
  /** Whether we are currently rate limited (received 429) */
  isRateLimited: boolean;
  /** Seconds until we can retry (from Retry-After header) */
  retryAfterSeconds: number | null;
  /** Timestamp when rate limit state was last updated */
  lastUpdated: number;
}

export interface RateLimitStatus {
  /** Whether requests are currently allowed */
  canMakeRequest: boolean;
  /** Number of requests remaining */
  remaining: number;
  /** Percentage of rate limit used (0-100) */
  usagePercentage: number;
  /** Seconds until rate limit resets */
  secondsUntilReset: number;
  /** Whether we're in a rate limited state */
  isRateLimited: boolean;
  /** If rate limited, seconds until we can retry */
  retryAfterSeconds: number | null;
}

// Rate limit header names
const HEADER_LIMIT = "x-ratelimit-limit";
const HEADER_REMAINING = "x-ratelimit-remaining";
const HEADER_RESET = "x-ratelimit-reset";
const HEADER_RETRY_AFTER = "retry-after";

// Default state when no rate limit info is available
const DEFAULT_STATE: RateLimitState = {
  limit: 100,
  remaining: 100,
  resetTimestamp: 0,
  isRateLimited: false,
  retryAfterSeconds: null,
  lastUpdated: 0,
};

// Singleton state for rate limiting
let rateLimitState: RateLimitState = { ...DEFAULT_STATE };

// Event listeners for rate limit changes
type RateLimitListener = (status: RateLimitStatus) => void;
const listeners: Set<RateLimitListener> = new Set();

/**
 * Parse rate limit headers from a fetch Response
 */
export function parseRateLimitHeaders(response: Response): Partial<RateLimitState> {
  const parsed: Partial<RateLimitState> = {};

  const limitHeader = response.headers.get(HEADER_LIMIT);
  if (limitHeader) {
    const limit = parseInt(limitHeader, 10);
    if (!isNaN(limit)) {
      parsed.limit = limit;
    }
  }

  const remainingHeader = response.headers.get(HEADER_REMAINING);
  if (remainingHeader) {
    const remaining = parseInt(remainingHeader, 10);
    if (!isNaN(remaining)) {
      parsed.remaining = remaining;
    }
  }

  const resetHeader = response.headers.get(HEADER_RESET);
  if (resetHeader) {
    const resetTimestamp = parseInt(resetHeader, 10);
    if (!isNaN(resetTimestamp)) {
      parsed.resetTimestamp = resetTimestamp;
    }
  }

  const retryAfterHeader = response.headers.get(HEADER_RETRY_AFTER);
  if (retryAfterHeader) {
    const retryAfter = parseInt(retryAfterHeader, 10);
    if (!isNaN(retryAfter)) {
      parsed.retryAfterSeconds = retryAfter;
    }
  }

  return parsed;
}

/**
 * Update the rate limit state with new values from API response
 */
export function updateRateLimitState(
  response: Response,
  isRateLimited: boolean = false
): void {
  const parsed = parseRateLimitHeaders(response);

  rateLimitState = {
    limit: parsed.limit ?? rateLimitState.limit,
    remaining: parsed.remaining ?? rateLimitState.remaining,
    resetTimestamp: parsed.resetTimestamp ?? rateLimitState.resetTimestamp,
    isRateLimited,
    retryAfterSeconds: isRateLimited ? (parsed.retryAfterSeconds ?? null) : null,
    lastUpdated: Date.now(),
  };

  // Notify listeners of state change
  notifyListeners();
}

/**
 * Clear the rate limited state (called after successful retry)
 */
export function clearRateLimitedState(): void {
  rateLimitState.isRateLimited = false;
  rateLimitState.retryAfterSeconds = null;
  notifyListeners();
}

/**
 * Get the current rate limit status
 */
export function getRateLimitStatus(): RateLimitStatus {
  const now = Math.floor(Date.now() / 1000);
  const secondsUntilReset = Math.max(0, rateLimitState.resetTimestamp - now);

  // Check if rate limit window has reset
  const hasReset = rateLimitState.resetTimestamp > 0 && now >= rateLimitState.resetTimestamp;

  // If window has reset, we're no longer rate limited
  const effectivelyRateLimited = rateLimitState.isRateLimited && !hasReset;

  // Calculate effective remaining (reset to limit if window passed)
  const effectiveRemaining = hasReset ? rateLimitState.limit : rateLimitState.remaining;

  // Calculate usage percentage
  const usagePercentage = rateLimitState.limit > 0
    ? Math.round(((rateLimitState.limit - effectiveRemaining) / rateLimitState.limit) * 100)
    : 0;

  // Calculate effective retry after
  let effectiveRetryAfter = rateLimitState.retryAfterSeconds;
  if (effectiveRetryAfter !== null && rateLimitState.lastUpdated > 0) {
    const elapsedSeconds = Math.floor((Date.now() - rateLimitState.lastUpdated) / 1000);
    effectiveRetryAfter = Math.max(0, effectiveRetryAfter - elapsedSeconds);
    if (effectiveRetryAfter === 0) {
      effectiveRetryAfter = null;
    }
  }

  return {
    canMakeRequest: !effectivelyRateLimited && effectiveRemaining > 0,
    remaining: effectiveRemaining,
    usagePercentage,
    secondsUntilReset,
    isRateLimited: effectivelyRateLimited,
    retryAfterSeconds: effectivelyRateLimited ? effectiveRetryAfter : null,
  };
}

/**
 * Calculate delay for exponential backoff
 * @param attempt Current retry attempt (0-indexed)
 * @param baseDelayMs Base delay in milliseconds (default 1000ms)
 * @param maxDelayMs Maximum delay cap (default 30000ms)
 * @param retryAfterSeconds Optional Retry-After header value to respect
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000,
  retryAfterSeconds?: number | null
): number {
  // If we have a Retry-After value, respect it (with some buffer)
  if (retryAfterSeconds !== null && retryAfterSeconds !== undefined && retryAfterSeconds > 0) {
    // Convert to ms and add small buffer
    return Math.min(retryAfterSeconds * 1000 + 100, maxDelayMs);
  }

  // Exponential backoff: baseDelay * 2^attempt with jitter
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  const delayWithJitter = exponentialDelay + jitter;

  return Math.min(delayWithJitter, maxDelayMs);
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Subscribe to rate limit state changes
 * @returns Unsubscribe function
 */
export function subscribeToRateLimitChanges(listener: RateLimitListener): () => void {
  listeners.add(listener);
  // Immediately notify with current state
  listener(getRateLimitStatus());

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Notify all listeners of state change
 */
function notifyListeners(): void {
  const status = getRateLimitStatus();
  listeners.forEach(listener => {
    try {
      listener(status);
    } catch (error) {
      console.error("Error in rate limit listener:", error);
    }
  });
}

/**
 * Reset rate limit state to defaults (mainly for testing)
 */
export function resetRateLimitState(): void {
  rateLimitState = { ...DEFAULT_STATE };
  notifyListeners();
}

/**
 * Get raw rate limit state (mainly for debugging)
 */
export function getRawRateLimitState(): Readonly<RateLimitState> {
  return { ...rateLimitState };
}
