/**
 * Validates redirect paths to prevent open redirect vulnerabilities.
 *
 * Only allows relative paths starting with "/" that match known safe prefixes.
 * Blocks protocol-relative URLs (//), absolute URLs (http://, https://),
 * and any paths not in the allowlist.
 */

const ALLOWED_PATH_PREFIXES = ["/home", "/notebook", "/settings", "/auth"];

const DEFAULT_REDIRECT = "/home";

export function validateRedirectPath(path: string | null | undefined): string {
  if (!path) return DEFAULT_REDIRECT;

  const trimmed = path.trim();

  // Block protocol-relative URLs and absolute URLs
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.includes("://")
  ) {
    return DEFAULT_REDIRECT;
  }

  // Must start with a single forward slash
  if (!trimmed.startsWith("/")) {
    return DEFAULT_REDIRECT;
  }

  // Check against allowlist
  const isAllowed = ALLOWED_PATH_PREFIXES.some((prefix) =>
    trimmed.startsWith(prefix)
  );

  return isAllowed ? trimmed : DEFAULT_REDIRECT;
}
