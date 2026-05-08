const DEFAULT_INTERNAL_PATH = "/dashboard";

/**
 * Returns a path safe for client navigation (`router.push`) from untrusted input.
 * Allows only same-origin relative paths: single leading `/`, not `//`, no backslashes or control chars.
 */
export function getSafeInternalPath(
  value: string | null | undefined,
  fallback: string = DEFAULT_INTERNAL_PATH,
): string {
  if (value == null) {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return fallback;
  }
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  if (trimmed.includes("\\") || /[\0\r\n\u2028\u2029]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}
