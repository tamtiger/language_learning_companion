import type { CapabilityId, PerformanceTaskV3 } from '../../content/schema'
import { assessTransfer, type EvidenceContract, type TransferReason } from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { CAPABILITY_LABELS } from '../catalog/CatalogPage'

const REASON_LABELS: Record<TransferReason, string> = {
  incomplete: 'Không phải transfer hoàn chỉnh',
  'rubric-not-rated': 'Rubric chưa được đánh giá đủ',
  'rubric-gap': 'Còn tiêu chí rubric chưa đạt',
  'used-vietnamese': 'Đã dùng tiếng Việt',
  'used-translation': 'Đã dùng công cụ dịch',
  'used-model-answer': 'Đã dùng model answer',
  'too-many-hints': 'Vượt số gợi ý cho phép',
  'too-short': 'Output ngắn hơn yêu cầu',
  'too-long': 'Output dài hơn yêu cầu',
  overtime: 'Vượt thời gian cho phép'
}

function evidenceContract(task: PerformanceTaskV3 | undefined): EvidenceContract {
  if (!task) return { maxHints: 0, timeLimitSeconds: Number.MAX_SAFE_INTEGER }
  return task.mode === 'spoken'
    ? {
        maxHints: task.independenceContract.maxHints,
        timeLimitSeconds: task.outputContract.timeLimitSeconds,
        targetSeconds: task.outputContract.targetSeconds
      }
    : {
        maxHints: task.independenceContract.maxHints,
        timeLimitSeconds: task.outputContract.timeLimitSeconds,
        minWords: task.outputContract.minWords,
        maxWords: task.outputContract.maxWords
      }
}

export function ProgressPage() {
  const { lessonProgress, lessons } = useAppStore()
  const attempts = Object.values(lessonProgress).flatMap((progress) => progress.recentAttempts)
  const tasksByLesson = new Map(lessons.map((lesson) => [lesson.lessonId, lesson.performanceTask]))
  const ids = Object.keys(CAPABILITY_LABELS) as CapabilityId[]

  return (
    <section aria-labelledby="progress-title" className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-purple-400">Observed evidence</p>
        <h1 id="progress-title" className="mt-2 text-3xl font-black">Tiến bộ theo capability</h1>
        <p className="mt-2 text-zinc-400">Không có điểm năng lực bí ẩn—chỉ hiển thị evidence đã quan sát.</p>
        <p className="mt-2 text-sm text-zinc-500">Transfer đạt khi rubric đạt đủ, output đúng độ dài/thời gian và lượt làm đáp ứng hợp đồng độc lập của mission.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ids.map((id) => {
          const capabilityAttempts = attempts.filter((attempt) => attempt.capabilityId === id)
          const transfers = capabilityAttempts.filter((attempt) => attempt.phase === 'transfer')
          const assessments = transfers.map((attempt) => ({
            attempt,
            assessment: assessTransfer(attempt, evidenceContract(tasksByLesson.get(attempt.lessonId)))
          }))
          return (
            <article key={id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h2 className="text-lg font-bold">{CAPABILITY_LABELS[id]}</h2>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div><dt className="text-xs text-zinc-500">Attempts</dt><dd className="mt-1 text-2xl font-black">{capabilityAttempts.length}</dd></div>
                <div><dt className="text-xs text-zinc-500">Transfer attempts</dt><dd className="mt-1 text-2xl font-black">{transfers.length}</dd></div>
                <div><dt className="text-xs text-zinc-500">Transfer đạt</dt><dd className="mt-1 text-2xl font-black">{assessments.filter(({ assessment }) => assessment.qualifies).length}</dd></div>
              </dl>
              {assessments.length > 0 && (
                <ul aria-label={`Chi tiết transfer ${CAPABILITY_LABELS[id]}`} className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
                  {assessments.slice(-3).reverse().map(({ attempt, assessment }) => (
                    <li key={attempt.attemptId} className="rounded-xl bg-zinc-950/60 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className={assessment.qualifies ? 'font-bold text-green-300' : 'font-bold text-amber-300'}>{assessment.qualifies ? 'Đạt hợp đồng' : 'Chưa đạt'}</span>
                        <span className="text-zinc-500">{attempt.durationSeconds}s{attempt.wordCount === null ? '' : ` · ${attempt.wordCount} từ`}</span>
                      </div>
                      {!assessment.qualifies && <p className="mt-2 text-zinc-400">{assessment.reasons.map((reason) => REASON_LABELS[reason]).join(' · ')}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
      </div>
      <details className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <summary className="cursor-pointer font-bold">Glossary: cách đọc learning loop</summary>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="font-bold text-purple-300">Baseline</dt><dd className="text-zinc-400">Lượt làm đầu tiên trước khi xem input hoặc model.</dd></div>
          <div><dt className="font-bold text-purple-300">Retry</dt><dd className="text-zinc-400">Lượt sửa có trọng tâm sau self-feedback.</dd></div>
          <div><dt className="font-bold text-purple-300">Transfer</dt><dd className="text-zinc-400">Áp dụng kỹ năng vào tình huống mới.</dd></div>
          <div><dt className="font-bold text-purple-300">Qualifying</dt><dd className="text-zinc-400">Transfer đáp ứng rubric, độ dài/thời gian và mức độc lập.</dd></div>
          <div><dt className="font-bold text-purple-300">Review</dt><dd className="text-zinc-400">Lượt kiểm tra lại theo lịch để củng cố khả năng dùng độc lập.</dd></div>
        </dl>
      </details>
    </section>
  )
}
