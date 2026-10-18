/** Tiny className combiner — filters falsy values and joins with spaces. */
export function clsx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
