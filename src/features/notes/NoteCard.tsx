import { Pin, PinOff, Pencil, Trash2 } from 'lucide-react'
import type { Note } from '@/types'
import { clsx } from '@/lib/clsx'
import { formatShortDate } from '@/lib/date'

interface NoteCardProps {
  note: Note
  onTogglePin: (id: string) => void
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
  onTagClick: (tag: string) => void
}

export function NoteCard({ note, onTogglePin, onEdit, onDelete, onTagClick }: NoteCardProps) {
  return (
    <div
      className={clsx(
        'group flex flex-col rounded-xl border bg-surface p-4 transition-colors',
        note.pinned ? 'border-brand-400/60' : 'border-border hover:border-brand-400/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-content">{note.title}</h3>
        <button
          onClick={() => onTogglePin(note.id)}
          className={clsx(
            'shrink-0 rounded-md p-1 transition-colors',
            note.pinned ? 'text-brand-500' : 'text-content-subtle hover:text-content',
          )}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          aria-pressed={note.pinned}
        >
          {note.pinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
        </button>
      </div>

      {note.body && <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-sm text-content-muted">{note.body}</p>}

      {note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="chip bg-surface-2 text-content-subtle transition-colors hover:text-brand-500"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] text-content-subtle">Updated {formatShortDate(note.updatedAt.slice(0, 10))}</span>
        <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <button onClick={() => onEdit(note)} className="btn-ghost h-8 w-8 rounded-lg p-0" aria-label={`Edit note ${note.title}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(note)}
            className="btn-ghost h-8 w-8 rounded-lg p-0 hover:text-rose-500"
            aria-label={`Delete note ${note.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
