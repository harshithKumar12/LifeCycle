import { Check, Pencil, Trash2, CalendarDays } from 'lucide-react'
import type { Task } from '@/types'
import { PRIORITY_META } from '@/lib/constants'
import { dueLabel, isOverdue } from '@/lib/date'
import { clsx } from '@/lib/clsx'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const priority = PRIORITY_META[task.priority]
  const overdue = isOverdue(task.dueDate, task.completed)
  const due = dueLabel(task.dueDate)

  return (
    <div
      className={clsx(
        'group flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-brand-400/60',
        task.completed && 'opacity-70',
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        aria-pressed={task.completed}
        aria-label={task.completed ? 'Mark task as not done' : 'Mark task as done'}
        className={clsx(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          task.completed
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-content-subtle/50 hover:border-brand-500',
        )}
      >
        {task.completed && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={clsx('text-sm font-medium text-content', task.completed && 'line-through')}>{task.title}</p>
        {task.notes && <p className="mt-0.5 line-clamp-2 text-xs text-content-muted">{task.notes}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={clsx('chip', priority.chip)}>
            <span className={clsx('h-1.5 w-1.5 rounded-full', priority.dot)} />
            {priority.label}
          </span>
          {due && (
            <span
              className={clsx(
                'chip gap-1',
                overdue ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-surface-2 text-content-subtle',
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {due}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          onClick={() => onEdit(task)}
          className="btn-ghost h-8 w-8 rounded-lg p-0"
          aria-label={`Edit task ${task.title}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="btn-ghost h-8 w-8 rounded-lg p-0 hover:text-rose-500"
          aria-label={`Delete task ${task.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
