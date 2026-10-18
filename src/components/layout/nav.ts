import { LayoutDashboard, CheckSquare, Repeat, StickyNote, Timer, BarChart3, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/stats', label: 'Statistics', icon: BarChart3 },
]
