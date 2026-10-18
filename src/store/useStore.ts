import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Task,
  Habit,
  Note,
  FocusSession,
  FocusSettings,
  Priority,
  HabitIcon,
  ThemeMode,
} from '@/types'
import { uid } from '@/lib/id'
import { todayKey } from '@/lib/date'

// ---------------------------------------------------------------------------
// Input shapes for create/update actions. Forms validate before calling; the
// store trims strings defensively and ignores empty required fields.
// ---------------------------------------------------------------------------
export interface TaskInput {
  title: string
  notes?: string
  priority: Priority
  dueDate: string | null
}
export interface HabitInput {
  name: string
  icon: HabitIcon
  color: string
}
export interface NoteInput {
  title: string
  body: string
  tags: string[]
}

interface LifeDeskState {
  tasks: Task[]
  habits: Habit[]
  notes: Note[]
  focusSessions: FocusSession[]
  focusSettings: FocusSettings
  theme: ThemeMode
  hasSeeded: boolean

  // Tasks
  addTask: (input: TaskInput) => Task | null
  updateTask: (id: string, patch: Partial<TaskInput>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  // Habits
  addHabit: (input: HabitInput) => Habit | null
  updateHabit: (id: string, patch: Partial<HabitInput>) => void
  toggleHabit: (id: string, day?: string) => void
  deleteHabit: (id: string) => void

  // Notes
  addNote: (input: NoteInput) => Note | null
  updateNote: (id: string, patch: Partial<NoteInput>) => void
  togglePinNote: (id: string) => void
  deleteNote: (id: string) => void

  // Focus
  addFocusSession: (input: { durationMin: number; label?: string }) => void
  updateFocusSettings: (patch: Partial<FocusSettings>) => void

  // App
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  seedSampleData: () => void
  resetAll: () => void
}

const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  workMin: 25,
  breakMin: 5,
  longBreakMin: 15,
  sessionsBeforeLongBreak: 4,
}

function initialTheme(): ThemeMode {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const useStore = create<LifeDeskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      habits: [],
      notes: [],
      focusSessions: [],
      focusSettings: DEFAULT_FOCUS_SETTINGS,
      theme: initialTheme(),
      hasSeeded: false,

      // ---- Tasks -------------------------------------------------------
      addTask: (input) => {
        const title = input.title.trim()
        if (!title) return null
        const task: Task = {
          id: uid(),
          title,
          notes: input.notes?.trim() || undefined,
          priority: input.priority,
          dueDate: input.dueDate || null,
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        return task
      },
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...('title' in patch ? { title: patch.title!.trim() || t.title } : {}),
                  ...('notes' in patch ? { notes: patch.notes?.trim() || undefined } : {}),
                  ...('priority' in patch ? { priority: patch.priority! } : {}),
                  ...('dueDate' in patch ? { dueDate: patch.dueDate || null } : {}),
                }
              : t,
          ),
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : null,
                }
              : t,
          ),
        })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // ---- Habits ------------------------------------------------------
      addHabit: (input) => {
        const name = input.name.trim()
        if (!name) return null
        const habit: Habit = {
          id: uid(),
          name,
          icon: input.icon,
          color: input.color,
          createdAt: new Date().toISOString(),
          completedDates: [],
        }
        set((s) => ({ habits: [...s.habits, habit] }))
        return habit
      },
      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  ...('name' in patch ? { name: patch.name!.trim() || h.name } : {}),
                  ...('icon' in patch ? { icon: patch.icon! } : {}),
                  ...('color' in patch ? { color: patch.color! } : {}),
                }
              : h,
          ),
        })),
      toggleHabit: (id, day = todayKey()) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h
            const has = h.completedDates.includes(day)
            return {
              ...h,
              completedDates: has
                ? h.completedDates.filter((d) => d !== day)
                : [...h.completedDates, day].sort(),
            }
          }),
        })),
      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      // ---- Notes -------------------------------------------------------
      addNote: (input) => {
        const title = input.title.trim()
        const body = input.body.trim()
        if (!title && !body) return null
        const now = new Date().toISOString()
        const note: Note = {
          id: uid(),
          title: title || 'Untitled note',
          body,
          tags: normalizeTags(input.tags),
          pinned: false,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ notes: [note, ...s.notes] }))
        return note
      },
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  ...('title' in patch ? { title: patch.title!.trim() || 'Untitled note' } : {}),
                  ...('body' in patch ? { body: patch.body ?? n.body } : {}),
                  ...('tags' in patch ? { tags: normalizeTags(patch.tags!) } : {}),
                  updatedAt: new Date().toISOString(),
                }
              : n,
          ),
        })),
      togglePinNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      // ---- Focus -------------------------------------------------------
      addFocusSession: ({ durationMin, label }) =>
        set((s) => ({
          focusSessions: [
            {
              id: uid(),
              durationMin: Math.max(1, Math.round(durationMin)),
              completedAt: new Date().toISOString(),
              label: label?.trim() || undefined,
            },
            ...s.focusSessions,
          ],
        })),
      updateFocusSettings: (patch) =>
        set((s) => ({ focusSettings: clampFocusSettings({ ...s.focusSettings, ...patch }) })),

      // ---- App ---------------------------------------------------------
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      seedSampleData: () => {
        if (get().hasSeeded) return
        set(buildSampleData())
      },
      resetAll: () =>
        set({
          tasks: [],
          habits: [],
          notes: [],
          focusSessions: [],
          focusSettings: DEFAULT_FOCUS_SETTINGS,
          hasSeeded: false,
        }),
    }),
    {
      name: 'lifedesk-v1',
      version: 1,
      partialize: (s) => ({
        tasks: s.tasks,
        habits: s.habits,
        notes: s.notes,
        focusSessions: s.focusSessions,
        focusSettings: s.focusSettings,
        theme: s.theme,
        hasSeeded: s.hasSeeded,
      }),
    },
  ),
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalizeTags(tags: string[]): string[] {
  const cleaned = tags
    .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
    .filter(Boolean)
  return Array.from(new Set(cleaned)).slice(0, 12)
}

