import { useEffect, useRef, useState } from 'react'
import type { CanonicalLesson, PerformanceTaskV3, PracticeContext } from '../../content/schema'
import type { CapabilitySession } from '../../domain/learning/flow'
import {
  assessTransfer,
  type AttemptProcessEvidence,
  type AttemptEvidence,
  type IndependenceEvidence,
  type LessonProgress,
  type RubricState,
  type TransferAssessment,
  type TransferReason
} from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { SectionRenderer } from '../lesson/SectionRenderer'
import { SpokenResponse, type SpokenAttemptSnapshot } from './SpokenResponse'
import { InteractionPractice } from './InteractionPractice'
import { LearningLoopPractice } from './LearningLoopPractice'

const DEFAULT_INDEPENDENCE: IndependenceEvidence = {
  usedVietnamese: false,
  usedTranslation: false,
  usedModelAnswer: false,
  hintCount: 0,
  preparationSeconds: 0
}

interface WrittenAttemptSnapshot {
  kind: 'written'
  text: string
  durationSeconds: number
  wordCount: number
  audioUrl: null
}

type SessionAttemptSnapshot = WrittenAttemptSnapshot | SpokenAttemptSnapshot

const TRANSFER_REASON_LABELS: Record<TransferReason, string> = {
  incomplete: 'lượt transfer chưa hoàn chỉnh',
  'rubric-not-rated': 'rubric chưa được đánh giá đủ',
  'rubric-gap': 'còn tiêu chí chưa đạt',
  'used-vietnamese': 'đã dùng tiếng Việt',
  'used-translation': 'đã dùng công cụ dịch',
  'used-model-answer': 'đã dùng model answer',
  'too-many-hints': 'vượt số gợi ý',
  'too-short': 'output ngắn hơn yêu cầu',
  'too-long': 'output dài hơn yêu cầu',
  overtime: 'vượt thời gian'
}

function initialSession(progress: LessonProgress | undefined, now = Date.now()): CapabilitySession {
  const completed: CapabilitySession = {
    phase: 'completed', baselineAttempted: true, rubricRated: true, transferCompleted: true
  }
  if (progress?.nextReviewAt && new Date(progress.nextReviewAt).getTime() <= now) {
    return { ...completed, phase: 'review' }
  }
  if (progress?.status === 'completed') return completed
  switch (progress?.activePhase) {
    case 'input':
      return { phase: 'input', baselineAttempted: true, rubricRated: false, transferCompleted: false }
    case 'performance':
      return { phase: 'performance', baselineAttempted: true, rubricRated: false, transferCompleted: false }
    case 'retry':
      return { phase: 'retry', baselineAttempted: true, rubricRated: true, transferCompleted: false }
    case 'transfer':
      return { phase: 'transfer', baselineAttempted: true, rubricRated: true, transferCompleted: false }
    default:
      return { phase: 'baseline', baselineAttempted: false, rubricRated: false, transferCompleted: false }
  }
}

function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/u).length : 0
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
  const options: Array<{ key: 'usedVietnamese' | 'usedTranslation' | 'usedModelAnswer'; label: string }> = [
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

function LearnerOutput({ snapshot }: { snapshot: SessionAttemptSnapshot }) {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Output của bạn · chỉ trong phiên này</p>
      {snapshot.kind === 'written' ? (
        <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-200">{snapshot.text}</p>
      ) : snapshot.audioUrl ? (
        <audio className="mt-4 w-full" controls src={snapshot.audioUrl} aria-label="Output nói của bạn" />
      ) : (
        <p className="mt-3 text-zinc-300">Lượt nói timer-only: {snapshot.durationSeconds} giây.</p>
      )}
    </div>
  )
}

