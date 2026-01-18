/**
 * Auth Event Logger for NotebookLLM
 *
 * Comprehensive logging system for authentication events including:
 * - Login attempts (success/failure)
 * - Logout events
 * - OAuth flow events
 * - Session refresh events
 * - Token expiration events
 * - Unauthorized access attempts
 */

// Auth event types
export type AuthEventType =
  | "LOGIN_ATTEMPT"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGOUT"
  | "LOGOUT_SUCCESS"
  | "LOGOUT_FAILURE"
  | "OAUTH_STARTED"
  | "OAUTH_CALLBACK_RECEIVED"
  | "OAUTH_COMPLETED"
  | "OAUTH_FAILED"
  | "SESSION_REFRESH"
  | "SESSION_REFRESH_SUCCESS"
  | "SESSION_REFRESH_FAILURE"
  | "TOKEN_EXPIRED"
  | "UNAUTHORIZED_ACCESS"
  | "FORBIDDEN_ACCESS";

// OAuth provider types
export type OAuthProvider = "google" | "github" | "facebook" | "twitter" | "apple";

// Metadata interface for auth events
export interface AuthEventMetadata {
  userId?: string;
  email?: string;
  provider?: OAuthProvider | string;
  errorMessage?: string;
  errorCode?: string;
  endpoint?: string;
  statusCode?: number;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  redirectUrl?: string;
  [key: string]: unknown;
}

// Complete auth event structure
export interface AuthEvent {
  timestamp: string;
  eventType: AuthEventType;
  userId?: string;
  metadata: AuthEventMetadata;
  environment: "development" | "production" | "test";
}

// Log level configuration
type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Event type to log level mapping
const EVENT_LOG_LEVELS: Record<AuthEventType, LogLevel> = {
  LOGIN_ATTEMPT: "info",
  LOGIN_SUCCESS: "info",
  LOGIN_FAILURE: "warn",
  LOGOUT: "info",
  LOGOUT_SUCCESS: "info",
  LOGOUT_FAILURE: "warn",
  OAUTH_STARTED: "info",
  OAUTH_CALLBACK_RECEIVED: "info",
  OAUTH_COMPLETED: "info",
  OAUTH_FAILED: "error",
  SESSION_REFRESH: "debug",
  SESSION_REFRESH_SUCCESS: "debug",
  SESSION_REFRESH_FAILURE: "warn",
  TOKEN_EXPIRED: "warn",
  UNAUTHORIZED_ACCESS: "warn",
  FORBIDDEN_ACCESS: "warn",
};

// Configuration
interface AuthLoggerConfig {
  minLogLevel: LogLevel;
  enableConsoleLogging: boolean;
  enableExternalLogging: boolean;
  externalLogEndpoint?: string;
}

const defaultConfig: AuthLoggerConfig = {
  minLogLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
  enableConsoleLogging: true,
  enableExternalLogging: false,
  externalLogEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
};

class AuthLogger {
  private config: AuthLoggerConfig;

