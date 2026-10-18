import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/** Catches render-time errors anywhere below and shows a recoverable error state. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging; in a real app this would go to a logger.
    console.error('LifeDesk crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="card max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="font-display text-lg font-semibold text-content">Something went wrong</h1>
            <p className="mt-2 text-sm text-content-muted">
              LifeDesk hit an unexpected error. Your saved data is safe — reloading usually fixes it.
            </p>
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-surface-2 p-3 text-left text-xs text-content-subtle">
              {this.state.error.message}
            </pre>
            <button className="btn-primary mt-5 w-full" onClick={() => window.location.reload()}>
              Reload LifeDesk
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
