/**
 * Mark user-visible copy for static analysis and future i18n migration.
 * User-facing strings should be in French; wrap literals with `t()`.
 */
export function t<T extends string>(s: T): T {
  return s;
}
