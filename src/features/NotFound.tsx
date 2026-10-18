import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="font-display text-2xl font-bold text-content">Page not found</h1>
      <p className="mt-2 text-sm text-content-muted">That corner of your desk doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to dashboard
      </Link>
    </div>
  )
}
