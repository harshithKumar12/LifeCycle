import type { LucideIcon } from 'lucide-react'
import { clsx } from '@/lib/clsx'

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  /** e.g. "text-emerald-500 bg-emerald-500/10" */
  accent?: string
}

export function StatTile({ icon: Icon, label, value, sub, accent = 'text-brand-500 bg-brand-500/10' }: StatTileProps) {
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-none text-content">{value}</p>
        <p className="mt-1 truncate text-xs text-content-muted">{label}</p>
        {sub && <p className="mt-0.5 truncate text-[11px] text-content-subtle">{sub}</p>}
      </div>
    </div>
  )
}
