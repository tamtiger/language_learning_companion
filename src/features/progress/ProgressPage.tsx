import type { CapabilityId } from '../../content/schema'
import { isQualifyingTransfer } from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { CAPABILITY_LABELS } from '../catalog/CatalogPage'

export function ProgressPage() {
  const { lessonProgress, lessons } = useAppStore()
  const capabilities = Object.values(lessonProgress).flatMap((progress) => progress.recentAttempts)
  const maxHintsByLesson = new Map(
    lessons.map((lesson) => [
      lesson.lessonId,
      lesson.performanceTask?.independenceContract.maxHints ?? 0
    ])
  )
  const ids = Object.keys(CAPABILITY_LABELS) as CapabilityId[]

  return (
    <section aria-labelledby="progress-title" className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-purple-400">
          Observed evidence
        </p>
        <h1 id="progress-title" className="mt-2 text-3xl font-black">
          Tiến bộ theo capability
        </h1>
        <p className="mt-2 text-zinc-400">
          Không có điểm năng lực bí ẩn—chỉ hiển thị evidence đã quan sát.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Transfer đạt = toàn bộ rubric đạt, hoàn thành độc lập, không vượt giới hạn
          gợi ý của task và không dùng tiếng Việt, bản dịch hoặc model answer.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ids.map((id) => {
          const attempts = capabilities.filter((attempt) => attempt.capabilityId === id)
          const transfers = attempts.filter((attempt) => attempt.phase === 'transfer').length
          const qualifyingTransfers = attempts.filter((attempt) => isQualifyingTransfer(
            attempt,
            maxHintsByLesson.get(attempt.lessonId) ?? 0
          )).length
          return (
            <article key={id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h2 className="text-lg font-bold">{CAPABILITY_LABELS[id]}</h2>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <dt className="text-xs text-zinc-500">Attempts</dt>
                  <dd className="mt-1 text-2xl font-black">{attempts.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Transfer attempts</dt>
                  <dd className="mt-1 text-2xl font-black">{transfers}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Transfer đạt</dt>
                  <dd className="mt-1 text-2xl font-black">{qualifyingTransfers}</dd>
                </div>
              </dl>
            </article>
          )
        })}
      </div>
    </section>
  )
}
