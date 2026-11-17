/**
 * Removes PostgREST filter control characters from free-text search input.
 */
export function sanitiseSearch(value: string): string {
  return value.replace(/[%_,()]/g, ' ').trim();
}
