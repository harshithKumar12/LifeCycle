import type { ReactNode } from 'react'
import { clsx } from '@/lib/clsx'

interface ProgressRingProps {
  /** 0..100 */
  value: number
  size?: number
  stroke?: number
  className?: string
  trackClassName?: string
  /** Tailwind text color class applied to the progress arc (uses currentColor). */
  colorClassName?: string
  children?: ReactNode
}

export function ProgressRing({
  value,
  size = 160,
  stroke = 12,
  className,
  trackClassName = 'text-border',
  colorClassName = 'text-brand-500',
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${Math.round(clamped)} percent complete`}>
        <circle
          className={trackClassName}
          stroke="currentColor"
          fill="none"
          strokeWidth={stroke}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={clsx(colorClassName, 'transition-[stroke-dashoffset] duration-700 ease-out')}
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>}
    </div>
  )
}
