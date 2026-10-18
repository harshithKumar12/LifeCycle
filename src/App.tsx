import { useEffect, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { useHydrated } from '@/store/useHydrated'
import { AppLayout } from '@/components/layout/AppLayout'

// Route-level code splitting: each page is its own chunk, so the heavy
// charting library (recharts) only loads when the Statistics page is opened.
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })))
const TasksPage = lazy(() => import('@/features/tasks/TasksPage').then((m) => ({ default: m.TasksPage })))
const HabitsPage = lazy(() => import('@/features/habits/HabitsPage').then((m) => ({ default: m.HabitsPage })))
const NotesPage = lazy(() => import('@/features/notes/NotesPage').then((m) => ({ default: m.NotesPage })))
const FocusPage = lazy(() => import('@/features/focus/FocusPage').then((m) => ({ default: m.FocusPage })))
const StatsPage = lazy(() => import('@/features/stats/StatsPage').then((m) => ({ default: m.StatsPage })))
const NotFound = lazy(() => import('@/features/NotFound').then((m) => ({ default: m.NotFound })))

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
        <p className="text-sm text-content-subtle">{label}</p>
      </div>
    </div>
  )
}

export default function App() {
  const theme = useStore((s) => s.theme)
  const hydrated = useHydrated()

  // Reflect the theme onto <html> so Tailwind's `dark:` variants apply.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  if (!hydrated) {
    return <Spinner label="Loading your desk…" />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
