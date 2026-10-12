import type { CanonicalLesson, CapabilityId } from '../../content/schema'
import { buildEvidenceContract, contractRevision } from '../../domain/progress/evidenceContract'
import type { AttemptEvidence, TransferReason } from '../../domain/progress/progress'
import { summarizeListeningReading, type ListeningReadingGroup } from '../../domain/progress/listeningReading'
import { useAppStore } from '../../shared/hooks/useAppStore'
import { CAPABILITY_LABELS } from '../catalog/CatalogPage'

const REASON_LABELS: Record<TransferReason, string> = {
  incomplete: 'Không phải transfer hoàn chỉnh',
  'lesson-mismatch': 'Evidence không thuộc đúng lesson',
  'task-mismatch': 'Evidence không thuộc đúng task',
  'capability-mismatch': 'Evidence không thuộc đúng capability',
  'rubric-mismatch': 'Rubric evidence không khớp task hiện tại',
  'rubric-not-rated': 'Rubric chưa được đánh giá đủ',
  'rubric-gap': 'Còn tiêu chí rubric chưa đạt',
  'used-vietnamese': 'Đã dùng tiếng Việt',
  'used-translation': 'Đã dùng công cụ dịch',
  'used-model-answer': 'Đã dùng model answer',
  'too-many-hints': 'Vượt số gợi ý cho phép',
  'preparation-overtime': 'Vượt thời gian chuẩn bị cho phép',
  'too-short': 'Output ngắn hơn yêu cầu',
  'too-long': 'Output dài hơn yêu cầu',
  overtime: 'Vượt thời gian cho phép',
  'listen-back-missing': 'Chưa nghe lại và hoàn tất listener checklist',
  'interaction-incomplete': 'Chưa hoàn thành đủ lượt clarification/repair'
}

function isContractChanged(attempt: AttemptEvidence, lesson: CanonicalLesson | undefined): boolean {
  if (!attempt.contentRevision || !lesson) return false
  return attempt.contentRevision !== contractRevision(buildEvidenceContract(lesson))
}

const STATUS_LABELS = { 'not-started': 'Chưa bắt đầu', 'in-progress': 'Đang học', completed: 'Đã hoàn thành' } as const

function ListeningReadingList({ label, noun, group }: { label: string; noun: string; group: ListeningReadingGroup }) {
  return (
    <div>
      <h3 className="font-bold">{label}: {group.completed}/{group.total} đã hoàn thành</h3>
      {group.items.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-400">Chưa có {noun} trong thư viện.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {group.items.map((item) => (
            <li key={item.lessonId} aria-label={item.title} className="rounded-xl bg-zinc-950/60 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-zinc-100">{item.title}</span>
                <span className={item.status === 'completed' ? 'font-bold text-green-300' : 'text-zinc-400'}>{STATUS_LABELS[item.status]}</span>
              </div>
              <p className="mt-1 text-zinc-400">Đã trả lời {item.answered}/{item.questions} câu hỏi</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ProgressPage() {
  const lessonProgress = useAppStore((state) => state.lessonProgress)
  const lessons = useAppStore((state) => state.lessons)
  const attempts = Object.values(lessonProgress).flatMap((progress) => progress.recentAttempts)
  const lessonsById = new Map(lessons.map((lesson) => [lesson.lessonId, lesson]))
  const ids = Object.keys(CAPABILITY_LABELS) as CapabilityId[]
  const listeningReading = summarizeListeningReading(lessons, lessonProgress)

  return (
    <section aria-labelledby="progress-title" className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-purple-400">Observed evidence</p>
        <h1 id="progress-title" className="mt-2 text-3xl font-black">Tiến bộ theo capability</h1>
        <p className="mt-2 text-zinc-400">Không có điểm năng lực bí ẩn—chỉ hiển thị evidence đã quan sát.</p>
        <p className="mt-2 text-sm text-zinc-400">Transfer đạt khi rubric đạt đủ, output đúng độ dài/thời gian và lượt làm đáp ứng hợp đồng độc lập của mission. Chi tiết transfer dùng tối đa 50 attempt gần nhất của mỗi bài.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {ids.map((id) => {
          const totalAttempts = lessons
            .filter((lesson) => lesson.capabilities.includes(id))
            .reduce((total, lesson) => total + (lessonProgress[lesson.lessonId]?.attemptCount ?? 0), 0)
          const recentCapabilityAttempts = attempts.filter((attempt) =>
            lessonsById.get(attempt.lessonId)?.capabilities.includes(id)
          )
          const transfers = recentCapabilityAttempts.filter((attempt) => attempt.phase === 'transfer')
          const assessments = transfers.map((attempt) => ({
            attempt,
            assessment: attempt.assessment,
            changed: isContractChanged(attempt, lessonsById.get(attempt.lessonId))
          }))
          return (
            <article key={id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h2 className="text-lg font-bold">{CAPABILITY_LABELS[id]}</h2>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div><dt className="text-xs text-zinc-400">Attempts</dt><dd className="mt-1 text-2xl font-black">{totalAttempts}</dd></div>
                <div><dt className="text-xs text-zinc-400">Transfer gần đây</dt><dd className="mt-1 text-2xl font-black">{transfers.length}</dd></div>
                <div><dt className="text-xs text-zinc-400">Transfer đạt gần đây</dt><dd className="mt-1 text-2xl font-black">{assessments.filter(({ assessment }) => assessment?.qualifies).length}</dd></div>
              </dl>
              {assessments.length > 0 && (
                <ul aria-label={`Chi tiết transfer ${CAPABILITY_LABELS[id]}`} className="mt-5 space-y-3 border-t border-zinc-800 pt-4">
                  {assessments.slice(-3).reverse().map(({ attempt, assessment, changed }) => (
                    <li key={attempt.attemptId} className="rounded-xl bg-zinc-950/60 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className={assessment?.qualifies ? 'font-bold text-green-300' : 'font-bold text-amber-300'}>{assessment ? (assessment.qualifies ? 'Đạt hợp đồng' : 'Chưa đạt') : 'Chưa có đánh giá (bản ghi cũ)'}</span>
                        <span className="text-zinc-400">{attempt.durationSeconds}s{attempt.wordCount === null ? '' : ` · ${attempt.wordCount} từ`}</span>
                      </div>
                      {assessment && !assessment.qualifies && <p className="mt-2 text-zinc-400">{assessment.reasons.map((reason) => REASON_LABELS[reason]).join(' · ')}</p>}
                      {changed && <p className="mt-2 text-xs text-zinc-400">Bài đã đổi sau lượt này; kết quả giữ theo hợp đồng lúc làm.</p>}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
      </div>
      <section aria-labelledby="listening-reading-title" className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h2 id="listening-reading-title" className="text-lg font-bold">Nghe và đọc dài</h2>
        <p className="mt-1 text-sm text-zinc-400">Tiến độ các bài nghe hội thoại và đọc tài liệu dài; chỉ đếm câu hỏi bạn đã trả lời đúng.</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <ListeningReadingList label="Bài nghe" noun="bài nghe" group={listeningReading.listening} />
          <ListeningReadingList label="Bài đọc dài" noun="bài đọc dài" group={listeningReading.reading} />
        </div>
      </section>
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
