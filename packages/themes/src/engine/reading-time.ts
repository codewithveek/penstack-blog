/**
 * packages/themes/src/engine/reading-time.ts
 *
 * Utility that estimates reading time from an HTML string or plain text.
 * Used to populate ThemePostContext.readingTimeMinutes.
 * Average: 200 words/min (PRD uses this as the default).
 */

const WORDS_PER_MINUTE = 200;

/**
 * Strip HTML tags and estimate reading time in minutes.
 * Returns at least 1 minute.
 */
export function estimateReadingTime(html: string): number {
  // Collapse all HTML tags and whitespace
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
