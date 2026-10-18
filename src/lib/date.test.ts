import { describe, it, expect } from 'vitest'
import { addDays, subDays, format } from 'date-fns'
import { dayKey, fromDayKey, todayKey, isOverdue, dueLabel, lastNDays } from './date'

describe('dayKey / fromDayKey', () => {
  it('round-trips a day key through local midnight', () => {
    expect(dayKey(fromDayKey('2026-09-07'))).toBe('2026-09-07')
  })
  it('todayKey matches dayKey of now', () => {
    expect(todayKey()).toBe(dayKey(new Date()))
  })
})

describe('isOverdue', () => {
  it('is true for a past due date that is not completed', () => {
    expect(isOverdue('2020-01-01', false)).toBe(true)
  })
  it('is false when completed', () => {
    expect(isOverdue('2020-01-01', true)).toBe(false)
  })
  it('is false for a future due date', () => {
    expect(isOverdue('2999-01-01', false)).toBe(false)
  })
  it('is false with no due date', () => {
    expect(isOverdue(null, false)).toBe(false)
  })
})

describe('dueLabel', () => {
  it('returns null with no due date', () => {
    expect(dueLabel(null)).toBeNull()
  })
  it('labels today and tomorrow relative to now', () => {
    expect(dueLabel(dayKey(new Date()))).toBe('Today')
    expect(dueLabel(dayKey(addDays(new Date(), 1)))).toBe('Tomorrow')
    expect(dueLabel(dayKey(subDays(new Date(), 1)))).toBe('Yesterday')
  })
  it('describes overdue days', () => {
    expect(dueLabel(dayKey(subDays(new Date(), 3)))).toBe('3d overdue')
  })
  it('describes near-future days within a week', () => {
    expect(dueLabel(dayKey(addDays(new Date(), 4)))).toBe('In 4d')
  })
  it('falls back to a short date beyond a week', () => {
    const far = addDays(new Date(), 30)
    expect(dueLabel(dayKey(far))).toBe(format(far, 'MMM d'))
  })
})

describe('lastNDays', () => {
  it('returns n ascending day keys ending today', () => {
    const days = lastNDays(5)
    expect(days).toHaveLength(5)
    expect(days[days.length - 1]).toBe(todayKey())
    // strictly ascending
    for (let i = 1; i < days.length; i++) {
      expect(days[i] > days[i - 1]).toBe(true)
    }
  })
})
