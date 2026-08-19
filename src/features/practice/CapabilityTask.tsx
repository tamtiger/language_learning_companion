import { useState } from 'react'
import type { CanonicalLesson, PerformanceTaskV3 } from '../../content/schema'
import { advancePhase, type CapabilitySession } from '../../domain/learning/flow'
import type {
  AttemptEvidence,
  IndependenceEvidence,
  LessonProgress,
  RubricState
} from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { SectionRenderer } from '../lesson/SectionRenderer'
import { SpokenResponse } from './SpokenResponse'

const DEFAULT_INDEPENDENCE: IndependenceEvidence = {
  usedVietnamese: false,
  usedTranslation: false,
  usedModelAnswer: false,
  hintCount: 0,
  preparationSeconds: 0
}

function initialSession(progress: LessonProgress | undefined, now = Date.now()): CapabilitySession {
  const completed: CapabilitySession = {
    phase: 'completed',
    baselineAttempted: true,
    rubricRated: true,
    transferCompleted: true
  }

  if (progress?.nextReviewAt && new Date(progress.nextReviewAt).getTime() <= now) {
    return { ...completed, phase: 'review' }
  }
  if (progress?.status === 'completed') return completed

  const latestPhase = progress?.recentAttempts.at(-1)?.phase
  if (latestPhase === 'baseline') {
    return { phase: 'input', baselineAttempted: true, rubricRated: false, transferCompleted: false }
  }
  if (latestPhase === 'performance') {
    return { phase: 'retry', baselineAttempted: true, rubricRated: true, transferCompleted: false }
  }
  if (latestPhase === 'retry') {
    return { phase: 'transfer', baselineAttempted: true, rubricRated: true, transferCompleted: false }
  }
  if (latestPhase === 'transfer' || latestPhase === 'review') return completed
  return { phase: 'baseline', baselineAttempted: false, rubricRated: false, transferCompleted: false }
}

function ResponseEditor({ task, value, onChange, onReady }: {
  task: PerformanceTaskV3
  value: string
  onChange: (value: string) => void
  onReady: (ready: boolean) => void
}) {
  if (task.mode === 'spoken') {
    return <SpokenResponse onReady={(ready) => {
      onReady(ready)
      if (ready) onChange('[spoken attempt completed]')
    }} />
  }

  const words = value.trim() ? value.trim().split(/\s+/u).length : 0
  return (
    <div>
      <label className="block font-semibold">
        Bản nháp tiếng Anh
        <textarea
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            onReady(event.target.value.trim().length > 0)
          }}
          rows={7}
          className="mt-2 block w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-normal leading-7"
        />
      </label>
      <p className="mt-2 text-xs text-zinc-500">
        {words} từ · Bản nháp chỉ ở session hiện tại và không được persist.
      </p>
    </div>
  )
}

