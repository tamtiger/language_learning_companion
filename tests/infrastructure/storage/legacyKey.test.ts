import { describe, expect, it } from 'vitest'
import { withLegacyKey } from '@/infrastructure/storage/legacyKey'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (name: string) => data.get(name) ?? null,
    setItem: (name: string, value: string) => { data.set(name, value) },
    removeItem: (name: string) => { data.delete(name) }
  }
}

describe('withLegacyKey', () => {
  it('reads the current key when it exists and leaves the legacy key alone', async () => {
    const base = memoryStorage({ new: 'current', old: 'legacy' })
    const storage = withLegacyKey(base, 'new', 'old')
    expect(await storage.getItem('new')).toBe('current')
    expect(base.data.get('old')).toBe('legacy')
  })

  it('falls back to the legacy key when the current key is empty', async () => {
    const base = memoryStorage({ old: 'legacy' })
    expect(await withLegacyKey(base, 'new', 'old').getItem('new')).toBe('legacy')
  })

  it('does not touch other keys', async () => {
    const base = memoryStorage({ old: 'legacy', other: 'x' })
    const storage = withLegacyKey(base, 'new', 'old')
    expect(await storage.getItem('other')).toBe('x')
  })

  it('writes the current key and removes the legacy key only after the write', async () => {
    const base = memoryStorage({ old: 'legacy' })
    const storage = withLegacyKey(base, 'new', 'old')
    await storage.setItem('new', 'updated')
    expect(base.data.get('new')).toBe('updated')
    expect(base.data.has('old')).toBe(false)
  })

  it('keeps the legacy data when writing the current key fails', async () => {
    const base = memoryStorage({ old: 'legacy' })
    base.setItem = () => { throw new Error('quota exceeded') }
    const storage = withLegacyKey(base, 'new', 'old')
    await expect(Promise.resolve().then(() => storage.setItem('new', 'updated'))).rejects.toThrow('quota')
    expect(base.data.get('old')).toBe('legacy')
  })

  it('removes both keys on removeItem for the current key', async () => {
    const base = memoryStorage({ new: 'a', old: 'b' })
    await withLegacyKey(base, 'new', 'old').removeItem('new')
    expect(base.data.size).toBe(0)
  })
})
