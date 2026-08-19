import { ArrowRight, CalendarClock, RotateCcw } from 'lucide-react'
import { buildTodayQueue } from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { CAPABILITY_LABELS } from '../catalog/CatalogPage'

export interface TodayPageProps { onStartLesson: (lessonId: string) => void }

const KIND_LABEL = { review: 'Đến hạn review', resume: 'Tiếp tục', baseline: 'Baseline', new: 'Bài tiếp theo' }

export function TodayPage({ onStartLesson }: TodayPageProps) {
  const { lessons, lessonProgress } = useAppStore()
  const queue = buildTodayQueue(lessons.map((lesson) => ({
    lessonId: lesson.lessonId,
    capabilityId: lesson.capabilities[0],
    hasPerformanceTask: lesson.performanceTask !== undefined
  })), lessonProgress, new Date())
  const actionable = queue.filter((item) => item.kind !== 'new' || lessons.find((lesson) => lesson.lessonId === item.lessonId)?.performanceTask)
  const next = actionable[0]
  const nextLesson = lessons.find((lesson) => lesson.lessonId === next?.lessonId)

  return (
    <section aria-labelledby="today-title" className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/70 via-zinc-900 to-zinc-950 p-6 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-300">Today · one next action</p>
        <h1 id="today-title" className="mt-3 max-w-3xl text-3xl font-black sm:text-5xl">Luyện việc thật hôm nay</h1>
        <p className="mt-4 max-w-2xl text-zinc-300">Ưu tiên review đến hạn, learning loop đang dở và capability chưa có baseline.</p>
        {nextLesson ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
              <CalendarClock aria-hidden="true" className="h-4 w-4" />{KIND_LABEL[next.kind]}
              {next.capabilityId && <span>· {CAPABILITY_LABELS[next.capabilityId]}</span>}
            </div>
            <h2 className="mt-3 text-2xl font-bold">{nextLesson.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{nextLesson.summary}</p>
            <button type="button" onClick={() => onStartLesson(nextLesson.lessonId)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-3 font-bold text-white hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {next.kind === 'resume' ? 'Tiếp tục learning loop' : next.kind === 'review' ? 'Làm review' : 'Bắt đầu baseline'} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : <p className="mt-8 text-green-300">Queue hôm nay đã hoàn tất.</p>}
      </div>
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold"><RotateCcw aria-hidden="true" className="h-5 w-5 text-purple-400" />Queue tiếp theo</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {actionable.slice(1, 7).map((item) => {
            const lesson = lessons.find((candidate) => candidate.lessonId === item.lessonId)
            if (!lesson) return null
            return <li key={item.lessonId}><button type="button" onClick={() => onStartLesson(item.lessonId)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-left hover:border-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"><span className="text-xs font-bold text-purple-400">{KIND_LABEL[item.kind]}</span><span className="mt-1 block font-semibold">{lesson.title}</span></button></li>
          })}
        </ol>
      </div>
    </section>
  )
}
