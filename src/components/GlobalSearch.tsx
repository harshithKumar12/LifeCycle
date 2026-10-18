import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, CheckSquare, Repeat, StickyNote, CornerDownLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { searchAll } from '@/lib/search'
import type { SearchResult } from '@/types'
import { clsx } from '@/lib/clsx'

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

const KIND_META = {
  task: { icon: CheckSquare, label: 'Task', path: '/tasks' },
  habit: { icon: Repeat, label: 'Habit', path: '/habits' },
  note: { icon: StickyNote, label: 'Note', path: '/notes' },
} as const

function resultTitle(r: SearchResult): string {
  if (r.kind === 'task') return r.item.title
  if (r.kind === 'habit') return r.item.name
  return r.item.title
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)
  const notes = useStore((s) => s.notes)

  const results = useMemo(() => searchAll(query, { tasks, habits, notes }), [query, tasks, habits, notes])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const t = window.setTimeout(() => inputRef.current?.focus(), 20)
      return () => window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const select = (r: SearchResult) => {
    const { path } = KIND_META[r.kind]
    onClose()
    navigate(`${path}?q=${encodeURIComponent(query.trim())}`)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && results[active]) {
        e.preventDefault()
        select(results[active])
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, active])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-card animate-scale-in"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-content-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, habits and notes…"
            className="h-14 flex-1 bg-transparent text-content outline-none placeholder:text-content-subtle"
          />
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {query.trim() === '' ? (
            <p className="px-3 py-8 text-center text-sm text-content-subtle">
              Start typing to search across everything in LifeDesk.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-content-subtle">
              No matches for “{query.trim()}”.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {results.map((r, i) => {
                const meta = KIND_META[r.kind]
                const Icon = meta.icon
                return (
                  <li key={`${r.kind}-${r.item.id}`}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => select(r)}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        i === active ? 'bg-brand-500/10' : 'hover:bg-surface-2',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-content-subtle" />
                      <span className="flex-1 truncate text-sm text-content">{resultTitle(r)}</span>
                      <span className="chip bg-surface-2 text-content-subtle">{meta.label}</span>
                      {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-content-subtle" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
