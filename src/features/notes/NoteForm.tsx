import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, TextArea } from '@/components/ui/Field'
import type { Note } from '@/types'
import type { NoteInput } from '@/store/useStore'
import { clsx } from '@/lib/clsx'

interface NoteFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: NoteInput) => void
  initial?: Note | null
}

export function NoteForm({ open, onClose, onSubmit, initial }: NoteFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '')
      setBody(initial?.body ?? '')
      setTags(initial?.tags ?? [])
      setTagDraft('')
      setError(null)
    }
  }, [open, initial])

  const addTag = (raw: string) => {
    const t = raw.trim().toLowerCase().replace(/^#/, '')
    if (t && !tags.includes(t) && tags.length < 12) setTags((prev) => [...prev, t])
    setTagDraft('')
  }

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagDraft)
    } else if (e.key === 'Backspace' && !tagDraft && tags.length) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    const b = body.trim()
    if (!t && !b) {
      setError('Write a title or some content first.')
      return
    }
    // Fold any half-typed tag into the list on save.
    const finalTags = tagDraft.trim() ? [...tags, tagDraft.trim().toLowerCase().replace(/^#/, '')] : tags
    onSubmit({ title: t, body: b, tags: finalTags })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit note' : 'New note'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" form="note-form" type="submit">
            {initial ? 'Save changes' : 'Add note'}
          </Button>
        </>
      }
    >
      <form id="note-form" onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Title" htmlFor="note-title" error={error}>
          <TextInput
            id="note-title"
            value={title}
            invalid={!!error}
            onChange={(e) => {
              setTitle(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Note title"
            maxLength={120}
          />
        </Field>

        <Field label="Content" htmlFor="note-body">
          <TextArea
            id="note-body"
            rows={5}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              if (error) setError(null)
            }}
            placeholder="Jot down anything…"
          />
        </Field>

        <div>
          <span className="label">Tags</span>
          <div
            className="input flex flex-wrap items-center gap-1.5"
            onClick={() => tagInputRef.current?.focus()}
          >
            {tags.map((tag) => (
              <span key={tag} className="chip bg-brand-500/10 text-brand-600 dark:text-brand-300">
                #{tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTags((prev) => prev.filter((t) => t !== tag))
                  }}
                  aria-label={`Remove tag ${tag}`}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={onTagKey}
              onBlur={() => tagDraft && addTag(tagDraft)}
              placeholder={tags.length ? '' : 'Add tags (press Enter)'}
              className={clsx('min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-content-subtle')}
              maxLength={24}
            />
          </div>
          <p className="mt-1.5 text-xs text-content-subtle">Press Enter or comma to add a tag. Up to 12.</p>
        </div>
      </form>
    </Modal>
  )
}
