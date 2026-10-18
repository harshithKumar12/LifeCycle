import type { Task, Habit, Note, SearchResult } from '@/types'

const MAX_PER_GROUP = 6

function matches(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q)
}

/**
 * Global search across tasks, habits and notes. Case-insensitive substring
 * match; results are grouped by kind (tasks → habits → notes) and capped.
 */
export function searchAll(
  query: string,
  data: { tasks: Task[]; habits: Habit[]; notes: Note[] },
): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const tasks = data.tasks
    .filter((t) => matches(t.title, q) || (t.notes ? matches(t.notes, q) : false))
    .slice(0, MAX_PER_GROUP)
    .map((item): SearchResult => ({ kind: 'task', item }))

  const habits = data.habits
    .filter((h) => matches(h.name, q))
    .slice(0, MAX_PER_GROUP)
    .map((item): SearchResult => ({ kind: 'habit', item }))

  const notes = data.notes
    .filter((n) => matches(n.title, q) || matches(n.body, q) || n.tags.some((t) => matches(t, q)))
    .slice(0, MAX_PER_GROUP)
    .map((item): SearchResult => ({ kind: 'note', item }))

  return [...tasks, ...habits, ...notes]
}