function RubricEditor({ task, answers, setAnswers }: {
  task: PerformanceTaskV3
  answers: Record<string, RubricState>
  setAnswers: (answers: Record<string, RubricState>) => void
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold">Self-rubric</legend>
      {task.rubric.map((item) => (
        <div key={item.id} className="rounded-xl border border-zinc-700 p-4">
          <p className="font-semibold">{item.label}</p>
          <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
          <div className="mt-3 flex gap-2">
            {(['met', 'not-met'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={answers[item.id] === value}
                onClick={() => setAnswers({ ...answers, [item.id]: value })}
                className={`rounded-lg border px-3 py-2 text-sm font-bold ${answers[item.id] === value
                  ? value === 'met'
                    ? 'border-green-400 bg-green-500/20 text-green-300'
                    : 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-zinc-700'}`}
              >
                {value === 'met' ? 'Đạt' : 'Chưa đạt'}
              </button>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  )
}

function IndependenceEditor({ value, onChange }: {
  value: IndependenceEvidence
  onChange: (value: IndependenceEvidence) => void
}) {
  const options: Array<{
    key: 'usedVietnamese' | 'usedTranslation' | 'usedModelAnswer'
    label: string
  }> = [
    { key: 'usedVietnamese', label: 'Tôi đã dùng tiếng Việt để chuẩn bị' },
    { key: 'usedTranslation', label: 'Tôi đã dùng công cụ dịch' },
    { key: 'usedModelAnswer', label: 'Tôi đã xem hoặc dùng model answer' }
  ]

  return (
    <fieldset className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <legend className="px-1 text-sm font-bold">Mức độ độc lập của lượt này</legend>
      <p className="mb-3 text-xs text-zinc-500">
        Tự khai báo trung thực; app chỉ lưu các cờ này, không lưu nội dung câu trả lời.
      </p>
      <div className="grid gap-2">
        {options.map((option) => (
          <label key={option.key} className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={value[option.key]}
              onChange={(event) => onChange({ ...value, [option.key]: event.target.checked })}
              className="h-4 w-4 accent-purple-500"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function attemptId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `attempt-${Date.now()}`
}

export function CapabilityTask({ lesson, task }: { lesson: CanonicalLesson; task: PerformanceTaskV3 }) {
  const progress = useAppStore((state) => state.lessonProgress[lesson.lessonId])
  const recordAttempt = useAppStore((state) => state.recordCapabilityAttempt)
  const [session, setSession] = useState<CapabilitySession>(() => initialSession(progress))
  const [response, setResponse] = useState('')
  const [responseReady, setResponseReady] = useState(false)
  const [rubric, setRubric] = useState<Record<string, RubricState>>({})
  const [retryFocusId, setRetryFocusId] = useState<string | null>(
    () => progress?.recentAttempts.at(-1)?.focusCriterionId ?? null
  )
  const [independence, setIndependence] = useState<IndependenceEvidence>(DEFAULT_INDEPENDENCE)
  const phase = session.phase
  const allRated = task.rubric.every(
    (item) => rubric[item.id] === 'met' || rubric[item.id] === 'not-met'
  )
  const notMetCriterionIds = task.rubric
    .filter((item) => rubric[item.id] === 'not-met')
    .map((item) => item.id)
  const selectedRetryFocusId = notMetCriterionIds.includes(retryFocusId ?? '')
    ? retryFocusId
    : null
  const canSubmitFeedback = allRated
    && (notMetCriterionIds.length === 0 || selectedRetryFocusId !== null)
  const retryFocus = task.rubric.find((item) => item.id === retryFocusId)

  const saveAttempt = (
    attemptPhase: AttemptEvidence['phase'],
    ratings = rubric,
    focusCriterionId?: string | null
  ) => recordAttempt({
    attemptId: attemptId(),
    lessonId: lesson.lessonId,
    taskId: task.id,
    capabilityId: lesson.capabilities[0] ?? 'workplace-communication',
    phase: attemptPhase,
    attemptedAt: new Date().toISOString(),
    durationSeconds: 0,
    rubric: Object.fromEntries(
      task.rubric.map((item) => [item.id, ratings[item.id] ?? 'not-rated'])
    ),
    ...(focusCriterionId ? { focusCriterionId } : {}),
    independence: {
      ...independence,
      preparationSeconds: task.independenceContract.preparationSeconds
    },
    completed: true
  }, lesson.reviewPolicy.intervalDays)

  const resetResponse = () => {
    setResponse('')
    setResponseReady(false)
    setIndependence(DEFAULT_INDEPENDENCE)
  }

  if (phase === 'completed') {
    return (
      <section role="status" className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <h2 className="text-2xl font-black">Mission hoàn thành</h2>
        <p className="mt-2 text-zinc-300">
          Transfer evidence đã được lưu. Review tiếp theo được đưa vào Today theo lịch{' '}
          {lesson.reviewPolicy.intervalDays.join('–')} ngày.
        </p>
      </section>
    )
  }

  const prompt = phase === 'baseline'
    ? task.baselinePrompt
    : phase === 'performance'
      ? task.performancePrompt
      : phase === 'retry'
        ? task.retryPrompt
        : phase === 'review'
          ? task.reviewPrompt
          : task.transferPrompt

  return (
    <section aria-labelledby="task-title" className="space-y-6">
      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
          {task.mode} capability task · {phase}
        </p>
        <h2 id="task-title" className="mt-2 text-2xl font-black">{task.title}</h2>
        <p className="mt-3 text-zinc-300">{task.scenario}</p>
      </div>

      {phase === 'input' ? (
        <div className="space-y-8">
          {lesson.sections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <SectionRenderer lessonId={lesson.lessonId} section={section} />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSession(advancePhase(session, 'COMPLETE_AUTO_CHECK'))}
            className="rounded-xl bg-purple-500 px-5 py-3 font-bold"
          >
            Bắt đầu lượt chính
          </button>
        </div>
      ) : phase === 'self-feedback' ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Model response — chỉ mở sau attempt
            </p>
            <p className="mt-3 leading-7 text-zinc-300">{task.modelResponse}</p>
          </div>
          <RubricEditor task={task} answers={rubric} setAnswers={setRubric} />
          {allRated && notMetCriterionIds.length > 0 ? (
            <fieldset className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <legend className="px-1 text-sm font-bold text-amber-200">Chọn ưu tiên retry</legend>
              <p className="mb-3 text-sm text-zinc-300">
                Chọn một tiêu chí chưa đạt để tập trung sửa ở lượt kế tiếp.
              </p>
              <div className="grid gap-2">
                {task.rubric
                  .filter((item) => notMetCriterionIds.includes(item.id))
                  .map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-3 text-sm">
                      <input
                        type="radio"
                        name="retry-focus"
                        checked={selectedRetryFocusId === item.id}
                        onChange={() => setRetryFocusId(item.id)}
                        className="h-4 w-4 accent-amber-400"
                      />
                      {item.label}
                    </label>
                  ))}
              </div>
            </fieldset>
          ) : allRated ? (
            <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
              Tất cả tiêu chí đã đạt. Retry để giữ chất lượng khi diễn đạt lại.
            </p>
          ) : null}
          <button
            type="button"
            disabled={!canSubmitFeedback}
            onClick={() => {
              saveAttempt('performance', rubric, selectedRetryFocusId)
              setRubric({})
              resetResponse()
              setSession(advancePhase(session, 'SUBMIT_RUBRIC'))
            }}
            className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40"
          >
            Lưu self-feedback
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="whitespace-pre-line text-lg leading-8 text-zinc-200">{prompt}</p>
          {phase === 'retry' && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Ưu tiên retry</p>
              <p className="mt-2 font-semibold">
                {retryFocus?.label ?? 'Giữ toàn bộ tiêu chí đã đạt khi diễn đạt lại'}
              </p>
            </div>
          )}
          <ResponseEditor
            task={task}
            value={response}
            onChange={setResponse}
            onReady={setResponseReady}
          />
          <IndependenceEditor value={independence} onChange={setIndependence} />
          {(phase === 'retry' || phase === 'transfer' || phase === 'review') && (
            <RubricEditor task={task} answers={rubric} setAnswers={setRubric} />
          )}
          <div className="flex flex-wrap gap-3">
            {phase === 'baseline' && (
              <button
                type="button"
                disabled={!responseReady}
                onClick={() => {
                  saveAttempt('baseline', {})
                  resetResponse()
                  setSession(advancePhase(session, 'SUBMIT_BASELINE'))
                }}
                className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40"
              >
                Lưu baseline
              </button>
            )}
            {phase === 'performance' && (
              <button
                type="button"
                disabled={!responseReady}
                onClick={() => setSession(advancePhase(session, 'SUBMIT_PERFORMANCE'))}
                className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40"
              >
                Đối chiếu rubric
              </button>
            )}
            {phase === 'retry' && (
              <button
                type="button"
                disabled={!responseReady || !allRated}
                onClick={() => {
                  saveAttempt('retry', rubric, retryFocusId)
                  setRubric({})
                  resetResponse()
                  setSession(advancePhase(session, 'START_TRANSFER'))
                }}
                className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40"
              >
                Sang transfer
              </button>
            )}
            {phase === 'transfer' && (
              <button
                type="button"
                disabled={!responseReady || !allRated}
                onClick={() => {
                  saveAttempt('transfer')
                  setSession(advancePhase(session, 'SUBMIT_TRANSFER'))
                }}
                className="rounded-xl bg-green-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-40"
              >
                Hoàn thành transfer
              </button>
            )}
            {phase === 'review' && (
              <button
                type="button"
                disabled={!responseReady || !allRated}
                onClick={() => {
                  saveAttempt('review')
                  setSession(advancePhase(session, 'SUBMIT_REVIEW'))
                }}
                className="rounded-xl bg-green-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-40"
              >
                Lưu review
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
