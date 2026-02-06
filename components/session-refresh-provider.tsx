"use client";

import { useEffect } from "react";
import { startSessionRefresh, stopSessionRefresh } from "@/lib/auth/session-refresh";

/**
 * Client component that starts automatic Supabase session refresh.
 * Mount once in the root layout to keep sessions alive.
 */
export function SessionRefreshProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startSessionRefresh();
    return () => stopSessionRefresh();
  }, []);

  return <>{children}</>;
}
