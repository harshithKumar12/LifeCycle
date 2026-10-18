import { useEffect, useState, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { GlobalSearch } from '@/components/GlobalSearch'
import { clsx } from '@/lib/clsx'

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Global keyboard shortcut for search (Ctrl/Cmd + K).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className={clsx('fixed inset-0 z-40 lg:hidden', drawerOpen ? '' : 'pointer-events-none')}>
        <div
          className={clsx(
            'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity',
            drawerOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={clsx(
            'absolute left-0 top-0 h-full w-72 max-w-[85%] border-r border-border bg-surface shadow-card transition-transform',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            className="btn-ghost absolute right-2 top-3 h-9 w-9 rounded-lg p-0"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setDrawerOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-24" role="status" aria-label="Loading page">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-brand-500" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
