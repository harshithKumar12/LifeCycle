import { clsx } from '@/lib/clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'subtle' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const VARIANT: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  subtle: 'btn-subtle',
  danger: 'btn-danger',
}

const SIZE: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: '',
}

export function Button({
  variant = 'subtle',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={clsx(VARIANT[variant], SIZE[size], className)} {...rest}>
      {children}
    </button>
  )
}
