import { describe, it, expect } from 'vitest'
import {
  currentStreak,
  longestStreak,
  countCompletedIn,
  completionRate,
  tasksCompletedOn,
  relevantTasksForDay,
  overdueTasks,
  computeDailyStats,
  formatMinutes,
  isHabitDoneOn,
} from './stats'
import type { Task, Habit, FocusSession } from '@/types'

let seq = 0
const task = (o: Partial<Task> = {}): Task => ({
  id: `t${seq++}`,
  title: 'Task',
  priority: 'medium',
  dueDate: null,
  completed: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  completedAt: null,
  ...o,
})
const habit = (completedDates: string[], o: Partial<Habit> = {}): Habit => ({
  id: `h${seq++}`,
  name: 'Habit',
  icon: 'code',
  color: '#6366f1',
  createdAt: '2026-08-01T00:00:00.000Z',
  completedDates,
  ...o,
})
const session = (durationMin: number, completedAt: string): FocusSession => ({
  id: `f${seq++}`,
  durationMin,
  completedAt,
})

const TODAY = '2026-09-07'

describe('currentStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-09-05', '2026-09-06', '2026-09-07'], TODAY)).toBe(3)
  })

  it('stays alive from yesterday when today is not done yet', () => {
    expect(currentStreak(['2026-09-05', '2026-09-06'], TODAY)).toBe(2)
  })

  it('is zero when neither today nor yesterday is done', () => {
    expect(currentStreak(['2026-09-01', '2026-09-02'], TODAY)).toBe(0)
  })

  it('breaks on a gap', () => {
    expect(currentStreak(['2026-09-04', '2026-09-06', '2026-09-07'], TODAY)).toBe(2)
  })

  it('is zero for an empty history', () => {
    expect(currentStreak([], TODAY)).toBe(0)
  })
})

describe('longestStreak', () => {
  it('finds the longest consecutive run', () => {
    expect(longestStreak(['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-06'])).toBe(3)
  })

  it('handles unsorted input and duplicates', () => {
    expect(longestStreak(['2026-09-03', '2026-09-01', '2026-09-02', '2026-09-02'])).toBe(3)
  })

  it('is 1 for a single day and 0 for none', () => {
    expect(longestStreak(['2026-09-01'])).toBe(1)
    expect(longestStreak([])).toBe(0)
  })
})

describe('countCompletedIn / completionRate', () => {
  const range = ['2026-09-01', '2026-09-02', '2026-09-03']
  it('counts intersection with the range', () => {
    expect(countCompletedIn(['2026-09-01', '2026-09-03', '2026-09-09'], range)).toBe(2)
  })
  it('computes a rate, guarding an empty range', () => {
    expect(completionRate(['2026-09-01', '2026-09-03'], range)).toBeCloseTo(2 / 3)
    expect(completionRate(['2026-09-01'], [])).toBe(0)
  })
})

describe('tasksCompletedOn', () => {
  it('returns only tasks completed on the given day', () => {
    const tasks = [
      task({ completed: true, completedAt: '2026-09-07T12:00:00.000Z' }),
      task({ completed: true, completedAt: '2026-09-06T12:00:00.000Z' }),
      task({ completed: false, completedAt: null }),
    ]
    expect(tasksCompletedOn(tasks, TODAY)).toHaveLength(1)
  })
})

describe('relevantTasksForDay', () => {
  it('includes due-today (done or not) and overdue-incomplete, excludes the rest', () => {
    const tasks = [
      task({ dueDate: TODAY, completed: false }), // in
      task({ dueDate: TODAY, completed: true }), // in
      task({ dueDate: '2026-09-05', completed: false }), // overdue incomplete → in
      task({ dueDate: '2026-09-05', completed: true }), // overdue but done → out
      task({ dueDate: '2026-09-10', completed: false }), // future → out
      task({ dueDate: null, completed: false }), // no due → out
    ]
    expect(relevantTasksForDay(tasks, TODAY)).toHaveLength(3)
  })
})

describe('overdueTasks', () => {
  it('flags past-due incomplete tasks only', () => {
    const tasks = [
      task({ dueDate: '2020-01-01', completed: false }), // overdue
      task({ dueDate: '2020-01-01', completed: true }), // done
      task({ dueDate: '2999-01-01', completed: false }), // future
      task({ dueDate: null, completed: false }),
    ]
    expect(overdueTasks(tasks)).toHaveLength(1)
  })
})

describe('computeDailyStats', () => {
  it('aggregates tasks, habits and focus into a completion percentage', () => {
    const tasks = [
      task({ dueDate: TODAY, completed: true }),
      task({ dueDate: TODAY, completed: false }),
      task({ dueDate: '2026-09-05', completed: false }), // overdue incomplete
    ]
    const habits = [habit(['2026-09-07']), habit([])]
    const sessions = [
      session(25, '2026-09-07T09:00:00.000Z'),
      session(25, '2026-09-07T10:00:00.000Z'),
      session(50, '2026-09-06T10:00:00.000Z'), // other day
    ]
    const s = computeDailyStats(tasks, habits, sessions, TODAY)
    expect(s.tasksTotal).toBe(3)
    expect(s.tasksDone).toBe(1)
    expect(s.habitsTotal).toBe(2)
    expect(s.habitsDone).toBe(1)
    expect(s.focusSessions).toBe(2)
    expect(s.focusMinutes).toBe(50)
    expect(s.scheduledTotal).toBe(5)
    expect(s.scheduledDone).toBe(2)
    expect(s.completionPct).toBe(40)
  })

  it('reports zero (not NaN) when nothing is scheduled', () => {
    const s = computeDailyStats([], [], [], TODAY)
    expect(s.completionPct).toBe(0)
    expect(s.scheduledTotal).toBe(0)
  })
})

describe('formatMinutes', () => {
  it('formats minutes and hours', () => {
    expect(formatMinutes(0)).toBe('0m')
    expect(formatMinutes(45)).toBe('45m')
    expect(formatMinutes(60)).toBe('1h')
    expect(formatMinutes(90)).toBe('1h 30m')
    expect(formatMinutes(125)).toBe('2h 5m')
  })
})

describe('isHabitDoneOn', () => {
  it('reflects membership in completedDates', () => {
    const h = habit(['2026-09-07'])
    expect(isHabitDoneOn(h, '2026-09-07')).toBe(true)
    expect(isHabitDoneOn(h, '2026-09-06')).toBe(false)
  })
})
