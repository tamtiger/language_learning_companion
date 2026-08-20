import { useEffect, useRef, useState } from 'react'
import { BookOpen, CalendarCheck, ChartNoAxesColumnIncreasing, Settings as SettingsIcon } from 'lucide-react'
import { useAppStore } from '../shared/hooks/use_app_store'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { TodayPage } from '../features/today/TodayPage'
import { ProgressPage } from '../features/progress/ProgressPage'
import { LessonFlow } from '../features/lesson/LessonFlow'
import { Settings } from '../features/settings/Settings'

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
  const { lessons, activeLessonId, setActiveLessonId, contentErrors } = useAppStore()
  const activeLesson = lessons.find((lesson) => lesson.lessonId === activeLessonId)
  const navigationKey = `${page}:${activeLessonId ?? ''}`
  const previousNavigationKey = useRef(navigationKey)

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
              <span className="block text-xs text-zinc-500">Capability-first · local-only</span>
            </span>
          </button>
          <nav aria-label="Điều hướng chính" className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={!activeLesson && page === id ? 'page' : undefined}
                onClick={() => navigate(id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 ${!activeLesson && page === id ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 focus:outline-none">
        {contentErrors.length > 0 && (
          <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            Có {contentErrors.length} content file không hợp lệ. Catalog vẫn mở các lesson an toàn.
          </div>
        )}
        {activeLesson ? (
          <LessonFlow lesson={activeLesson} onBack={() => setActiveLessonId(null)} />
        ) : page === 'today' ? (
          <TodayPage onStartLesson={setActiveLessonId} />
        ) : page === 'catalog' ? (
          <CatalogPage onStartLesson={setActiveLessonId} />
        ) : page === 'progress' ? (
          <ProgressPage />
        ) : (
          <Settings />
        )}
      </main>
      <footer className="border-t border-zinc-900 px-4 py-6 text-center text-xs text-zinc-500">
        Dữ liệu học tập được giữ local. Audio và nội dung trả lời không được persist hoặc upload.
      </footer>
    </div>
  )
}
