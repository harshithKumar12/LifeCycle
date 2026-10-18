import { useEffect, useState } from 'react'
import { useStore } from './useStore'

/**
 * True once the persisted store has been read back from localStorage. For
 * localStorage this is effectively synchronous, but gating on it prevents any
 * flash of empty state and models the loading phase honestly.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() => useStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useStore.persist.hasHydrated())
    return unsub
  }, [])

  return hydrated
}
