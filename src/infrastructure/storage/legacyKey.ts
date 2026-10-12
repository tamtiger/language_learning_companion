type MaybePromise<T> = T | Promise<T>

export interface RawStorage {
  getItem(name: string): MaybePromise<string | null>
  setItem(name: string, value: string): MaybePromise<unknown>
  removeItem(name: string): MaybePromise<unknown>
}

function isPromise<T>(value: MaybePromise<T>): value is Promise<T> {
  return typeof (value as { then?: unknown } | null)?.then === 'function'
}

function then<T, R>(value: MaybePromise<T>, next: (resolved: T) => MaybePromise<R>): MaybePromise<R> {
  return isPromise(value) ? value.then(next) : next(value)
}

/**
 * Moves stored progress from an older key to the current one without losing it: reads fall back to the
 * legacy key while the current key is empty, and the legacy key is removed only after the current key
 * was written successfully. Stays synchronous when the underlying storage is synchronous.
 */
export function withLegacyKey(storage: RawStorage, currentKey: string, legacyKey: string): RawStorage {
  return {
    getItem: (name) => then(storage.getItem(name), (value) =>
      value !== null || name !== currentKey ? value : storage.getItem(legacyKey)),
    setItem: (name, value) => then(storage.setItem(name, value), () =>
      name === currentKey ? storage.removeItem(legacyKey) : undefined),
    removeItem: (name) => then(storage.removeItem(name), () =>
      name === currentKey ? storage.removeItem(legacyKey) : undefined)
  }
}
