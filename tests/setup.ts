import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

if (typeof URL.createObjectURL !== 'function') {
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: () => 'blob:test' })
}
if (typeof URL.revokeObjectURL !== 'function') {
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => undefined })
}

// Node 25 exposes its own global localStorage/sessionStorage. Without --localstorage-file it has no
// working setItem and shadows the jsdom implementation, so install an in-memory Storage when needed.
function isWorkingStorage(storage: Storage | undefined): boolean {
  try {
    if (!storage) return false
    storage.setItem('__storage_probe__', '1')
    storage.removeItem('__storage_probe__')
    return true
  } catch {
    return false
  }
}

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>()
  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(String(key)) ?? null,
    key: (index) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key) => {
      entries.delete(String(key))
    },
    setItem: (key, value) => {
      entries.set(String(key), String(value))
    }
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (!isWorkingStorage(globalThis[name])) {
    const value = createMemoryStorage()
    Object.defineProperty(globalThis, name, { configurable: true, value })
    if (typeof window !== 'undefined' && window !== globalThis) {
      Object.defineProperty(window, name, { configurable: true, value })
    }
  }
}

afterEach(() => cleanup())
