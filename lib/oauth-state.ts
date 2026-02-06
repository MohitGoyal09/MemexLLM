/**
 * OAuth CSRF state token generation and validation.
 * Uses crypto.getRandomValues() for cryptographic randomness.
 */

const OAUTH_STATE_KEY = "oauth_state";
const OAUTH_STATE_EXPIRY_KEY = "oauth_state_expiry";
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function createOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const state = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join(
    ""
  );

  // Store in sessionStorage for validation on callback
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  sessionStorage.setItem(
    OAUTH_STATE_EXPIRY_KEY,
    String(Date.now() + STATE_TTL_MS)
  );

  return state;
}

export function validateOAuthState(state: string): boolean {
  const stored = sessionStorage.getItem(OAUTH_STATE_KEY);
  const expiry = sessionStorage.getItem(OAUTH_STATE_EXPIRY_KEY);

  // Clean up
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_EXPIRY_KEY);

  if (!stored || !expiry) return false;
  if (Date.now() > Number(expiry)) return false;

  return state === stored;
}
