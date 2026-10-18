import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  CalendarClock,
  CheckCircle2,
  Repeat,
  Timer,
  StickyNote,
  ArrowRight,
  Sparkles,
  Plus,
  CalendarDays,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { StatTile } from '@/components/ui/StatTile'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import {
  computeDailyStats,
  relevantTasksForDay,
  isHabitDoneOn,
  formatMinutes,
} from '@/lib/stats'
import { PRIORITY_META, habitIcon } from '@/lib/constants'
import { todayKey, formatLongDate, dueLabel, isOverdue } from '@/lib/date'
import { clsx } from '@/lib/clsx'
import type { Task } from '@/types'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)
  const notes = useStore((s) => s.notes)
  const sessions = useStore((s) => s.focusSessions)
  const toggleTask = useStore((s) => s.toggleTask)
  const toggleHabit = useStore((s) => s.toggleHabit)
  const seedSampleData = useStore((s) => s.seedSampleData)
  const { toast } = useToast()

  const today = todayKey()
  const daily = useMemo(() => computeDailyStats(tasks, habits, sessions), [tasks, habits, sessions])

  const todayTasks = useMemo(() => {
    const rank = (p: Task['priority']) => PRIORITY_META[p].order
    return relevantTasksForDay(tasks, today)
      .slice()
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return rank(a.priority) - rank(b.priority)
      })
  }, [tasks, today])

  const upcoming = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate && !t.completed && t.dueDate > today)
        .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
        .slice(0, 5),
    [tasks, today],
  )

  const recentNotes = useMemo(
    () =>
      notes
        .slice()
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return b.updatedAt.localeCompare(a.updatedAt)
        })
        .slice(0, 4),
    [notes],
  )

  const isEmpty = tasks.length === 0 && habits.length === 0 && notes.length === 0 && sessions.length === 0

  const progressSentence =
    daily.scheduledTotal === 0
      ? 'Nothing scheduled yet. Add a task or habit to plan your day.'
      : daily.completionPct === 100
        ? "Everything's done for today. Beautifully cleared."
        : `You're ${daily.completionPct}% through today's plan — keep going.`

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-content sm:text-3xl">{greeting()}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-content-muted">
          <CalendarDays className="h-4 w-4" />
          {formatLongDate()}
        </p>
      </div>

      {isEmpty ? (
        <WelcomePanel
          onSeed={() => {
            seedSampleData()
            toast('Loaded sample data')
          }}
        />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Hero: daily progress */}
          <div className="card overflow-hidden">
            <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:gap-8 sm:p-7">
              <ProgressRing value={daily.completionPct} size={132} stroke={12}>
                <span className="font-display text-3xl font-bold text-content">{daily.completionPct}%</span>
                <span className="text-[11px] text-content-subtle">done today</span>
              </ProgressRing>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="font-display text-lg font-semibold text-content">{progressSentence}</p>
                <p className="mt-1 text-sm text-content-muted">
                  {daily.scheduledDone} of {daily.scheduledTotal} planned items complete
                  {daily.focusMinutes > 0 && ` · ${formatMinutes(daily.focusMinutes)} focused`}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link to="/tasks?new=1" className="btn-primary h-9">
                    <Plus className="h-4 w-4" />
                    Add task
                  </Link>
                  <Link to="/focus" className="btn-subtle h-9">
                    <Timer className="h-4 w-4" />
                    Start focus
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              icon={CheckCircle2}
              label="Tasks today"
              value={`${daily.tasksDone}/${daily.tasksTotal}`}
              accent="text-emerald-500 bg-emerald-500/10"
            />
            <StatTile
              icon={Repeat}
              label="Habits today"
              value={`${daily.habitsDone}/${daily.habitsTotal}`}
              accent="text-amber-500 bg-amber-500/10"
            />
            <StatTile
              icon={Timer}
              label="Focus today"
              value={formatMinutes(daily.focusMinutes)}
              sub={`${daily.focusSessions} session${daily.focusSessions === 1 ? '' : 's'}`}
              accent="text-brand-500 bg-brand-500/10"
            />
            <StatTile
              icon={StickyNote}
              label="Notes"
              value={notes.length}
              accent="text-sky-500 bg-sky-500/10"
            />
          </div>

          {/* Two-column body */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DashCard title="Today's tasks" to="/tasks" icon={CheckCircle2}>
              {todayTasks.length === 0 ? (
                <EmptyHint text="No tasks due today. Enjoy the clear runway." />
              ) : (
                <ul className="flex flex-col gap-1">
                  {todayTasks.slice(0, 6).map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
                      <button
                        onClick={() => toggleTask(t.id)}
                        aria-label={t.completed ? 'Mark not done' : 'Mark done'}
                        className={clsx(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                          t.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-content-subtle/50 hover:border-brand-500',
                        )}
                      >
                        {t.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>
                      <span className={clsx('flex-1 truncate text-sm text-content', t.completed && 'text-content-subtle line-through')}>
                        {t.title}
                      </span>
                      {t.dueDate && (
                        <span
                          className={clsx(
                            'chip shrink-0',
                            isOverdue(t.dueDate, t.completed)
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-surface-2 text-content-subtle',
                          )}
                        >
                          {dueLabel(t.dueDate)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </DashCard>

            <DashCard title="Upcoming deadlines" to="/tasks" icon={CalendarClock}>
              {upcoming.length === 0 ? (
                <EmptyHint text="No upcoming deadlines. You're all caught up." />
              ) : (
                <ul className="flex flex-col gap-1">
                  {upcoming.map((t) => (
                    <li key={t.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
                      <span className={clsx('h-2 w-2 shrink-0 rounded-full', PRIORITY_META[t.priority].dot)} />
                      <span className="flex-1 truncate text-sm text-content">{t.title}</span>
                      <span className="chip shrink-0 bg-surface-2 text-content-subtle">{dueLabel(t.dueDate)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </DashCard>

            <DashCard title="Habits" to="/habits" icon={Repeat}>
              {habits.length === 0 ? (
                <EmptyHint text="No habits yet. Start building a streak." />
              ) : (
                <ul className="flex flex-col gap-1">
                  {habits.slice(0, 6).map((h) => {
                    const Icon = habitIcon(h.icon)
                    const done = isHabitDoneOn(h, today)
                    return (
                      <li key={h.id}>
                        <button
                          onClick={() => toggleHabit(h.id)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-surface-2"
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                            style={{ backgroundColor: `${h.color}22`, color: h.color }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1 truncate text-sm text-content">{h.name}</span>
                          <span
                            className={clsx(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                              done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-content-subtle/50',
                            )}
                          >
                            {done && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </DashCard>

            <DashCard title="Recent notes" to="/notes" icon={StickyNote}>
              {recentNotes.length === 0 ? (
                <EmptyHint text="No notes yet. Capture your first idea." />
              ) : (
                <ul className="flex flex-col gap-1">
                  {recentNotes.map((n) => (
                    <li key={n.id} className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5">
                      {n.pinned && <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-500" />}
                      <span className="flex-1 truncate text-sm text-content">{n.title}</span>
                      {n.tags[0] && <span className="chip shrink-0 bg-surface-2 text-content-subtle">#{n.tags[0]}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </DashCard>
          </div>
        </div>
      )}
    </div>
  )
}

function DashCard({
  title,
  to,
  icon: Icon,
  children,
}: {
  title: string
  to: string
  icon: typeof CheckCircle2
  children: React.ReactNode
}) {
  return (
    <div className="card flex flex-col p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-content">
          <Icon className="h-4 w-4 text-content-subtle" />
          {title}
        </h2>
        <Link to={to} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-border bg-surface-2/40 px-3 py-6 text-center text-sm text-content-subtle">{text}</p>
}

function WelcomePanel({ onSeed }: { onSeed: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-5 p-8 text-center sm:p-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
        <Sparkles className="h-8 w-8" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-content">Welcome to LifeDesk</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-content-muted">
          Your personal command center for tasks, habits, notes and focus. Add your first item, or load some sample data to
          explore what LifeDesk can do.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/tasks?new=1" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add your first task
        </Link>
        <Button variant="subtle" onClick={onSeed}>
          Load sample data
        </Button>
      </div>
    </div>
  )
}
