export type PersistState = 'persisted' | 'denied' | 'unsupported'

/** The part of navigator.storage this app uses; every method is optional because support varies. */
export interface StorageManagerLike {
  persist?: () => Promise<boolean>
  persisted?: () => Promise<boolean>
}

/** Separate from the progress data so the backup format and storage schema stay untouched. */
export const LAST_EXPORT_KEY = 'language-learning-companion-last-export'
export const LAST_EXPORT_EVENT = 'companion:last-export'
const OVERDUE_DAYS = 7
const DAY_MS = 86_400_000

function defaultStorageManager(): StorageManagerLike | undefined {
  return typeof navigator === 'undefined' ? undefined : (navigator.storage as StorageManagerLike | undefined)
}

/** Current protection state, read without prompting the user. */
export async function getPersistState(manager: StorageManagerLike | undefined = defaultStorageManager()): Promise<PersistState> {
  if (!manager?.persisted) return 'unsupported'
  try {
    return (await manager.persisted()) ? 'persisted' : 'denied'
  } catch {
    return 'denied'
  }
}

/** Asks the browser not to evict this site's data; returns what the browser decided. */
export async function requestPersistentStorage(manager: StorageManagerLike | undefined = defaultStorageManager()): Promise<PersistState> {
  if (!manager?.persist || !manager.persisted) return 'unsupported'
  try {
    if (await manager.persisted()) return 'persisted'
    return (await manager.persist()) ? 'persisted' : 'denied'
  } catch {
    return 'denied'
  }
}

function defaultStore(): Pick<Storage, 'getItem' | 'setItem'> | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

/** ISO time of the last exported backup, or null when none (or the value is unusable). */
export function getLastExportedAt(store: Pick<Storage, 'getItem'> | undefined = defaultStore()): string | null {
  try {
    const value = store?.getItem(LAST_EXPORT_KEY)
    return value && !Number.isNaN(Date.parse(value)) ? value : null
  } catch {
    return null
  }
}

export function setLastExportedAt(iso: string, store: Pick<Storage, 'setItem'> | undefined = defaultStore()): void {
  try {
    store?.setItem(LAST_EXPORT_KEY, iso)
  } catch {
    // A blocked store must not break exporting; the reminder simply keeps asking.
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(LAST_EXPORT_EVENT))
}

/** True when there is progress worth protecting and no backup in the last seven days. */
export function isExportOverdue(lastExportedAt: string | null, hasProgress: boolean, now: Date, days = OVERDUE_DAYS): boolean {
  if (!hasProgress) return false
  if (!lastExportedAt) return true
  return now.getTime() - Date.parse(lastExportedAt) >= days * DAY_MS
}
