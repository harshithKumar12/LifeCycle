import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from './useStore'

const get = () => useStore.getState()

beforeEach(() => {
  get().resetAll()
})

describe('tasks', () => {
  it('adds a task, trimming the title, and rejects empty titles', () => {
    const created = get().addTask({ title: '  Write report  ', priority: 'high', dueDate: '2026-09-08' })
    expect(created).not.toBeNull()
    expect(get().tasks).toHaveLength(1)
    expect(get().tasks[0].title).toBe('Write report')
    expect(get().tasks[0].completed).toBe(false)

    const rejected = get().addTask({ title: '   ', priority: 'low', dueDate: null })
    expect(rejected).toBeNull()
    expect(get().tasks).toHaveLength(1)
  })

  it('toggles completion and stamps completedAt', () => {
    const t = get().addTask({ title: 'Task', priority: 'medium', dueDate: null })!
    get().toggleTask(t.id)
    expect(get().tasks[0].completed).toBe(true)
    expect(get().tasks[0].completedAt).not.toBeNull()
    get().toggleTask(t.id)
    expect(get().tasks[0].completed).toBe(false)
    expect(get().tasks[0].completedAt).toBeNull()
  })

  it('updates and deletes a task', () => {
    const t = get().addTask({ title: 'Old', priority: 'low', dueDate: null })!
    get().updateTask(t.id, { title: 'New', priority: 'high' })
    expect(get().tasks[0]).toMatchObject({ title: 'New', priority: 'high' })
    get().deleteTask(t.id)
    expect(get().tasks).toHaveLength(0)
  })
})

describe('habits', () => {
  it('adds a habit and toggles completion for a specific day', () => {
    const h = get().addHabit({ name: 'Exercise', icon: 'dumbbell', color: '#f43f5e' })!
    expect(get().habits).toHaveLength(1)

    get().toggleHabit(h.id, '2026-09-07')
    expect(get().habits[0].completedDates).toContain('2026-09-07')

    get().toggleHabit(h.id, '2026-09-07')
    expect(get().habits[0].completedDates).not.toContain('2026-09-07')
  })

  it('rejects an empty name and deletes a habit', () => {
    expect(get().addHabit({ name: '  ', icon: 'code', color: '#6366f1' })).toBeNull()
    const h = get().addHabit({ name: 'Read', icon: 'book', color: '#f59e0b' })!
    get().deleteHabit(h.id)
    expect(get().habits).toHaveLength(0)
  })
})

describe('notes', () => {
  it('requires a title or body, normalizes tags, and pins', () => {
    expect(get().addNote({ title: '', body: '', tags: [] })).toBeNull()

    const n = get().addNote({ title: 'Idea', body: '', tags: ['#Work', 'work', ' Ideas '] })!
    // deduped, lowercased, hash-stripped
    expect(n.tags).toEqual(['work', 'ideas'])

    get().togglePinNote(n.id)
    expect(get().notes[0].pinned).toBe(true)

    get().deleteNote(n.id)
    expect(get().notes).toHaveLength(0)
  })

  it('titles an empty-title note with a body as "Untitled note"', () => {
    const n = get().addNote({ title: '', body: 'just a body', tags: [] })!
    expect(n.title).toBe('Untitled note')
  })
})

describe('focus', () => {
  it('logs a session, rounding and clamping the duration to at least 1', () => {
    get().addFocusSession({ durationMin: 25.6, label: '  Deep work  ' })
    expect(get().focusSessions[0].durationMin).toBe(26)
    expect(get().focusSessions[0].label).toBe('Deep work')

    get().addFocusSession({ durationMin: 0 })
    expect(get().focusSessions[0].durationMin).toBe(1)
  })

  it('clamps focus settings to sane ranges', () => {
    get().updateFocusSettings({ workMin: 9999, breakMin: 0 })
    expect(get().focusSettings.workMin).toBe(180)
    expect(get().focusSettings.breakMin).toBe(1)
  })
})

describe('sample data + reset', () => {
  it('seeds once and is idempotent, then reset clears everything', () => {
    get().seedSampleData()
    const taskCount = get().tasks.length
    expect(taskCount).toBeGreaterThan(0)
    expect(get().habits.length).toBeGreaterThan(0)
    expect(get().hasSeeded).toBe(true)

    // second call is a no-op
    get().seedSampleData()
    expect(get().tasks).toHaveLength(taskCount)

    get().resetAll()
    expect(get().tasks).toHaveLength(0)
    expect(get().habits).toHaveLength(0)
    expect(get().notes).toHaveLength(0)
    expect(get().focusSessions).toHaveLength(0)
    expect(get().hasSeeded).toBe(false)
  })
})
