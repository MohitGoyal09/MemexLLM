import { createClient as createSupabaseClient } from "@/lib/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

/**
 * Handles 401/403 responses by redirecting to login page (browser-side only)
 */
function handleAuthError(status: number): void {
  if ((status === 401 || status === 403) && typeof window !== "undefined") {
    window.location.href = "/login";
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

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const headers = await getAuthHeaders();
  const { controller, timeoutId } = createTimeoutController(timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: controller.signal,
    });

    if (!response.ok) {
      handleAuthError(response.status);
      const error = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new ApiError(response.status, error.detail || "Request failed");
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// For multipart/form-data uploads (don't set Content-Type header)
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new ApiError(401, "Not authenticated");
  }

  const { controller, timeoutId } = createTimeoutController(timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      handleAuthError(response.status);
      const error = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new ApiError(response.status, error.detail);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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
