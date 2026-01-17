import { apiClient } from "./client";
import type { User, HealthResponse } from "./types";

export const authApi = {
  /**
   * Get current authenticated user profile
   */
  getCurrentUser: () => apiClient<User>("/auth/me"),
};

export const healthApi = {
  /**
   * Check API health status (no auth required)
   */
  check: async (): Promise<HealthResponse> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${API_BASE_URL}/api/v1/health`);
    if (!response.ok) {
      throw new Error("Health check failed");
    }
    return response.json();
  },

  /**
   * Simple liveness check
   */
  liveness: async (): Promise<{ status: string; timestamp: string }> => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${API_BASE_URL}/api/v1/health/liveness`);
    if (!response.ok) {
      throw new Error("Liveness check failed");
    }
    return response.json();
  },
};
