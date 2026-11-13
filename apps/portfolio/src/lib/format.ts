// apps/portfolio/src/lib/format.ts
// Shared formatting helpers for the portfolio client.
// All code/comments in English. User-facing strings may be Spanish.

/**
 * Returns true when the user prefers reduced motion.
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * Formats a date string into a short "MMM yyyy" string (e.g. "Jan 2020").
 */
export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '';
  const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

/**
 * Formats a date range "start – end" or "start – Present".
 */
export function formatDateRange(
  start: string | Date | undefined | null,
  end: string | Date | undefined | null,
  current: boolean,
): string {
  const startStr = formatDate(start);
  if (!startStr) return '';
  if (current) return `${startStr} – Presente`;
  const endStr = formatDate(end);
  return endStr ? `${startStr} – ${endStr}` : `${startStr} – Presente`;
}

/**
 * Truncates text to a max length, appending an ellipsis when cut.
 * Used for the hero bio (max 2 lines x ~75 chars).
 */
export function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}…`;
}

/**
 * Truncates the hero bio to at most 2 lines of ~75 chars (150 chars total),
 * suitable for CSS line-clamp visual truncation as well.
 */
export function truncateBio(bio: string): string {
  return truncate(bio, 150);
}
