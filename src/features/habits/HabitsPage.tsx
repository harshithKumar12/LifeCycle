import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Repeat, X } from 'lucide-react'
import { useStore, type HabitInput } from '@/store/useStore'
import type { Habit } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Segmented'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { HabitForm } from './HabitForm'
import { HabitCard } from './HabitCard'

export function HabitsPage() {
  const habits = useStore((s) => s.habits)
  const addHabit = useStore((s) => s.addHabit)
  const updateHabit = useStore((s) => s.updateHabit)
  const toggleHabit = useStore((s) => s.toggleHabit)
  const deleteHabit = useStore((s) => s.deleteHabit)
  const seedSampleData = useStore((s) => s.seedSampleData)
  const { toast } = useToast()

  const [searchParams, setSearchParams] = useSearchParams()
  const [range, setRange] = useState<'week' | 'month'>('week')
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)
  const [deleting, setDeleting] = useState<Habit | null>(null)

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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return habits
    return habits.filter((h) => h.name.toLowerCase().includes(q))
  }, [habits, query])

  const handleSubmit = (input: HabitInput) => {
    if (editing) {
      updateHabit(editing.id, input)
      toast('Habit updated')
    } else {
      addHabit(input)
      toast('Habit added')
    }
    setFormOpen(false)
    setEditing(null)
  }

  const hasHabits = habits.length > 0

  return (
    <div>
      <PageHeader
        title="Habits"
        description={
          hasHabits ? 'Build momentum — mark habits done and watch your streaks grow.' : 'Create daily habits and keep your streaks alive.'
        }
        actions={
          <div className="flex items-center gap-2">
            {hasHabits && (
              <Segmented<'week' | 'month'>
                ariaLabel="Streak range"
                value={range}
                onChange={setRange}
                options={[
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            )}
            <Button
              variant="primary"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              New habit
            </Button>
          </div>
        }
      />

      {query.trim() && hasHabits && (
        <button
          onClick={() => setQuery('')}
          className="chip mb-4 bg-surface-2 text-content-muted hover:text-content"
        >
          Filtered by “{query.trim()}” <X className="h-3 w-3" />
        </button>
      )}

      {!hasHabits ? (
        <EmptyState
          icon={Repeat}
          title="No habits yet"
          message="Start with something small like drinking water or reading. Consistency beats intensity."
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
                Add a habit
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
          icon={Repeat}
          title="No matching habits"
          message="No habits match your search."
          action={
            <Button variant="subtle" onClick={() => setQuery('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              range={range}
              onToggleToday={(id) => toggleHabit(id)}
              onToggleDay={(id, day) => toggleHabit(id, day)}
              onEdit={(h) => {
                setEditing(h)
                setFormOpen(true)
              }}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <HabitForm
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
        title="Delete habit?"
        message={deleting ? `“${deleting.name}” and its history will be permanently removed.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleting && deleteHabit(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
