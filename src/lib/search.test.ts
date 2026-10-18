import { describe, it, expect } from 'vitest'
import { searchAll } from './search'
import type { Task, Habit, Note } from '@/types'

const task = (title: string, notes?: string): Task => ({
  id: `t-${title}`,
  title,
  notes,
  priority: 'medium',
  dueDate: null,
  completed: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  completedAt: null,
})
const habit = (name: string): Habit => ({
  id: `h-${name}`,
  name,
  icon: 'code',
  color: '#6366f1',
  createdAt: '2026-09-01T00:00:00.000Z',
  completedDates: [],
})
const note = (title: string, body = '', tags: string[] = []): Note => ({
  id: `n-${title}`,
  title,
  body,
  tags,
  pinned: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
})

const data = (o: { tasks?: Task[]; habits?: Habit[]; notes?: Note[] }) => ({
  tasks: o.tasks ?? [],
  habits: o.habits ?? [],
  notes: o.notes ?? [],
})

describe('searchAll', () => {
  it('returns nothing for an empty or whitespace query', () => {
    expect(searchAll('', data({ tasks: [task('Anything')] }))).toEqual([])
    expect(searchAll('   ', data({ tasks: [task('Anything')] }))).toEqual([])
  })

  it('matches task titles case-insensitively', () => {
    const results = searchAll('REPORT', data({ tasks: [task('Write report'), task('Buy milk')] }))
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ kind: 'task', item: { title: 'Write report' } })
  })

  it('matches task notes', () => {
    const results = searchAll('quarterly', data({ tasks: [task('Report', 'the quarterly numbers')] }))
    expect(results).toHaveLength(1)
  })

  it('matches habit names', () => {
    const results = searchAll('read', data({ habits: [habit('Reading'), habit('Exercise')] }))
    expect(results).toHaveLength(1)
    expect(results[0].kind).toBe('habit')
  })

  it('matches note title, body, and tags', () => {
    const notes = [note('Alpha', 'body text'), note('Beta', '', ['work', 'urgent']), note('Gamma', 'nothing here')]
    expect(searchAll('body', data({ notes }))).toHaveLength(1)
    expect(searchAll('urgent', data({ notes }))).toHaveLength(1)
    expect(searchAll('alpha', data({ notes }))).toHaveLength(1)
  })

  it('groups results in task → habit → note order', () => {
    const results = searchAll('focus', {
      tasks: [task('focus task')],
      habits: [habit('focus habit')],
      notes: [note('focus note')],
    })
    expect(results.map((r) => r.kind)).toEqual(['task', 'habit', 'note'])
  })

  it('caps each group at six results', () => {
    const tasks = Array.from({ length: 10 }, (_, i) => task(`focus ${i}`))
    const results = searchAll('focus', data({ tasks }))
    expect(results).toHaveLength(6)
  })
})
