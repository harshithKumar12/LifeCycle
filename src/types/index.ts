// ---------------------------------------------------------------------------
// Domain model for LifeDesk. All entities are plain serializable objects so
// they can be persisted to localStorage without custom (de)serialization.
// ---------------------------------------------------------------------------

export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'active' | 'completed'

export interface Task {
  id: string
  title: string
  notes?: string
  priority: Priority
  /** ISO date string (yyyy-MM-dd) or null when no due date. */
  dueDate: string | null
  completed: boolean
  createdAt: string // ISO timestamp
  completedAt: string | null // ISO timestamp
}

/** Preset icons a habit can use — keyed to lucide-react icons in the UI. */
export type HabitIcon =
  | 'dumbbell'
  | 'book'
  | 'code'
  | 'droplet'
  | 'graduation'
  | 'heart'
  | 'sun'
  | 'moon'
  | 'sparkles'
  | 'target'

export interface Habit {
  id: string
  name: string
  icon: HabitIcon
  color: string // tailwind-ish hex used for accents/charts
  createdAt: string
  /** Set of ISO date strings (yyyy-MM-dd) on which the habit was completed. */
  completedDates: string[]
}

export interface Note {
  id: string
  title: string
  body: string
  tags: string[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface FocusSession {
  id: string
  /** Minutes of focused work in this session. */
  durationMin: number
  /** ISO timestamp of when the session completed. */
  completedAt: string
  /** Optional label describing what was worked on. */
  label?: string
}

export interface FocusSettings {
  workMin: number
  breakMin: number
  longBreakMin: number
  /** Number of work sessions before a long break. */
  sessionsBeforeLongBreak: number
}

export type ThemeMode = 'light' | 'dark'

// Discriminated union used by the global search feature.
export type SearchResult =
  | { kind: 'task'; item: Task }
  | { kind: 'habit'; item: Habit }
  | { kind: 'note'; item: Note }
