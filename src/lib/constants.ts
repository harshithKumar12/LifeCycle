import {
  Dumbbell,
  BookOpen,
  Code2,
  Droplet,
  GraduationCap,
  Heart,
  Sun,
  Moon,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import type { HabitIcon, Priority } from '@/types'

// Validated categorical palette (see dataviz validator: all CVD checks pass).
// Colors are always paired with an icon + name in the UI, never color-alone.
export const HABIT_COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#0ea5e9', // sky
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
] as const

export const HABIT_ICONS: { id: HabitIcon; label: string; Icon: LucideIcon }[] = [
  { id: 'dumbbell', label: 'Exercise', Icon: Dumbbell },
  { id: 'book', label: 'Reading', Icon: BookOpen },
  { id: 'code', label: 'Coding', Icon: Code2 },
  { id: 'droplet', label: 'Water', Icon: Droplet },
  { id: 'graduation', label: 'Studying', Icon: GraduationCap },
  { id: 'heart', label: 'Health', Icon: Heart },
  { id: 'sun', label: 'Morning', Icon: Sun },
  { id: 'moon', label: 'Evening', Icon: Moon },
  { id: 'sparkles', label: 'Habit', Icon: Sparkles },
  { id: 'target', label: 'Goal', Icon: Target },
]

const ICON_MAP: Record<HabitIcon, LucideIcon> = HABIT_ICONS.reduce(
  (acc, { id, Icon }) => {
    acc[id] = Icon
    return acc
  },
  {} as Record<HabitIcon, LucideIcon>,
)

export function habitIcon(id: HabitIcon): LucideIcon {
  return ICON_MAP[id] ?? Sparkles
}

// Priority display metadata. Color encodes urgency (info, not decoration).
export const PRIORITY_META: Record<
  Priority,
  { label: string; dot: string; chip: string; order: number }
> = {
  high: {
    label: 'High',
    dot: 'bg-rose-500',
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    order: 0,
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    order: 1,
  },
  low: {
    label: 'Low',
    dot: 'bg-sky-500',
    chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    order: 2,
  },
}

// Chart hues (single-series magnitude charts each use one hue).
export const CHART = {
  tasks: '#10b981',
  habits: '#f59e0b',
  focus: '#6366f1',
  grid: 'rgb(var(--c-border))',
}
