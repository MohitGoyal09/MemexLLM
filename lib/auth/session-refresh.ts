"use client";

import { createClient } from "@/lib/supabase/client";

let refreshInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start automatic session refresh every 50 minutes.
 * Supabase tokens expire at 60 minutes by default.
 */
export function startSessionRefresh(): void {
  if (refreshInterval) return; // Already running

  const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutes

  refreshInterval = setInterval(async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn("Session refresh failed:", error.message);
      }
    } catch {
      // Silently fail — user will be redirected to login on next protected action
    }
  }, REFRESH_INTERVAL_MS);
}

export function stopSessionRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}
