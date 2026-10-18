import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { clsx } from '@/lib/clsx'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string | null
  hint?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-500">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-content-subtle">{hint}</p>
      ) : null}
    </div>
  )
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function TextInput({ className, invalid, ...rest }, ref) {
    return <input ref={ref} className={clsx('input', invalid && 'border-rose-500 focus:ring-rose-500/40', className)} {...rest} />
  },
)

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function TextArea({ className, invalid, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={clsx('input resize-y', invalid && 'border-rose-500 focus:ring-rose-500/40', className)}
        {...rest}
      />
    )
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={clsx('input cursor-pointer appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  )
})
