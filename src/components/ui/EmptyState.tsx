import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  message: string
  action?: ReactNode
}

/** Shared empty state — an invitation to act, not just a shrug. */
export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/50 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-base font-semibold text-content">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-content-muted">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
