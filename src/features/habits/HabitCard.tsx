import { Flame, Pencil, Trash2, Check, Trophy } from 'lucide-react'
import type { Habit } from '@/types'
import { habitIcon } from '@/lib/constants'
import { currentStreak, longestStreak, isHabitDoneOn, countCompletedIn } from '@/lib/stats'
import { lastNDays, todayKey, weekdayInitial } from '@/lib/date'
import { clsx } from '@/lib/clsx'

interface HabitCardProps {
  habit: Habit
  range: 'week' | 'month'
  onToggleToday: (id: string) => void
  onToggleDay: (id: string, day: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habit: Habit) => void
}

export function HabitCard({ habit, range, onToggleToday, onToggleDay, onEdit, onDelete }: HabitCardProps) {
  const Icon = habitIcon(habit.icon)
  const today = todayKey()
  const doneToday = isHabitDoneOn(habit, today)
  const streak = currentStreak(habit.completedDates)
  const best = longestStreak(habit.completedDates)

  const days = lastNDays(range === 'week' ? 7 : 28)
  const done = countCompletedIn(habit.completedDates, days)
  const rate = Math.round((done / days.length) * 100)

  return (
    <div className="card flex flex-col gap-4 p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${habit.color}22`, color: habit.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-content">{habit.name}</p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-content-muted">
            <Flame className={clsx('h-3.5 w-3.5', streak > 0 ? 'text-amber-500' : 'text-content-subtle')} />
            {streak > 0 ? `${streak} day streak` : 'No active streak'}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button onClick={() => onEdit(habit)} className="btn-ghost h-8 w-8 rounded-lg p-0" aria-label={`Edit ${habit.name}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(habit)}
            className="btn-ghost h-8 w-8 rounded-lg p-0 hover:text-rose-500"
            aria-label={`Delete ${habit.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={() => onToggleToday(habit.id)}
        aria-pressed={doneToday}
        className={clsx(
          'btn w-full border transition-colors',
          doneToday
            ? 'border-transparent bg-emerald-500 text-white hover:bg-emerald-600'
            : 'border-border bg-surface text-content hover:bg-surface-2',
        )}
      >
        <Check className="h-4 w-4" />
        {doneToday ? 'Done today' : 'Mark done today'}
      </button>

      {/* Day strip — week shows weekday labels; month is a denser heatmap. */}
      {range === 'week' ? (
        <div className="flex justify-between gap-1">
          {days.map((d) => {
            const active = habit.completedDates.includes(d)
            const isToday = d === today
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-content-subtle">{weekdayInitial(d)}</span>
                <button
                  onClick={() => onToggleDay(habit.id, d)}
                  aria-label={`Toggle ${habit.name} on ${d}`}
                  className={clsx(
                    'h-7 w-full rounded-md border transition-transform hover:scale-105',
                    active ? 'border-transparent' : 'border-border bg-surface-2',
                    isToday && !active && 'ring-1 ring-brand-400',
                  )}
                  style={active ? { backgroundColor: habit.color } : undefined}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const active = habit.completedDates.includes(d)
            const isToday = d === today
            return (
              <button
                key={d}
                onClick={() => onToggleDay(habit.id, d)}
                aria-label={`Toggle ${habit.name} on ${d}`}
                title={d}
                className={clsx(
                  'aspect-square rounded-[5px] border transition-transform hover:scale-110',
                  active ? 'border-transparent' : 'border-border bg-surface-2',
                  isToday && !active && 'ring-1 ring-brand-400',
                )}
                style={active ? { backgroundColor: habit.color } : undefined}
              />
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
        <Stat label="Streak" value={`${streak}d`} icon={<Flame className="h-3.5 w-3.5 text-amber-500" />} />
        <Stat label="Best" value={`${best}d`} icon={<Trophy className="h-3.5 w-3.5 text-brand-500" />} />
        <Stat label={range === 'week' ? 'This week' : 'This month'} value={`${rate}%`} />
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1 font-display text-sm font-semibold text-content">
        {icon}
        {value}
      </div>
      <p className="mt-0.5 text-[11px] text-content-subtle">{label}</p>
    </div>
  )
}
