import { useEffect } from 'react'

const DEFAULT_LABEL = 'bản nháp hoặc bản ghi chưa lưu'
const unsaved = new Map<symbol, string>()

function onBeforeUnload(event: BeforeUnloadEvent): void {
  if (unsaved.size === 0) return
  event.preventDefault()
  // Some browsers still require a returnValue to show their own confirmation.
  event.returnValue = ''
}

function syncListener(): void {
  window.removeEventListener('beforeunload', onBeforeUnload)
  if (unsaved.size > 0) window.addEventListener('beforeunload', onBeforeUnload)
}

/** Registers work that would be lost on leaving: closing the tab is blocked while `active`. */
export function useUnsavedWork(active: boolean, label = DEFAULT_LABEL): void {
  useEffect(() => {
    if (!active) return
    const key = Symbol('unsaved-work')
    unsaved.set(key, label)
    syncListener()
    return () => {
      unsaved.delete(key)
      syncListener()
    }
  }, [active, label])
}

/** Asks before in-app navigation drops unsaved work; true when leaving is fine. */
export function confirmLeave(): boolean {
  if (unsaved.size === 0) return true
  const what = [...new Set(unsaved.values())].join(', ')
  return window.confirm(`Bạn có ${what}. Rời trang này sẽ làm mất chúng. Vẫn rời đi?`)
}