function PracticeContextPanel({ lessonId, context }: { lessonId: string; context: PracticeContext }) {
  return (
    <section aria-label={context.title} className="space-y-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Job evidence · chỉ dành cho lượt này</p>
        <h3 className="mt-2 text-xl font-black">{context.title}</h3>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {context.artifacts.map((artifact) => (
          <div key={artifact.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <SectionRenderer lessonId={lessonId} section={artifact} />
          </div>
        ))}
      </div>
    </section>
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
  const setActivePhase = useAppStore((state) => state.setActivePhase)
  const [session, setSession] = useState<CapabilitySession>(() => initialSession(progress))
  const [response, setResponse] = useState('')
  const [spokenSnapshot, setSpokenSnapshot] = useState<SpokenAttemptSnapshot | null>(null)
  const [learnerOutput, setLearnerOutput] = useState<SessionAttemptSnapshot | null>(null)
  const [rubric, setRubric] = useState<Record<string, RubricState>>({})
  const [retryFocusId, setRetryFocusId] = useState<string | null>(() => progress?.recentAttempts.at(-1)?.focusCriterionId ?? null)
  const [independence, setIndependence] = useState<IndependenceEvidence>(DEFAULT_INDEPENDENCE)
  const [completionAssessment, setCompletionAssessment] = useState<TransferAssessment | null>(null)
  const [learningLoopReady, setLearningLoopReady] = useState(task.mode !== 'spoken' || !task.learningLoop)
  const [processEvidence, setProcessEvidence] = useState<AttemptProcessEvidence | null>(null)
  const [listenedBack, setListenedBack] = useState(false)
  const [cueToSpeechStartMs, setCueToSpeechStartMs] = useState<number | null>(null)
  const preparationStartedAt = useRef(Date.now())
  const outputStartedAt = useRef<number | null>(null)
  const learnerAudio = useRef<SpokenAttemptSnapshot | null>(null)
  const draftAudio = useRef<SpokenAttemptSnapshot | null>(null)
  const phase = session.phase

  useEffect(() => {
    learnerAudio.current = learnerOutput?.kind === 'spoken' ? learnerOutput : null
    draftAudio.current = spokenSnapshot
  }, [learnerOutput, spokenSnapshot])
  useEffect(() => () => {
    learnerAudio.current?.release?.()
    if (draftAudio.current !== learnerAudio.current) draftAudio.current?.release?.()
  }, [])

  const allRated = task.rubric.every((item) => rubric[item.id] === 'met' || rubric[item.id] === 'not-met')
  const notMetCriterionIds = task.rubric.filter((item) => rubric[item.id] === 'not-met').map((item) => item.id)
  const selectedRetryFocusId = notMetCriterionIds.includes(retryFocusId ?? '') ? retryFocusId : null
  const canSubmitFeedback = allRated && (notMetCriterionIds.length === 0 || selectedRetryFocusId !== null)
  const retryFocus = task.rubric.find((item) => item.id === retryFocusId)
  const responseReady = task.mode === 'spoken'
    ? spokenSnapshot !== null && (!task.learningLoop || !spokenSnapshot.audioUrl || listenedBack)
    : response.trim().length > 0
  const practiceContext = phase === 'baseline' ? task.practiceContexts?.baseline
    : phase === 'retry' ? task.practiceContexts?.retry
      : phase === 'transfer' ? task.practiceContexts?.transfer
        : phase === 'review' ? task.practiceContexts?.review : undefined

  const startOutput = () => {
    if (outputStartedAt.current === null) {
      outputStartedAt.current = Date.now()
      setCueToSpeechStartMs(Math.max(0, Date.now() - preparationStartedAt.current))
    }
  }
  const createSnapshot = (): SessionAttemptSnapshot | null => {
    if (task.mode === 'spoken') return spokenSnapshot
    if (!response.trim()) return null
    return {
      kind: 'written', text: response,
      durationSeconds: Math.max(1, Math.ceil((Date.now() - (outputStartedAt.current ?? Date.now())) / 1_000)),
      wordCount: countWords(response), audioUrl: null
    }
  }
  const measuredPreparationSeconds = () => Math.max(
    0, Math.floor(((outputStartedAt.current ?? Date.now()) - preparationStartedAt.current) / 1_000)
  )
  const saveAttempt = (
    attemptPhase: AttemptEvidence['phase'],
    snapshot: SessionAttemptSnapshot,
    ratings = rubric,
    focusCriterionId?: string | null
  ) => {
    const attempt: AttemptEvidence = {
    attemptId: attemptId(), lessonId: lesson.lessonId, taskId: task.id,
    capabilityId: lesson.capabilities[0] ?? 'workplace-communication', phase: attemptPhase,
    attemptedAt: new Date().toISOString(), durationSeconds: snapshot.durationSeconds,
    wordCount: snapshot.wordCount,
    rubric: Object.fromEntries(task.rubric.map((item) => [item.id, ratings[item.id] ?? 'not-rated'])),
    ...(focusCriterionId ? { focusCriterionId } : {}),
    independence: { ...independence, preparationSeconds: measuredPreparationSeconds() },
      process: processEvidence ? { ...processEvidence, listenedBack, cueToSpeechStartMs } : null,
      completed: true
    }
    recordAttempt(attempt, lesson.reviewPolicy.intervalDays)
    return attempt
  }
  const resetResponse = (releaseLearnerOutput = true) => {
    if (releaseLearnerOutput) {
      if (learnerOutput?.kind === 'spoken') learnerOutput.release?.()
      setLearnerOutput(null)
    }
    spokenSnapshot?.release?.()
    setSpokenSnapshot(null)
    setResponse('')
    setIndependence(DEFAULT_INDEPENDENCE)
    setListenedBack(false)
    setCueToSpeechStartMs(null)
    preparationStartedAt.current = Date.now()
    outputStartedAt.current = null
  }

  if (phase === 'completed') {
    return (
      <section role="status" className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <h2 className="text-2xl font-black">Mission hoàn thành</h2>
        <p className="mt-2 text-zinc-300">Transfer evidence đã được lưu. Review tiếp theo được đưa vào Today theo lịch {lesson.reviewPolicy.intervalDays.join('–')} ngày.</p>
        {completionAssessment && (
          <p className={`mt-4 rounded-xl p-4 text-sm ${completionAssessment.qualifies ? 'bg-green-500/10 text-green-200' : 'bg-amber-500/10 text-amber-200'}`}>
            {completionAssessment.qualifies
              ? 'Transfer đạt hợp đồng độc lập và output contract.'
              : `Transfer đã lưu nhưng chưa qualifying: ${completionAssessment.reasons.map((reason) => TRANSFER_REASON_LABELS[reason]).join(', ')}.`}
          </p>
        )}
      </section>
    )
  }

  const prompt = phase === 'baseline' ? task.baselinePrompt
    : phase === 'performance' ? task.performancePrompt
      : phase === 'retry' ? task.retryPrompt
        : phase === 'review' ? task.reviewPrompt : task.transferPrompt

  return (
    <section aria-labelledby="task-title" className="space-y-6">
      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-300">{task.mode} capability task · {phase}</p>
        <h2 id="task-title" className="mt-2 text-2xl font-black">{task.title}</h2>
        <p className="mt-3 text-zinc-300">{practiceContext?.brief ?? task.scenario}</p>
      </div>

      {phase === 'input' ? (
        <div className="space-y-8">
          {lesson.sections.map((section) => (
            <div key={section.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <SectionRenderer lessonId={lesson.lessonId} section={section} />
            </div>
          ))}
          {task.mode === 'spoken' && task.learningLoop && !learningLoopReady && (
            <LearningLoopPractice loop={task.learningLoop} onComplete={(process) => {
              setProcessEvidence(process)
              setLearningLoopReady(true)
            }} />
          )}
          <button type="button" onClick={() => {
            setSession({ ...session, phase: 'performance' })
            setActivePhase(lesson.lessonId, 'performance')
            preparationStartedAt.current = Date.now()
          }} disabled={!learningLoopReady} className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40">Bắt đầu lượt chính</button>
        </div>
      ) : phase === 'interaction' && task.mode === 'spoken' && task.learningLoop && learnerOutput ? (
        <div className="space-y-6">
          <LearnerOutput snapshot={learnerOutput} />
          <InteractionPractice turns={task.learningLoop.interactionTurns} onComplete={(turnIds) => {
            setProcessEvidence((current) => current ? { ...current, interactionTurnIds: turnIds } : current)
            setSession({ ...session, phase: 'self-feedback' })
          }} />
        </div>
      ) : phase === 'self-feedback' && learnerOutput ? (
        <div className="space-y-6">
          <LearnerOutput snapshot={learnerOutput} />
          <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Model response — chỉ mở sau attempt</p>
            <p className="mt-3 leading-7 text-zinc-300">{task.modelResponse}</p>
          </div>
          <RubricEditor task={task} answers={rubric} setAnswers={setRubric} />
          {allRated && notMetCriterionIds.length > 0 ? (
            <fieldset className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <legend className="px-1 text-sm font-bold text-amber-200">Chọn ưu tiên retry</legend>
              <p className="mb-3 text-sm text-zinc-300">Chọn một tiêu chí chưa đạt để tập trung sửa ở lượt kế tiếp.</p>
              <div className="grid gap-2">
                {task.rubric.filter((item) => notMetCriterionIds.includes(item.id)).map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-center gap-3 text-sm">
                    <input type="radio" name="retry-focus" checked={selectedRetryFocusId === item.id}
                      onChange={() => setRetryFocusId(item.id)} className="h-4 w-4 accent-amber-400" />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : allRated ? (
            <p className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">Tất cả tiêu chí đã đạt. Retry để giữ chất lượng khi diễn đạt lại.</p>
          ) : null}
          <button type="button" disabled={!canSubmitFeedback} onClick={() => {
            saveAttempt('performance', learnerOutput, rubric, selectedRetryFocusId)
            setRubric({})
            resetResponse(false)
            setSession({ ...session, phase: 'retry', rubricRated: true })
          }} className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40">Lưu self-feedback</button>
        </div>
      ) : (
        <div className="space-y-5">
          {practiceContext && <PracticeContextPanel lessonId={lesson.lessonId} context={practiceContext} />}
          <p className="whitespace-pre-line text-lg leading-8 text-zinc-200">{prompt}</p>
          {phase === 'retry' && learnerOutput && (
            <div className="grid gap-4 lg:grid-cols-2">
              <LearnerOutput snapshot={learnerOutput} />
              <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Model để đối chiếu</p>
                <p className="mt-3 leading-7 text-zinc-300">{task.modelResponse}</p>
              </div>
            </div>
          )}
          {phase === 'retry' && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Ưu tiên retry</p>
              <p className="mt-2 font-semibold">{retryFocus?.label ?? 'Giữ toàn bộ tiêu chí đã đạt khi diễn đạt lại'}</p>
            </div>
          )}
          {task.mode === 'spoken' ? (
            <div className="space-y-3">
              <SpokenResponse key={`${lesson.lessonId}:${phase}`} onStarted={startOutput} onReady={setSpokenSnapshot} onListenedBack={() => setListenedBack(true)} />
              {task.learningLoop && spokenSnapshot?.audioUrl && !listenedBack && (
                <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-200">Hãy nghe lại bản ghi ít nhất một lần trước khi tiếp tục.</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block font-semibold">Bản nháp tiếng Anh
                <textarea value={response} onChange={(event) => {
                  if (event.target.value.trim()) startOutput()
                  setResponse(event.target.value)
                }} rows={7} className="mt-2 block w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-normal leading-7" />
              </label>
              <p className="mt-2 text-xs text-zinc-500">{countWords(response)} từ · Bản nháp chỉ ở session hiện tại và không được persist.</p>
            </div>
          )}
          <IndependenceEditor value={independence} onChange={setIndependence} />
          {(phase === 'retry' || phase === 'transfer' || phase === 'review') && <RubricEditor task={task} answers={rubric} setAnswers={setRubric} />}
          <div className="flex flex-wrap gap-3">
            {phase === 'baseline' && <button type="button" disabled={!responseReady} onClick={() => {
              const snapshot = createSnapshot(); if (!snapshot) return
              saveAttempt('baseline', snapshot, {})
              resetResponse()
              setSession({ ...session, phase: 'input', baselineAttempted: true })
            }} className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40">Lưu baseline</button>}
            {phase === 'performance' && <button type="button" disabled={!responseReady} onClick={() => {
              const snapshot = createSnapshot(); if (!snapshot) return
              setLearnerOutput(snapshot)
              setSpokenSnapshot(null)
              setSession({ ...session, phase: task.mode === 'spoken' && task.learningLoop ? 'interaction' : 'self-feedback' })
            }} className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40">Đối chiếu rubric</button>}
            {phase === 'retry' && <button type="button" disabled={!responseReady || !allRated} onClick={() => {
              const snapshot = createSnapshot(); if (!snapshot) return
              saveAttempt('retry', snapshot, rubric, retryFocusId)
              setRubric({})
              resetResponse()
              setSession({ ...session, phase: 'transfer' })
            }} className="rounded-xl bg-purple-500 px-5 py-3 font-bold disabled:opacity-40">Sang transfer</button>}
            {phase === 'transfer' && <button type="button" disabled={!responseReady || !allRated} onClick={() => {
              const snapshot = createSnapshot(); if (!snapshot) return
              const attempt = saveAttempt('transfer', snapshot)
              const contract = task.mode === 'spoken'
                ? { maxHints: task.independenceContract.maxHints, timeLimitSeconds: task.outputContract.timeLimitSeconds, targetSeconds: task.outputContract.targetSeconds }
                : { maxHints: task.independenceContract.maxHints, timeLimitSeconds: task.outputContract.timeLimitSeconds, minWords: task.outputContract.minWords, maxWords: task.outputContract.maxWords }
              setCompletionAssessment(assessTransfer(attempt, contract))
              resetResponse()
              setSession({ ...session, phase: 'completed', transferCompleted: true })
            }} className="rounded-xl bg-green-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-40">Hoàn thành transfer</button>}
            {phase === 'review' && <button type="button" disabled={!responseReady || !allRated} onClick={() => {
              const snapshot = createSnapshot(); if (!snapshot) return
              saveAttempt('review', snapshot)
              resetResponse()
              setSession({ ...session, phase: 'completed' })
            }} className="rounded-xl bg-green-500 px-5 py-3 font-bold text-zinc-950 disabled:opacity-40">Lưu review</button>}
          </div>
        </div>
      )}
    </section>
  )
}
