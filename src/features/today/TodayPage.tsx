import {
  ArrowRight,
  AudioLines,
  BookOpenText,
  CalendarClock,
  ChevronDown,
  GraduationCap,
  MessageCircleQuestion,
  MessageSquareQuote,
  Network,
  RotateCcw,
  UsersRound,
  type LucideIcon
} from 'lucide-react'
import type { CapabilityId, CanonicalLesson } from '../../content/schema'
import { buildTodayQueue, type TodayQueueItem } from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { CAPABILITY_LABELS } from '../catalog/CatalogPage'

export interface TodayPageProps { onStartLesson: (lessonId: string) => void }

const KIND_LABEL = {
  review: 'Đến hạn ôn lại',
  resume: 'Tiếp tục',
  baseline: 'Lượt thử đầu tiên',
  new: 'Bài tiếp theo'
}

const PRIMARY_ACTION_LABEL = {
  review: 'Ôn lại ngay',
  resume: 'Tiếp tục bài đang dở',
  baseline: 'Bắt đầu lượt thử',
  new: 'Mở bài'
}

interface WorkIntent {
  capabilityId: CapabilityId
  label: string
  icon: LucideIcon
  iconClassName: string
}

const WORK_INTENTS: WorkIntent[] = [
  {
    capabilityId: 'international-meetings',
    label: 'Luyện standup hoặc meeting',
    icon: UsersRound,
    iconClassName: 'bg-cyan-500/15 text-cyan-300'
  },
  {
    capabilityId: 'workplace-communication',
    label: 'Viết cập nhật hoặc hỏi làm rõ',
    icon: MessageCircleQuestion,
    iconClassName: 'bg-emerald-500/15 text-emerald-300'
  },
  {
    capabilityId: 'technical-reading',
    label: 'Đọc docs hoặc logs',
    icon: BookOpenText,
    iconClassName: 'bg-amber-500/15 text-amber-300'
  },
  {
    capabilityId: 'technical-explanation',
    label: 'Giải thích thiết kế kỹ thuật',
    icon: Network,
    iconClassName: 'bg-sky-500/15 text-sky-300'
  },
  {
    capabilityId: 'international-interview',
    label: 'Chuẩn bị phỏng vấn',
    icon: GraduationCap,
    iconClassName: 'bg-rose-500/15 text-rose-300'
  },
  {
    capabilityId: 'technology-learning',
    label: 'Học công nghệ mới bằng tiếng Anh',
    icon: BookOpenText,
    iconClassName: 'bg-lime-500/15 text-lime-300'
  }
]

interface WorkIntentCandidate {
  intent: WorkIntent
  lesson: CanonicalLesson
  kind: TodayQueueItem['kind'] | 'repeat'
}

function buildWorkIntentCandidates(
  lessons: CanonicalLesson[],
  queue: TodayQueueItem[]
): WorkIntentCandidate[] {
  return WORK_INTENTS.flatMap((intent) => {
    const queueItem = queue.find((item) => item.capabilityId === intent.capabilityId)
    const lesson = queueItem
      ? lessons.find((candidate) => candidate.lessonId === queueItem.lessonId)
      : lessons.find((candidate) =>
          candidate.performanceTask && candidate.capabilities.includes(intent.capabilityId)
        )

    return lesson ? [{ intent, lesson, kind: queueItem?.kind ?? 'repeat' }] : []
  })
}

