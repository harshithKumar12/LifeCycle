import { useMemo, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Timer, Coffee, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Field, TextInput } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { usePomodoro, type Phase } from './usePomodoro'
import { dayKey, fromDayKey, formatTime, todayKey } from '@/lib/date'
import { formatMinutes } from '@/lib/stats'
import { clsx } from '@/lib/clsx'

const PHASE_META: Record<Phase, { label: string; color: string; ring: string }> = {
  work: { label: 'Focus', color: 'text-brand-500', ring: 'text-brand-500' },
  break: { label: 'Short break', color: 'text-emerald-500', ring: 'text-emerald-500' },
  longBreak: { label: 'Long break', color: 'text-sky-500', ring: 'text-sky-500' },
}

function fmt(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ding() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
    osc.onended = () => ctx.close()
  } catch {
    /* audio not available — silent fallback */
  }
}

export function FocusPage() {
  const settings = useStore((s) => s.focusSettings)
  const updateFocusSettings = useStore((s) => s.updateFocusSettings)
  const addFocusSession = useStore((s) => s.addFocusSession)
  const sessions = useStore((s) => s.focusSessions)
  const { toast } = useToast()

  const [label, setLabel] = useState('')

  const pomo = usePomodoro({
    settings,
    onWorkComplete: (durationMin) => {
      addFocusSession({ durationMin, label })
      toast(`Focus session logged (${durationMin} min)`)
    },
    onPhaseComplete: () => ding(),
  })

  const meta = PHASE_META[pomo.phase]
  const progress = pomo.totalMs > 0 ? ((pomo.totalMs - pomo.remainingMs) / pomo.totalMs) * 100 : 0

  const today = todayKey()
  const todaySessions = useMemo(
    () => sessions.filter((s) => dayKey(fromDayKey(s.completedAt.slice(0, 10))) === today),
    [sessions, today],
  )
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMin, 0)

  return (
    <div>
      <PageHeader title="Focus" description="Work in focused sprints with the Pomodoro technique." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Timer */}
        <div className="card flex flex-col items-center gap-6 p-6 sm:p-8">
          <div
            className={clsx(
              'chip gap-1.5 text-sm',
              pomo.phase === 'work' ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            )}
          >
            {pomo.phase === 'work' ? <Timer className="h-3.5 w-3.5" /> : <Coffee className="h-3.5 w-3.5" />}
            {meta.label}
          </div>

          <ProgressRing value={progress} size={240} stroke={14} colorClassName={meta.ring}>
            <span className="font-display text-5xl font-bold tabular-nums text-content">{fmt(pomo.remainingMs)}</span>
            <span className="mt-1 text-sm text-content-subtle">
              {pomo.running ? 'In progress' : pomo.remainingMs === pomo.totalMs ? 'Ready' : 'Paused'}
            </span>
          </ProgressRing>

          <div className="flex items-center gap-2">
            {pomo.running ? (
              <Button variant="primary" onClick={pomo.pause} className="w-32">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button variant="primary" onClick={pomo.start} className="w-32">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            <Button variant="subtle" onClick={pomo.reset} aria-label="Reset timer">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button variant="ghost" onClick={pomo.skip} aria-label="Skip to next phase">
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
          </div>

          <div className="w-full max-w-sm">
            <Field label="What are you focusing on?" htmlFor="focus-label" hint="Optional — attached to logged sessions">
              <TextInput
                id="focus-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Write report, Study chapter 4"
                maxLength={60}
              />
            </Field>
          </div>
        </div>

        {/* Settings + today */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h2 className="font-display text-sm font-semibold text-content">Durations</h2>
            <p className="mt-0.5 text-xs text-content-muted">Customize your intervals (minutes).</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberField
                label="Focus"
                value={settings.workMin}
                min={1}
                max={180}
                onChange={(v) => updateFocusSettings({ workMin: v })}
              />
              <NumberField
                label="Short break"
                value={settings.breakMin}
                min={1}
                max={60}
                onChange={(v) => updateFocusSettings({ breakMin: v })}
              />
              <NumberField
                label="Long break"
                value={settings.longBreakMin}
                min={1}
                max={90}
                onChange={(v) => updateFocusSettings({ longBreakMin: v })}
              />
              <NumberField
                label="Sessions / long break"
                value={settings.sessionsBeforeLongBreak}
                min={2}
                max={12}
                onChange={(v) => updateFocusSettings({ sessionsBeforeLongBreak: v })}
              />
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-content">Today</h2>
              <span className="text-xs text-content-muted">
                {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} · {formatMinutes(todayMinutes)}
              </span>
            </div>
            {todaySessions.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed border-border bg-surface-2/50 px-3 py-6 text-center text-sm text-content-subtle">
                No focus sessions yet today. Start the timer to log your first one.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {todaySessions.slice(0, 8).map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
                      <Check className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-content">{s.label || 'Focus session'}</p>
                      <p className="text-xs text-content-subtle">{formatTime(s.completedAt)}</p>
                    </div>
                    <span className="text-xs font-medium text-content-muted">{s.durationMin}m</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-content-muted">{label}</span>
      <input
        type="number"
        className="input"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(n)
        }}
      />
    </label>
  )
}
