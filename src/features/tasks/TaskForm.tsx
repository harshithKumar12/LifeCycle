import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, TextArea, Select } from '@/components/ui/Field'
import type { Task } from '@/types'
import type { TaskInput } from '@/store/useStore'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: TaskInput) => void
  initial?: Task | null
}

const EMPTY: TaskInput = { title: '', notes: '', priority: 'medium', dueDate: null }

export function TaskForm({ open, onClose, onSubmit, initial }: TaskFormProps) {
  const [form, setForm] = useState<TaskInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { title: initial.title, notes: initial.notes ?? '', priority: initial.priority, dueDate: initial.dueDate }
          : EMPTY,
      )
      setError(null)
    }
  }, [open, initial])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) {
      setError('Give your task a title.')
      return
    }
    if (title.length > 120) {
      setError('Keep the title under 120 characters.')
      return
    }
    onSubmit({ ...form, title })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit task' : 'New task'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" form="task-form" type="submit">
            {initial ? 'Save changes' : 'Add task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Title" htmlFor="task-title" required error={error}>
          <TextInput
            id="task-title"
            value={form.title}
            invalid={!!error}
            onChange={(e) => {
              setForm((f) => ({ ...f, title: e.target.value }))
              if (error) setError(null)
            }}
            placeholder="e.g. Finish the quarterly report"
            maxLength={140}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Priority" htmlFor="task-priority">
            <Select
              id="task-priority"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskInput['priority'] }))}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>

          <Field label="Due date" htmlFor="task-due" hint="Optional">
            <TextInput
              id="task-due"
              type="date"
              value={form.dueDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value || null }))}
            />
          </Field>
        </div>

        <Field label="Notes" htmlFor="task-notes" hint="Optional details">
          <TextArea
            id="task-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Add any extra context…"
          />
        </Field>
      </form>
    </Modal>
  )
}