export function TodayPage({ onStartLesson }: TodayPageProps) {
  const { lessons, lessonProgress } = useAppStore()
  const queue = buildTodayQueue(lessons.map((lesson) => ({
    lessonId: lesson.lessonId,
    capabilityId: lesson.capabilities[0],
    hasPerformanceTask: lesson.performanceTask !== undefined
  })), lessonProgress, new Date())
  const actionable = queue.filter((item) =>
    item.kind !== 'new' || lessons.find((lesson) => lesson.lessonId === item.lessonId)?.performanceTask
  )
  const next = actionable[0]
  const nextLesson = lessons.find((lesson) => lesson.lessonId === next?.lessonId)
  const workIntentCandidates = buildWorkIntentCandidates(lessons, actionable)

  return (
    <section aria-labelledby="today-title" className="space-y-8 sm:space-y-10">
      <div className="border-b border-zinc-800 pb-6 sm:pb-8">
        <p className="text-sm font-bold uppercase text-cyan-300">15–20 phút · đúng việc bạn sắp làm</p>
        <h1 id="today-title" className="mt-2 max-w-3xl text-3xl font-black sm:text-4xl">Luyện việc thật hôm nay</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">Tiếp tục việc đang dở hoặc chọn tình huống bạn sắp dùng. Mỗi bài bắt đầu bằng một lượt thử thực tế.</p>

        {nextLesson && next ? (
          <div className="mt-5 grid gap-4 rounded-lg border border-purple-500/30 bg-zinc-900/70 p-4 sm:mt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-purple-300">
                <CalendarClock aria-hidden="true" className="h-4 w-4" />
                Nên làm tiếp · {KIND_LABEL[next.kind]}
                {next.capabilityId && <span className="text-zinc-400">· {CAPABILITY_LABELS[next.capabilityId]}</span>}
              </p>
              <h2 className="mt-2 text-xl font-bold">{nextLesson.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{nextLesson.summary}</p>
            </div>
            <button
              type="button"
              onClick={() => onStartLesson(nextLesson.lessonId)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-purple-500 px-5 py-3 font-bold text-white hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {PRIMARY_ACTION_LABEL[next.kind]} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-200">Lịch hôm nay đã hoàn tất. Bạn vẫn có thể chọn một tình huống bên dưới để luyện lại.</p>
        )}
      </div>

      <div aria-labelledby="work-intent-title">
        <div>
          <p className="text-sm font-bold text-cyan-300">Đường tắt theo công việc</p>
          <h2 id="work-intent-title" className="mt-1 text-2xl font-bold">Bạn cần luyện việc gì ngay?</h2>
        </div>

        <ul aria-label="Việc bạn cần luyện" className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3">
          {workIntentCandidates.map(({ intent, lesson, kind }) => {
            const Icon = intent.icon
            const task = lesson.performanceTask
            const hasSpokenSupport = task?.mode === 'spoken' && Boolean(task.learningLoop)
            const status = kind === 'repeat' ? 'Luyện lại' : KIND_LABEL[kind]

            return (
              <li key={intent.capabilityId}>
                <button
                  type="button"
                  onClick={() => onStartLesson(lesson.lessonId)}
                  className="group flex min-h-36 w-full flex-col rounded-lg border border-zinc-800 bg-zinc-900/35 p-4 text-left hover:border-cyan-500/60 hover:bg-zinc-900/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  <span className="flex w-full items-start gap-3">
                    <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${intent.iconClassName}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 font-bold leading-snug text-zinc-100">{intent.label}</span>
                    <ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-cyan-300" />
                  </span>
                  <span className="mt-3 block text-sm leading-snug text-zinc-400">{lesson.title}</span>
                  <span className="mt-auto flex flex-wrap gap-2 pt-3 text-xs font-semibold">
                    <span className="text-purple-300">{status}</span>
                    {hasSpokenSupport ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-cyan-200"><MessageSquareQuote aria-hidden="true" className="h-3.5 w-3.5" />Sentence chunks</span>
                        <span className="inline-flex items-center gap-1 text-amber-200"><AudioLines aria-hidden="true" className="h-3.5 w-3.5" />Luyện phát âm</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-200"><BookOpenText aria-hidden="true" className="h-3.5 w-3.5" />Viết đầu ra công việc</span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {actionable.length > 1 && (
        <details className="group border-t border-zinc-800 pt-6">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 font-bold text-zinc-300 hover:bg-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
            <span className="flex items-center gap-2"><RotateCcw aria-hidden="true" className="h-5 w-5 text-zinc-500" />{Math.min(actionable.length - 1, 6)} bài khác trong lịch luyện</span>
            <ChevronDown aria-hidden="true" className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {actionable.slice(1, 7).map((item) => {
              const lesson = lessons.find((candidate) => candidate.lessonId === item.lessonId)
              if (!lesson) return null
              return (
                <li key={item.lessonId}>
                  <button type="button" onClick={() => onStartLesson(item.lessonId)} className="min-h-20 w-full rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 text-left hover:border-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400">
                    <span className="text-xs font-bold text-purple-300">{KIND_LABEL[item.kind]}</span>
                    <span className="mt-1 block font-semibold">{lesson.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </details>
      )}
    </section>
  )
}
