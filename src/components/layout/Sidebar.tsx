import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './nav'
import { clsx } from '@/lib/clsx'
import { useStore } from '@/store/useStore'
import { computeDailyStats } from '@/lib/stats'
import { ProgressRing } from '@/components/ui/ProgressRing'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)
  const sessions = useStore((s) => s.focusSessions)
  const stats = computeDailyStats(tasks, habits, sessions)

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
          <LogoMark />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-content">LifeDesk</p>
          <p className="text-xs text-content-subtle">Command center</p>
        </div>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300'
                  : 'text-content-muted hover:bg-surface-2 hover:text-content',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('h-[18px] w-[18px]', isActive && 'text-brand-500')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Today's progress — a quiet anchor at the base of the console. */}
      <div className="card mt-2 flex items-center gap-3 p-3">
        <ProgressRing value={stats.completionPct} size={52} stroke={6}>
          <span className="font-display text-xs font-semibold text-content">{stats.completionPct}%</span>
        </ProgressRing>
        <div className="leading-tight">
          <p className="text-xs font-medium text-content">Today's progress</p>
          <p className="text-xs text-content-subtle">
            {stats.scheduledDone} of {stats.scheduledTotal} done
          </p>
        </div>
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M4 6h12" opacity={0.95} />
      <path d="M4 12h9" opacity={0.7} />
      <path d="M4 18h6" opacity={0.5} />
    </svg>
  )
}
