import {
  format,
  parseISO,
  isToday as dfIsToday,
  differenceInCalendarDays,
  startOfWeek,
  addDays,
  subDays,
} from 'date-fns'

/** Canonical day key used throughout the app: local yyyy-MM-dd. */
export function dayKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

/** Parse a yyyy-MM-dd key into a Date at local midnight. */
export function fromDayKey(key: string): Date {
  // parseISO on a date-only string yields local midnight, which is what we want.
  return parseISO(key)
}

export function todayKey(): string {
  return dayKey(new Date())
}

/** Friendly long date, e.g. "Monday, September 7, 2026". */
export function formatLongDate(date: Date = new Date()): string {
  return format(date, 'EEEE, MMMM d, yyyy')
}

/** Short date for compact UI, e.g. "Sep 7". */
export function formatShortDate(key: string): string {
  return format(fromDayKey(key), 'MMM d')
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a')
}

export function isToday(key: string): boolean {
  try {
    return dfIsToday(fromDayKey(key))
  } catch {
    return false
  }
}

/**
 * A task is overdue when it has a due date strictly before today and is not
 * yet completed.
 */
export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false
  return differenceInCalendarDays(fromDayKey(dueDate), new Date()) < 0
}

/** Human relative description for a due date ("Today", "Tomorrow", "3d overdue"). */
export function dueLabel(dueDate: string | null): string | null {
  if (!dueDate) return null
  const diff = differenceInCalendarDays(fromDayKey(dueDate), new Date())
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff <= 7) return `In ${diff}d`
  return formatShortDate(dueDate)
}

/** Array of the last `n` day keys, oldest first, ending today. */
export function lastNDays(n: number, end: Date = new Date()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    out.push(dayKey(subDays(end, i)))
  }
  return out
}

/** The 7 day keys of the current week (Sunday→Saturday), oldest first. */
export function currentWeekDays(base: Date = new Date()): string[] {
  const start = startOfWeek(base, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => dayKey(addDays(start, i)))
}

/** Weekday initial for charts, e.g. "M". */
export function weekdayInitial(key: string): string {
  return format(fromDayKey(key), 'EEEEE')
}

/** Weekday short name, e.g. "Mon". */
export function weekdayShort(key: string): string {
  return format(fromDayKey(key), 'EEE')
}
