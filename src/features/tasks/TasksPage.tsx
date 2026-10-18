import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, ListTodo, X } from 'lucide-react'
import { useStore, type TaskInput } from '@/store/useStore'
import type { Task, Priority } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Segmented'
import { Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { TaskForm } from './TaskForm'
import { TaskItem } from './TaskItem'
import { PRIORITY_META } from '@/lib/constants'
import { isOverdue } from '@/lib/date'

type StatusFilter = 'all' | 'active' | 'completed'
type PriorityFilter = 'all' | Priority

export function TasksPage() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)
  const toggleTask = useStore((s) => s.toggleTask)
  const deleteTask = useStore((s) => s.deleteTask)
  const seedSampleData = useStore((s) => s.seedSampleData)
  const { toast } = useToast()

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [priority, setPriority] = useState<PriorityFilter>('all')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)

  // Respond to ?new=1 (from the global quick-add) then strip the param.
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const priorityRank = (p: Priority) => PRIORITY_META[p].order
    return tasks
      .filter((t) => {
        if (status === 'active' && t.completed) return false
        if (status === 'completed' && !t.completed) return false
        if (priority !== 'all' && t.priority !== priority) return false
        if (q && !(t.title.toLowerCase().includes(q) || (t.notes ?? '').toLowerCase().includes(q))) return false
        return true
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        const aOver = isOverdue(a.dueDate, a.completed)
        const bOver = isOverdue(b.dueDate, b.completed)
        if (aOver !== bOver) return aOver ? -1 : 1
        if (a.priority !== b.priority) return priorityRank(a.priority) - priorityRank(b.priority)
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return b.createdAt.localeCompare(a.createdAt)
      })
  }, [tasks, search, status, priority])

  const counts = useMemo(() => {
    const active = tasks.filter((t) => !t.completed).length
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.completed)).length
    const completed = tasks.length - active
    return { active, overdue, completed, total: tasks.length }
  }, [tasks])

  const handleSubmit = (input: TaskInput) => {
    if (editing) {
      updateTask(editing.id, input)
      toast('Task updated')
    } else {
      addTask(input)
      toast('Task added')
    }
    setFormOpen(false)
    setEditing(null)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (deleting) {
      deleteTask(deleting.id)
      toast('Task deleted', 'info')
    }
  }

  const hasTasks = tasks.length > 0
  const hasResults = filtered.length > 0

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={
          hasTasks
            ? `${counts.active} active · ${counts.overdue} overdue · ${counts.completed} completed`
            : 'Capture what needs doing and stay on top of deadlines.'
        }
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            New task
          </Button>
        }
      />

      {hasTasks && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="input pl-9"
              aria-label="Search tasks"
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
          <div className="flex items-center gap-2">
            <Segmented<StatusFilter>
              ariaLabel="Filter by status"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Done' },
              ]}
            />
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityFilter)}
              className="w-auto"
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>
      )}

      {!hasTasks ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          message="Add your first task to start tracking what matters today. You can set priorities and due dates too."
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
                Add a task
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
      ) : !hasResults ? (
        <EmptyState
          icon={Search}
          title="No matching tasks"
          message="Try a different search term or clear your filters to see everything."
          action={
            <Button
              variant="subtle"
              onClick={() => {
                setSearch('')
                setStatus('all')
                setPriority('all')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <TaskForm
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
        title="Delete task?"
        message={deleting ? `“${deleting.title}” will be permanently removed. This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
