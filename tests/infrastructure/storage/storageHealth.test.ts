import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LAST_EXPORT_KEY,
  getLastExportedAt,
  getPersistState,
  isExportOverdue,
  requestPersistentStorage,
  setLastExportedAt
} from '@/infrastructure/storage/storageHealth'

function memory(initial: Record<string, string> = {}): Pick<Storage, 'getItem' | 'setItem'> & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => { data[key] = value }
  }
}

describe('persistent storage', () => {
  it('reports unsupported when the browser has no storage manager', async () => {
    expect(await requestPersistentStorage(undefined)).toBe('unsupported')
    expect(await requestPersistentStorage({})).toBe('unsupported')
    expect(await getPersistState(undefined)).toBe('unsupported')
  })

  it('does not ask again when storage is already persistent', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    const state = await requestPersistentStorage({ persisted: async () => true, persist })

    expect(state).toBe('persisted')
    expect(persist).not.toHaveBeenCalled()
  })

  it('asks the browser and follows its answer', async () => {
    expect(await requestPersistentStorage({ persisted: async () => false, persist: async () => true })).toBe('persisted')
    expect(await requestPersistentStorage({ persisted: async () => false, persist: async () => false })).toBe('denied')
  })

  it('treats a throwing browser API as denied instead of failing the app', async () => {
    const state = await requestPersistentStorage({
      persisted: async () => false,
      persist: async () => { throw new Error('SecurityError') }
    })
    expect(state).toBe('denied')
  })

  it('reads the current state without prompting', async () => {
    const persist = vi.fn()
    expect(await getPersistState({ persisted: async () => true, persist })).toBe('persisted')
    expect(await getPersistState({ persisted: async () => false, persist })).toBe('denied')
    expect(persist).not.toHaveBeenCalled()
  })
})

describe('last export time', () => {
  afterEach(() => vi.restoreAllMocks())

  it('stores it under its own key, apart from the progress data', () => {
    const store = memory()
    setLastExportedAt('2026-08-18T10:00:00.000Z', store)

    expect(LAST_EXPORT_KEY).not.toBe('language-learning-companion-storage-v3')
    expect(store.data[LAST_EXPORT_KEY]).toBe('2026-08-18T10:00:00.000Z')
    expect(getLastExportedAt(store)).toBe('2026-08-18T10:00:00.000Z')
  })

  it('ignores a missing, garbled or non-date value', () => {
    expect(getLastExportedAt(memory())).toBeNull()
    expect(getLastExportedAt(memory({ [LAST_EXPORT_KEY]: 'yesterday' }))).toBeNull()
    expect(getLastExportedAt(memory({ [LAST_EXPORT_KEY]: '' }))).toBeNull()
  })

  it('never throws when storage is blocked', () => {
    const blocked = {
      getItem: () => { throw new DOMException('denied', 'SecurityError') },
      setItem: () => { throw new DOMException('full', 'QuotaExceededError') }
    }
    expect(getLastExportedAt(blocked)).toBeNull()
    expect(() => setLastExportedAt('2026-08-18T10:00:00.000Z', blocked)).not.toThrow()
  })
})

describe('isExportOverdue', () => {
  const now = new Date('2026-08-25T12:00:00.000Z')

  it('never nags when there is nothing to lose', () => {
    expect(isExportOverdue(null, false, now)).toBe(false)
    expect(isExportOverdue('2020-01-01T00:00:00.000Z', false, now)).toBe(false)
  })

  it('asks for a first export once there is progress', () => {
    expect(isExportOverdue(null, true, now)).toBe(true)
  })

  it('becomes overdue after seven days and not before', () => {
    expect(isExportOverdue('2026-08-18T12:00:01.000Z', true, now)).toBe(false)
    expect(isExportOverdue('2026-08-18T12:00:00.000Z', true, now)).toBe(true)
    expect(isExportOverdue('2026-08-01T00:00:00.000Z', true, now)).toBe(true)
  })

  it('treats a future timestamp as recent', () => {
    expect(isExportOverdue('2027-01-01T00:00:00.000Z', true, now)).toBe(false)
  })
})
