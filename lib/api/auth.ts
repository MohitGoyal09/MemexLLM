import { apiClient, getApiBaseUrl } from "./client";
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
    const response = await fetch(`${getApiBaseUrl()}/api/v1/health`);
    if (!response.ok) {
      throw new Error("Health check failed");
    }
    return response.json();
  },

  /**
   * Simple liveness check
   */
  liveness: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/health/liveness`);
    if (!response.ok) {
      throw new Error("Liveness check failed");
    }
    return response.json();
  },

  /**
   * Readiness check - verifies the service is ready to accept traffic
   */
  readiness: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/health/readiness`);
    if (!response.ok) {
      throw new Error("Readiness check failed");
    }
    return response.json();
  },
};
