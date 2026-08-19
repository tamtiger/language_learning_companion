import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

if (typeof URL.createObjectURL !== 'function') {
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: () => 'blob:test' })
}
if (typeof URL.revokeObjectURL !== 'function') {
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: () => undefined })
}

afterEach(() => cleanup())
