import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Plus, Sun, Moon, CheckSquare, Repeat, StickyNote } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface TopbarProps {
  onOpenMenu: () => void
  onOpenSearch: () => void
}

export function Topbar({ onOpenMenu, onOpenSearch }: TopbarProps) {
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-bg/80 px-4 backdrop-blur-md sm:px-6">
      <button className="btn-ghost h-9 w-9 rounded-lg p-0 lg:hidden" onClick={onOpenMenu} aria-label="Open navigation menu">
        <Menu className="h-5 w-5" />
      </button>

      <button
        onClick={onOpenSearch}
        className="flex h-9 flex-1 items-center gap-2.5 rounded-lg border border-border bg-surface px-3 text-sm text-content-subtle transition-colors hover:border-brand-400 hover:text-content-muted sm:max-w-xs"
        aria-label="Open global search"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search everything…</span>
        <kbd className="hidden rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-content-subtle sm:inline">
          Ctrl K
        </kbd>
      </button>

      <div className="flex-1 sm:hidden" />

      <QuickAdd />

      <button
        onClick={toggleTheme}
        className="btn-ghost h-9 w-9 rounded-lg p-0"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>
    </header>
  )
}

function QuickAdd() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const items = [
    { label: 'New task', icon: CheckSquare, path: '/tasks?new=1' },
    { label: 'New habit', icon: Repeat, path: '/habits?new=1' },
    { label: 'New note', icon: StickyNote, path: '/notes?new=1' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button className="btn-primary h-9" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-40 w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-card animate-scale-in"
        >
          {items.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              role="menuitem"
              onClick={() => go(path)}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm text-content-muted transition-colors hover:bg-surface-2 hover:text-content"
            >
              <Icon className="h-4 w-4 text-content-subtle" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
