import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { clsx } from '@/lib/clsx'
import { uid } from '@/lib/id'

type ToastKind = 'success' | 'error' | 'info'
interface Toast {
  id: string
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}
const ACCENT: Record<ToastKind, string> = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-brand-500',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, number>>({})

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    window.clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const toast = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = uid()
      setToasts((list) => [...list, { id, kind, message }])
      timers.current[id] = window.setTimeout(() => dismiss(id), 3200)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
          {toasts.map((t) => {
            const Icon = ICONS[t.kind]
            return (
              <div
                key={t.id}
                role="status"
                className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-card animate-fade-in"
              >
                <Icon className={clsx('h-5 w-5 shrink-0', ACCENT[t.kind])} />
                <p className="flex-1 text-sm text-content">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-content-subtle transition-colors hover:text-content"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
