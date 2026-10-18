import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, StickyNote, Search, X } from 'lucide-react'
import { useStore, type NoteInput } from '@/store/useStore'
import type { Note } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { NoteForm } from './NoteForm'
import { NoteCard } from './NoteCard'
import { clsx } from '@/lib/clsx'

export function NotesPage() {
  const notes = useStore((s) => s.notes)
  const addNote = useStore((s) => s.addNote)
  const updateNote = useStore((s) => s.updateNote)
  const togglePinNote = useStore((s) => s.togglePinNote)
  const deleteNote = useStore((s) => s.deleteNote)
  const seedSampleData = useStore((s) => s.seedSampleData)
  const { toast } = useToast()

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState<Note | null>(null)

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setEditing(null)
      setFormOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [notes])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return notes
      .filter((n) => {
        if (activeTag && !n.tags.includes(activeTag)) return false
        if (q && !(n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.tags.some((t) => t.includes(q))))
          return false
        return true
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.updatedAt.localeCompare(a.updatedAt)
      })
  }, [notes, search, activeTag])

  const handleSubmit = (input: NoteInput) => {
    if (editing) {
      updateNote(editing.id, input)
      toast('Note saved')
    } else {
      addNote(input)
      toast('Note added')
    }
    setFormOpen(false)
    setEditing(null)
  }

  const hasNotes = notes.length > 0

  return (
    <div>
      <PageHeader
        title="Notes"
        description={hasNotes ? 'Capture ideas fast. Pin the important ones and tag to stay organized.' : 'Quick notes for ideas, reminders and anything worth keeping.'}
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            New note
          </Button>
        }
      />

      {hasNotes && (
        <div className="mb-5 flex flex-col gap-3">
          <div className="relative sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="input pl-9"
              aria-label="Search notes"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-content-subtle hover:text-content"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTag(null)}
                className={clsx('chip', !activeTag ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'bg-surface-2 text-content-muted')}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag((cur) => (cur === tag ? null : tag))}
                  className={clsx(
                    'chip',
                    activeTag === tag ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'bg-surface-2 text-content-muted hover:text-content',
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasNotes ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          message="Create your first note to capture an idea, a list, or a reminder."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Add a note
              </Button>
              <Button
                variant="subtle"
                onClick={() => {
                  seedSampleData()
                  toast('Loaded sample data')
                }}
              >
                Load sample data
              </Button>
            </div>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching notes"
          message="Try a different search term or clear the tag filter."
          action={
            <Button
              variant="subtle"
              onClick={() => {
                setSearch('')
                setActiveTag(null)
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onTogglePin={togglePinNote}
              onEdit={(n) => {
                setEditing(n)
                setFormOpen(true)
              }}
              onDelete={setDeleting}
              onTagClick={(tag) => setActiveTag(tag)}
            />
          ))}
        </div>
      )}

      <NoteForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete note?"
        message={deleting ? `“${deleting.title}” will be permanently removed.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleting && deleteNote(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
