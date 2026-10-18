import type { Task, Habit, FocusSession } from '@/types'
import { dayKey, fromDayKey, isOverdue, todayKey } from './date'
import { differenceInCalendarDays, subDays } from 'date-fns'

// ---------------------------------------------------------------------------
// Pure calculation helpers. Kept free of React/store so they are trivially
// unit-testable and reusable across features.
// ---------------------------------------------------------------------------

export function isHabitDoneOn(habit: Habit, key: string): boolean {
  return habit.completedDates.includes(key)
}

/**
 * Current streak: number of consecutive completed days ending today (or
 * ending yesterday, so a streak is not considered broken until a full day
 * has elapsed without completion). Returns 0 when neither today nor
 * yesterday is completed.
 */
export function currentStreak(dates: string[], today: string = todayKey()): number {
  const set = new Set(dates)
  const todayDate = fromDayKey(today)

  let cursor = todayDate
  if (!set.has(dayKey(cursor))) {
    // Today not done yet — the streak may still be alive from yesterday.
    cursor = subDays(cursor, 1)
    if (!set.has(dayKey(cursor))) return 0
  }

  let streak = 0
  while (set.has(dayKey(cursor))) {
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

/** Longest run of consecutive completed days in the entire history. */
export function longestStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...new Set(dates)].map(fromDayKey).sort((a, b) => a.getTime() - b.getTime())

  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const gap = differenceInCalendarDays(sorted[i], sorted[i - 1])
    if (gap === 1) {
      run++
      longest = Math.max(longest, run)
    } else if (gap > 1) {
      run = 1
    }
  }
  return longest
}

/** How many of the given day keys the habit completed. */
export function countCompletedIn(dates: string[], range: string[]): number {
  const set = new Set(dates)
  return range.reduce((n, k) => (set.has(k) ? n + 1 : n), 0)
}

/** Completion rate (0..1) across a set of days for one habit. */
export function completionRate(dates: string[], range: string[]): number {
  if (range.length === 0) return 0
  return countCompletedIn(dates, range) / range.length
}

/** Tasks completed on a specific day (by completedAt). */
export function tasksCompletedOn(tasks: Task[], key: string): Task[] {
  return tasks.filter((t) => t.completed && t.completedAt && dayKey(fromDayKey(t.completedAt.slice(0, 10))) === key)
}

/**
 * Tasks that are relevant to a given day: due that day (done or not) or
 * overdue and still incomplete. This is the denominator for daily progress.
 */
export function relevantTasksForDay(tasks: Task[], key: string): Task[] {
  return tasks.filter((t) => {
    if (t.dueDate === key) return true
    if (t.dueDate && !t.completed) {
      return differenceInCalendarDays(fromDayKey(t.dueDate), fromDayKey(key)) < 0
    }
    return false
  })
}

export function overdueTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => isOverdue(t.dueDate, t.completed))
}

export interface DailyStats {
  tasksDone: number
  tasksTotal: number
  habitsDone: number
  habitsTotal: number
  focusSessions: number
  focusMinutes: number
  /** tasksTotal + habitsTotal */
  scheduledTotal: number
  /** tasksDone + habitsDone */
  scheduledDone: number
  /** 0..100; 0 when nothing is scheduled. */
  completionPct: number
}

export function computeDailyStats(
  tasks: Task[],
  habits: Habit[],
  sessions: FocusSession[],
  today: string = todayKey(),
): DailyStats {
  const relevant = relevantTasksForDay(tasks, today)
  const tasksDone = relevant.filter((t) => t.completed).length
  const tasksTotal = relevant.length

  const habitsDone = habits.filter((h) => isHabitDoneOn(h, today)).length
  const habitsTotal = habits.length

  const todaySessions = sessions.filter((s) => dayKey(fromDayKey(s.completedAt.slice(0, 10))) === today)
  const focusSessions = todaySessions.length
  const focusMinutes = todaySessions.reduce((sum, s) => sum + s.durationMin, 0)

  const scheduledTotal = tasksTotal + habitsTotal
  const scheduledDone = tasksDone + habitsDone
  const completionPct = scheduledTotal === 0 ? 0 : Math.round((scheduledDone / scheduledTotal) * 100)

  return {
    tasksDone,
    tasksTotal,
    habitsDone,
    habitsTotal,
    focusSessions,
    focusMinutes,
    scheduledTotal,
    scheduledDone,
    completionPct,
  }
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
