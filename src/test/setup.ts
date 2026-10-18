import '@testing-library/jest-dom'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Lazy route chunks can take longer than Testing Library's 1-second default
// while Vitest transforms the source modules. Keep the integration tests
// bounded, but allow the real route to finish loading before asserting on it.
configure({ asyncUtilTimeout: 10_000 })

// Keep integration tests isolated when Vitest runs in a single worker.
afterEach(() => cleanup())

// jsdom under Node can expose a broken experimental `localStorage` (see the
// "--localstorage-file" warning) whose methods are not callable. Install a
// clean in-memory Storage so zustand's persist middleware works in tests.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length() {
    return this.store.size
  }
  clear() {
    this.store.clear()
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }
  removeItem(key: string) {
    this.store.delete(key)
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

const memory = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { value: memory, configurable: true, writable: true })
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: memory, configurable: true, writable: true })
}
