import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BookOpen, CalendarCheck, ChartNoAxesColumnIncreasing, Settings as SettingsIcon } from 'lucide-react'
import type { LessonEntry } from '../domain/progress/progress'
import { handleStorageEvent, useAppStore } from '../shared/hooks/useAppStore'
import { requestPersistentStorage } from '../infrastructure/storage/storageHealth'
import { confirmLeave } from '../shared/hooks/useUnsavedWork'
import { ErrorBoundary } from './ErrorBoundary'
import { ExportReminder } from './ExportReminder'
import { PersistenceBanner } from './PersistenceBanner'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { TodayPage } from '../features/today/TodayPage'

// Heavier views load on demand so the entry chunk stays small.
const ProgressPage = lazy(() => import('../features/progress/ProgressPage').then((module) => ({ default: module.ProgressPage })))
const LessonFlow = lazy(() => import('../features/lesson/LessonFlow').then((module) => ({ default: module.LessonFlow })))
const Settings = lazy(() => import('../features/settings/Settings').then((module) => ({ default: module.Settings })))

type Page = 'today' | 'catalog' | 'progress' | 'settings'

const NAV_ITEMS: Array<{ id: Page; label: string; icon: typeof BookOpen }> = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'catalog', label: 'Catalog', icon: BookOpen },
  { id: 'progress', label: 'Tiến bộ', icon: ChartNoAxesColumnIncreasing },
  { id: 'settings', label: 'Cài đặt', icon: SettingsIcon }
]

export default function App() {
  const [page, setPage] = useState<Page>('today')
  const mainRef = useRef<HTMLElement>(null)
  const lessons = useAppStore((state) => state.lessons)
  const activeLessonId = useAppStore((state) => state.activeLessonId)
  const setActiveLessonId = useAppStore((state) => state.setActiveLessonId)
  const contentErrors = useAppStore((state) => state.contentErrors)
  const persistence = useAppStore((state) => state.persistence)
  const [lessonEntry, setLessonEntry] = useState<LessonEntry | undefined>(undefined)
  const activeLesson = lessons.find((lesson) => lesson.lessonId === activeLessonId)
  const startLesson = (lessonId: string, entry?: LessonEntry) => {
    setLessonEntry(entry)
    setActiveLessonId(lessonId)
  }
  const navigationKey = `${page}:${activeLessonId ?? ''}`
  const previousNavigationKey = useRef(navigationKey)

  useEffect(() => {
    // Ask once, quietly: the browser may then keep this site's data when space runs low.
    void requestPersistentStorage()
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => { void handleStorageEvent(event) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (previousNavigationKey.current === navigationKey) return
    previousNavigationKey.current = navigationKey
    if (import.meta.env.MODE !== 'test') window.scrollTo?.({ top: 0, behavior: 'auto' })
    mainRef.current?.scrollTo?.({ top: 0, behavior: 'auto' })
    mainRef.current?.focus({ preventScroll: true })
    document.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest'
    })
  }, [navigationKey])

  const navigate = (nextPage: Page) => {
    if (!confirmLeave()) return
    setActiveLessonId(null)
    setPage(nextPage)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-3 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-zinc-950">
        Bỏ qua điều hướng
      </a>
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => navigate('today')} className="flex w-fit items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400">
            <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 font-black">E</span>
            <span className="text-left">
              <span className="block font-bold">English Companion</span>
              <span className="block text-xs text-zinc-400">Capability-first · local-only</span>
            </span>
          </button>
          <nav aria-label="Điều hướng chính" className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={!activeLesson && page === id ? 'page' : undefined}
                onClick={() => navigate(id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 ${!activeLesson && page === id ? 'bg-purple-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 focus:outline-none">
        <PersistenceBanner status={persistence.status} onOpenSettings={() => navigate('settings')} />
        <ExportReminder onOpenSettings={() => navigate('settings')} />
        {contentErrors.length > 0 && (
          <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Có {contentErrors.length} content file không hợp lệ. Catalog vẫn mở các lesson an toàn.
          </div>
        )}
        <ErrorBoundary onReset={() => { setActiveLessonId(null); setPage('today') }}>
          <Suspense fallback={<p role="status" className="text-zinc-400">Đang tải…</p>}>
            {activeLesson ? (
              <LessonFlow lesson={activeLesson} entry={lessonEntry} onBack={() => { if (confirmLeave()) setActiveLessonId(null) }} />
            ) : page === 'today' ? (
              <TodayPage onStartLesson={startLesson} />
            ) : page === 'catalog' ? (
              <CatalogPage onStartLesson={startLesson} />
            ) : page === 'progress' ? (
              <ProgressPage />
            ) : (
              <Settings />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>
      <footer className="border-t border-zinc-900 px-4 py-6 text-center text-xs text-zinc-400">
        Dữ liệu học tập được giữ local. Audio và nội dung trả lời không được persist hoặc upload.
      </footer>
    </div>
  )
}
