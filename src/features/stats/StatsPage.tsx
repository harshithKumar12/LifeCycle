import { useMemo, useState } from 'react'
import { CheckCircle2, Repeat, Timer, TrendingUp, BarChart3, Flame } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { Segmented } from '@/components/ui/Segmented'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { TrendChart, type TrendDatum } from './TrendChart'
import {
  computeDailyStats,
  tasksCompletedOn,
  currentStreak,
  longestStreak,
  countCompletedIn,
  formatMinutes,
} from '@/lib/stats'
import { lastNDays, weekdayShort, formatShortDate, dayKey, fromDayKey } from '@/lib/date'
import { habitIcon, CHART } from '@/lib/constants'

type Range = '7' | '14' | '30'

export function StatsPage() {
  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)
  const sessions = useStore((s) => s.focusSessions)
  const seedSampleData = useStore((s) => s.seedSampleData)
  const { toast } = useToast()

  const [range, setRange] = useState<Range>('7')
  const days = useMemo(() => lastNDays(Number(range)), [range])

  const daily = useMemo(() => computeDailyStats(tasks, habits, sessions), [tasks, habits, sessions])

  const label = (d: string) => (Number(range) <= 7 ? weekdayShort(d) : formatShortDate(d))
  const xInterval = Math.max(0, Math.round(Number(range) / 7) - 1)

  const tasksData: TrendDatum[] = useMemo(
    () => days.map((d) => ({ label: label(d), value: tasksCompletedOn(tasks, d).length })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, tasks],
  )

  const habitsData: TrendDatum[] = useMemo(
    () => days.map((d) => ({ label: label(d), value: habits.filter((h) => h.completedDates.includes(d)).length })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, habits],
  )

  const focusData: TrendDatum[] = useMemo(
    () =>
      days.map((d) => ({
        label: label(d),
        value: sessions
          .filter((s) => dayKey(fromDayKey(s.completedAt.slice(0, 10))) === d)
          .reduce((sum, s) => sum + s.durationMin, 0),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, sessions],
  )

  const rangeTotals = useMemo(
    () => ({
      tasks: tasksData.reduce((s, d) => s + d.value, 0),
      habits: habitsData.reduce((s, d) => s + d.value, 0),
      focusMin: focusData.reduce((s, d) => s + d.value, 0),
    }),
    [tasksData, habitsData, focusData],
  )

  const hasAnyData = tasks.length > 0 || habits.length > 0 || sessions.length > 0

  if (!hasAnyData) {
    return (
      <div>
        <PageHeader title="Statistics" description="Track your productivity over time." />
        <EmptyState
          icon={BarChart3}
          title="No data to chart yet"
          message="Add some tasks, habits, or focus sessions and your statistics will appear here."
          action={
            <Button
              variant="primary"
              onClick={() => {
                seedSampleData()
                toast('Loaded sample data')
              }}
            >
              Load sample data
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Statistics"
        description="Today's snapshot and your recent trends."
        actions={
          <Segmented<Range>
            ariaLabel="Trend range"
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: '7 days' },
              { value: '14', label: '14 days' },
              { value: '30', label: '30 days' },
            ]}
          />
        }
      />

      {/* Today */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={CheckCircle2}
          label="Tasks completed today"
          value={tasksCompletedOn(tasks, days[days.length - 1]).length}
          accent="text-emerald-500 bg-emerald-500/10"
        />
        <StatTile
          icon={Repeat}
          label="Habits completed today"
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
          icon={TrendingUp}
          label="Productivity today"
          value={`${daily.completionPct}%`}
          sub={`${daily.scheduledDone}/${daily.scheduledTotal} planned items`}
          accent="text-sky-500 bg-sky-500/10"
        />
      </div>

      {/* Trends */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Tasks completed" total={`${rangeTotals.tasks} total`}>
          <TrendChart data={tasksData} color={CHART.tasks} unit="tasks" xInterval={xInterval} />
        </ChartCard>
        <ChartCard title="Habits completed" total={`${rangeTotals.habits} total`}>
          <TrendChart data={habitsData} color={CHART.habits} unit="habits" xInterval={xInterval} />
        </ChartCard>
        <ChartCard title="Focus minutes" total={formatMinutes(rangeTotals.focusMin)}>
          <TrendChart data={focusData} color={CHART.focus} unit="min" minMax={25} xInterval={xInterval} />
        </ChartCard>
      </div>

      {/* Habit consistency */}
      {habits.length > 0 && (
        <div className="mt-5">
          <h2 className="mb-3 font-display text-sm font-semibold text-content">Habit consistency</h2>
          <div className="card divide-y divide-border">
            {habits.map((h) => {
              const Icon = habitIcon(h.icon)
              const done = countCompletedIn(h.completedDates, days)
              const rate = Math.round((done / days.length) * 100)
              const streak = currentStreak(h.completedDates)
              const best = longestStreak(h.completedDates)
              return (
                <div key={h.id} className="flex items-center gap-4 p-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${h.color}22`, color: h.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-content">{h.name}</p>
                      <p className="shrink-0 text-xs text-content-muted">
                        {done}/{days.length} days · {rate}%
                      </p>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: h.color }} />
                    </div>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1 text-xs text-content-muted sm:flex">
                    <Flame className={streak > 0 ? 'h-3.5 w-3.5 text-amber-500' : 'h-3.5 w-3.5 text-content-subtle'} />
                    {streak}d · best {best}d
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, total, children }: { title: string; total: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
        <span className="text-xs text-content-subtle">{total}</span>
      </div>
      {children}
    </div>
  )
}