  constructor(config: Partial<AuthLoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Get the current environment
   */
  private getEnvironment(): "development" | "production" | "test" {
    if (process.env.NODE_ENV === "production") return "production";
    if (process.env.NODE_ENV === "test") return "test";
    return "development";
  }

  /**
   * Check if the event should be logged based on log level
   */
  private shouldLog(eventType: AuthEventType): boolean {
    const eventLevel = EVENT_LOG_LEVELS[eventType];
    return LOG_LEVEL_PRIORITY[eventLevel] >= LOG_LEVEL_PRIORITY[this.config.minLogLevel];
  }

  /**
   * Format the event for console logging
   */
  private formatForConsole(event: AuthEvent): string {
    const level = EVENT_LOG_LEVELS[event.eventType];
    const prefix = `[AUTH:${level.toUpperCase()}]`;
    const userInfo = event.userId ? `user:${event.userId}` : "user:anonymous";
    return `${prefix} ${event.timestamp} | ${event.eventType} | ${userInfo}`;
  }

  /**
   * Log to console in development
   */
  private logToConsole(event: AuthEvent): void {
    if (!this.config.enableConsoleLogging) return;

    const level = EVENT_LOG_LEVELS[event.eventType];
    const formattedMessage = this.formatForConsole(event);
    const metadata = Object.keys(event.metadata).length > 0 ? event.metadata : undefined;

    switch (level) {
      case "debug":
        console.debug(formattedMessage, metadata ?? "");
        break;
      case "info":
        console.info(formattedMessage, metadata ?? "");
        break;
      case "warn":
        console.warn(formattedMessage, metadata ?? "");
        break;
      case "error":
        console.error(formattedMessage, metadata ?? "");
        break;
    }
  }

  /**
   * Send logs to external logging service (production)
   * TODO: Implement actual external logging service integration
   */
  private async sendToExternalService(event: AuthEvent): Promise<void> {
    if (!this.config.enableExternalLogging || !this.config.externalLogEndpoint) {
      return;
    }

    // TODO: Implement external logging service integration
    // Example implementation for future:
    //
    // try {
    //   await fetch(this.config.externalLogEndpoint, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-API-Key": process.env.LOGGING_API_KEY ?? "",
    //     },
    //     body: JSON.stringify({
    //       service: "notebookllm-frontend",
    //       ...event,
    //     }),
    //   });
    // } catch (error) {
    //   // Fail silently - don't let logging errors affect the app
    //   console.error("[AUTH_LOGGER] Failed to send to external service:", error);
    // }

    // For now, just log that we would send to external service
    if (this.getEnvironment() === "development") {
      console.debug("[AUTH_LOGGER] Would send to external service:", event);
    }
  }

  /**
   * Main logging method
   */
  public log(eventType: AuthEventType, metadata: AuthEventMetadata = {}): void {
    if (!this.shouldLog(eventType)) return;

    const event: AuthEvent = {
      timestamp: new Date().toISOString(),
      eventType,
      userId: metadata.userId,
      metadata: this.sanitizeMetadata(metadata),
      environment: this.getEnvironment(),
    };

    // Console logging (development)
    this.logToConsole(event);

    // External service logging (production)
    if (this.getEnvironment() === "production") {
      this.sendToExternalService(event).catch(() => {
        // Silently fail - logging should not affect app functionality
      });
    }
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  private sanitizeMetadata(metadata: AuthEventMetadata): AuthEventMetadata {
    const sanitized = { ...metadata };

    // Remove or mask sensitive fields
    if (sanitized.email) {
      sanitized.email = this.maskEmail(sanitized.email);
    }

    // Remove any password fields that might accidentally be included
    delete (sanitized as Record<string, unknown>)["password"];
    delete (sanitized as Record<string, unknown>)["token"];
    delete (sanitized as Record<string, unknown>)["accessToken"];
    delete (sanitized as Record<string, unknown>)["refreshToken"];

    return sanitized;
  }

  /**
   * Mask email for privacy
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!local || !domain) return "***@***";
    const maskedLocal = local.length > 2
      ? `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}`
      : "**";
    return `${maskedLocal}@${domain}`;
  }

  // Convenience methods for common events

  /**
   * Log a login attempt
   */
  public logLoginAttempt(email?: string): void {
    this.log("LOGIN_ATTEMPT", { email });
  }

  /**
   * Log a successful login
   */
  public logLoginSuccess(userId: string, email?: string): void {
    this.log("LOGIN_SUCCESS", { userId, email });
  }

  /**
   * Log a failed login
   */
  public logLoginFailure(email?: string, errorMessage?: string): void {
    this.log("LOGIN_FAILURE", { email, errorMessage });
  }

  /**
   * Log a logout event
   */
  public logLogout(userId?: string): void {
    this.log("LOGOUT", { userId });
  }

  /**
   * Log a successful logout
   */
  public logLogoutSuccess(userId?: string): void {
    this.log("LOGOUT_SUCCESS", { userId });
  }

  /**
   * Log a failed logout
   */
  public logLogoutFailure(userId?: string, errorMessage?: string): void {
    this.log("LOGOUT_FAILURE", { userId, errorMessage });
  }

  /**
   * Log OAuth flow started
   */
  public logOAuthStarted(provider: OAuthProvider | string, redirectUrl?: string): void {
    this.log("OAUTH_STARTED", { provider, redirectUrl });
  }

  /**
   * Log OAuth callback received
   */
  public logOAuthCallbackReceived(provider?: OAuthProvider | string): void {
    this.log("OAUTH_CALLBACK_RECEIVED", { provider });
  }

  /**
   * Log OAuth completed successfully
   */
  public logOAuthCompleted(userId: string, provider?: OAuthProvider | string): void {
    this.log("OAUTH_COMPLETED", { userId, provider });
  }

  /**
   * Log OAuth failed
   */
  public logOAuthFailed(provider?: OAuthProvider | string, errorMessage?: string): void {
    this.log("OAUTH_FAILED", { provider, errorMessage });
  }

  /**
   * Log session refresh
   */
  public logSessionRefresh(userId?: string): void {
    this.log("SESSION_REFRESH", { userId });
  }

  /**
   * Log successful session refresh
   */
  public logSessionRefreshSuccess(userId?: string): void {
    this.log("SESSION_REFRESH_SUCCESS", { userId });
  }

  /**
   * Log failed session refresh
   */
  public logSessionRefreshFailure(userId?: string, errorMessage?: string): void {
    this.log("SESSION_REFRESH_FAILURE", { userId, errorMessage });
  }

  /**
   * Log token expiration
   */
  public logTokenExpired(userId?: string): void {
    this.log("TOKEN_EXPIRED", { userId });
  }

  /**
   * Log unauthorized access (401)
   */
  public logUnauthorizedAccess(endpoint: string, statusCode: number = 401): void {
    this.log("UNAUTHORIZED_ACCESS", { endpoint, statusCode });
  }

  /**
   * Log forbidden access (403)
   */
  public logForbiddenAccess(endpoint: string, userId?: string): void {
    this.log("FORBIDDEN_ACCESS", { endpoint, statusCode: 403, userId });
  }
}

// Export a singleton instance
export const authLogger = new AuthLogger();

// Export the class for custom instances
export { AuthLogger };
