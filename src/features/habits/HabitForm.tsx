import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, TextInput } from '@/components/ui/Field'
import { HABIT_COLORS, HABIT_ICONS } from '@/lib/constants'
import { clsx } from '@/lib/clsx'
import type { Habit, HabitIcon } from '@/types'
import type { HabitInput } from '@/store/useStore'

interface HabitFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: HabitInput) => void
  initial?: Habit | null
}

const DEFAULT: HabitInput = { name: '', icon: 'sparkles', color: HABIT_COLORS[0] }

export function HabitForm({ open, onClose, onSubmit, initial }: HabitFormProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<HabitIcon>(DEFAULT.icon)
  const [color, setColor] = useState<string>(DEFAULT.color)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setIcon(initial?.icon ?? DEFAULT.icon)
      setColor(initial?.color ?? DEFAULT.color)
      setError(null)
    }
  }, [open, initial])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give your habit a name.')
      return
    }
    if (trimmed.length > 40) {
      setError('Keep the name under 40 characters.')
      return
    }
    onSubmit({ name: trimmed, icon, color })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit habit' : 'New habit'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" form="habit-form" type="submit">
            {initial ? 'Save changes' : 'Add habit'}
          </Button>
        </>
      }
    >
      <form id="habit-form" onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Name" htmlFor="habit-name" required error={error}>
          <TextInput
            id="habit-name"
            value={name}
            invalid={!!error}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Exercise, Read, Drink water"
            maxLength={48}
          />
        </Field>

        <div>
          <span className="label">Icon</span>
          <div className="grid grid-cols-5 gap-2">
            {HABIT_ICONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setIcon(id)}
                aria-label={label}
                aria-pressed={icon === id}
                title={label}
                className={clsx(
                  'flex aspect-square items-center justify-center rounded-lg border transition-colors',
                  icon === id
                    ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                    : 'border-border text-content-muted hover:bg-surface-2',
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Color</span>
          <div className="flex flex-wrap gap-2.5">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                aria-pressed={color === c}
                className={clsx(
                  'h-8 w-8 rounded-full transition-transform',
                  color === c ? 'ring-2 ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-105',
                )}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  )
}
