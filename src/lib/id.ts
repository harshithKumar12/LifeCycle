/** Generate a reasonably-unique id, preferring the platform UUID when present. */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for older environments / test runners without crypto.randomUUID.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
