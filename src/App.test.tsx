import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'
import { useStore } from '@/store/useStore'

function renderApp(initialEntries: string[] = ['/']) {
  return render(
    <ErrorBoundary>
      <MemoryRouter initialEntries={initialEntries}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    </ErrorBoundary>,
  )
}

beforeEach(() => {
  useStore.getState().resetAll()
})

describe('App integration', () => {
  it('shows the welcome/empty state on a fresh dashboard', async () => {
    renderApp(['/'])
    // Greeting header renders (time-of-day dependent)
    expect(await screen.findByText(/Good (morning|afternoon|evening)/)).toBeInTheDocument()
    // Empty-state onboarding panel
    expect(await screen.findByText(/Welcome to LifeDesk/i)).toBeInTheDocument()
  })

  it('loads sample data from the dashboard and renders real content', async () => {
    renderApp(['/'])
    const loadBtn = await screen.findByRole('button', { name: /load sample data/i })
    fireEvent.click(loadBtn)

    // A seeded task appears in "Today's tasks"
    expect(await screen.findByText('Plan the week')).toBeInTheDocument()
    // The welcome panel is gone now that data exists
    expect(screen.queryByText(/Welcome to LifeDesk/i)).not.toBeInTheDocument()
  })

  it('renders the Tasks route with seeded data (lazy route loads)', async () => {
    useStore.getState().seedSampleData()
    renderApp(['/tasks'])
    expect(await screen.findByText('Plan the week')).toBeInTheDocument()
  })

  it('toggles a habit done from the dashboard', async () => {
    useStore.getState().seedSampleData()
    renderApp(['/'])

    // Find the "Habits" dashboard card and toggle the first habit within it.
    const heading = await screen.findByRole('heading', { name: 'Habits' })
    const card = heading.closest('div')!.parentElement as HTMLElement
    const firstHabitButton = within(card).getAllByRole('button')[0]

    const habitId = useStore.getState().habits[0].id
    const before = useStore.getState().habits[0].completedDates.length
    fireEvent.click(firstHabitButton)
    const after = useStore.getState().habits.find((h) => h.id === habitId)!.completedDates.length

    expect(after).not.toBe(before)
  })
})