function clampFocusSettings(s: FocusSettings): FocusSettings {
  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, Math.round(Number.isFinite(v) ? v : lo)))
  return {
    workMin: clamp(s.workMin, 1, 180),
    breakMin: clamp(s.breakMin, 1, 60),
    longBreakMin: clamp(s.longBreakMin, 1, 90),
    sessionsBeforeLongBreak: clamp(s.sessionsBeforeLongBreak, 2, 12),
  }
}

// Realistic, user-triggered sample data (not shown unless the user opts in
// from an empty state). Generates habit history so streaks/charts look alive.
function buildSampleData(): Partial<LifeDeskState> {
  const now = Date.now()
  const iso = (offsetDays: number) => new Date(now - offsetDays * 86400000).toISOString()
  const day = (offsetDays: number) =>
    new Date(now - offsetDays * 86400000).toISOString().slice(0, 10)

  const habits: Habit[] = [
    { id: uid(), name: 'Exercise', icon: 'dumbbell', color: '#f43f5e', createdAt: iso(30), completedDates: [] },
    { id: uid(), name: 'Read 20 pages', icon: 'book', color: '#f59e0b', createdAt: iso(30), completedDates: [] },
    { id: uid(), name: 'Code', icon: 'code', color: '#6366f1', createdAt: iso(30), completedDates: [] },
    { id: uid(), name: 'Drink water', icon: 'droplet', color: '#0ea5e9', createdAt: iso(30), completedDates: [] },
    { id: uid(), name: 'Study', icon: 'graduation', color: '#10b981', createdAt: iso(30), completedDates: [] },
  ]
  // Seed plausible history: each habit hit on most recent days with some gaps.
  const rates = [0.8, 0.6, 0.9, 0.95, 0.5]
  habits.forEach((h, i) => {
    const dates: string[] = []
    for (let d = 0; d < 21; d++) {
      // deterministic-ish pattern so streaks are believable
      if ((d * 7 + i * 3) % 10 < rates[i] * 10) dates.push(day(d))
    }
    h.completedDates = dates.sort()
  })

  const tasks: Task[] = [
    { id: uid(), title: 'Plan the week', notes: 'Block focus time', priority: 'high', dueDate: day(0), completed: false, createdAt: iso(1), completedAt: null },
    { id: uid(), title: 'Reply to emails', priority: 'medium', dueDate: day(0), completed: true, createdAt: iso(1), completedAt: iso(0) },
    { id: uid(), title: 'Grocery shopping', priority: 'low', dueDate: day(1), completed: false, createdAt: iso(2), completedAt: null },
    { id: uid(), title: 'Finish project proposal', notes: 'Send to team', priority: 'high', dueDate: day(2), completed: false, createdAt: iso(3), completedAt: null },
    { id: uid(), title: 'Pay electricity bill', priority: 'medium', dueDate: day(3), completed: false, createdAt: iso(4), completedAt: null },
  ]

  const notes: Note[] = [
    { id: uid(), title: 'Book ideas', body: 'Atomic Habits, Deep Work, The Pragmatic Programmer.', tags: ['reading', 'ideas'], pinned: true, createdAt: iso(5), updatedAt: iso(1) },
    { id: uid(), title: 'Standup notes', body: 'Shipped the dashboard. Next: focus timer polish.', tags: ['work'], pinned: false, createdAt: iso(2), updatedAt: iso(2) },
    { id: uid(), title: 'Groceries', body: 'Oats, spinach, coffee, olive oil.', tags: ['home'], pinned: false, createdAt: iso(1), updatedAt: iso(1) },
  ]

  const focusSessions: FocusSession[] = [
    { id: uid(), durationMin: 25, completedAt: iso(0), label: 'Deep work' },
    { id: uid(), durationMin: 25, completedAt: iso(0), label: 'Deep work' },
    { id: uid(), durationMin: 25, completedAt: iso(1), label: 'Study' },
    { id: uid(), durationMin: 50, completedAt: iso(2), label: 'Writing' },
    { id: uid(), durationMin: 25, completedAt: iso(3) },
  ]

  return { habits, tasks, notes, focusSessions, hasSeeded: true }
}
