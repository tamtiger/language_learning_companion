import { useEffect, useRef, useState } from 'react'
import type { LearningLoopV1 } from '../../content/schema'
import type { PerceptionProgress } from '../../domain/progress/progress'
import { GuardedButton } from '../../shared/components/GuardedButton'
import { languageOf } from '../../shared/lang'
import { ModelAudioPlayer } from './ModelAudioPlayer'
import { recordPerceptionMiss, type PerceptionPhase } from './learningLoopDiagnostics'
import { orderOptions, useShuffleSalt } from '../lesson/optionOrder'
import { availableVoiceCount } from './modelAudio'

export interface PerceptionResult {
  pretestCorrect: number
  pretestTotal: number
  trainingCompleted: number
  posttestCorrect: number
  posttestTotal: number
  diagnosticMissedItemIds: string[]
  optedOut: boolean
  availableVariantCount: number
  variabilityQualified: boolean
}

const PERCEPTION_PHASE_LABELS: Record<PerceptionPhase, string> = {
  pretest: 'Nghe thử đầu',
  training: 'Luyện nghe',
  posttest: 'Nghe lại để kiểm tra'
}

function usableProgress(perception: LearningLoopV1['perception'], saved?: PerceptionProgress): PerceptionProgress | undefined {
  if (!saved) return undefined
  return saved.index < (perception[saved.phase]?.length ?? 0) ? saved : undefined
}

export function PerceptionPractice({ perception, initial, onProgress, onComplete }: {
  perception: LearningLoopV1['perception']
  /** Resume point saved earlier; ignored when it no longer fits the content. */
  initial?: PerceptionProgress
  /** Called after each advance (never mid-question) so a reload can resume. */
  onProgress?: (progress: PerceptionProgress) => void
  onComplete: (result: PerceptionResult) => void
}) {
  const resume = usableProgress(perception, initial)
  const [phase, setPhase] = useState<PerceptionPhase>(resume?.phase ?? 'pretest')
  const [index, setIndex] = useState(resume?.index ?? 0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [scores, setScores] = useState({ pretest: resume?.pretestCorrect ?? 0, posttest: resume?.posttestCorrect ?? 0 })
  const [missed, setMissed] = useState<string[]>(resume?.missedItemIds ?? [])
  const phaseHeading = useRef<HTMLHeadingElement>(null)
  const salt = useShuffleSalt()
  const previousPhase = useRef(phase)
  const items = perception[phase]
  const item = items[index]
  const last = index === items.length - 1
  const trainingCompleted = phase === 'pretest'
    ? 0
    : phase === 'training'
      ? Math.min(index + (answer ? 1 : 0), perception.training.length)
      : perception.training.length

  useEffect(() => {
    if (previousPhase.current !== phase) phaseHeading.current?.focus()
    previousPhase.current = phase
  }, [phase])

  const answerItem = (value: string) => {
    if (answer) return
    setAnswer(value)
    if (value === item.correctAnswer && phase !== 'training') {
      setScores((current) => ({ ...current, [phase]: current[phase] + 1 }))
    }
    if (value !== item.correctAnswer) setMissed((current) => recordPerceptionMiss(current, phase, item.id))
  }
  const report = (nextPhase: PerceptionPhase, nextIndex: number) => onProgress?.({
    phase: nextPhase,
    index: nextIndex,
    pretestCorrect: scores.pretest,
    posttestCorrect: scores.posttest,
    missedItemIds: [...new Set(missed)]
  })
  const next = () => {
    if (!last) {
      report(phase, index + 1)
      setIndex(index + 1)
      setAnswer(null)
      return
    }
    if (phase === 'pretest') {
      report('training', 0)
      setPhase('training'); setIndex(0); setAnswer(null); return
    }
    if (phase === 'training') {
      report('posttest', 0)
      setPhase('posttest'); setIndex(0); setAnswer(null); return
    }
    const availableVariantCount = new Set([
      ...perception.pretest, ...perception.training, ...perception.posttest
    ].map((candidate) => availableVoiceCount(candidate.audio))).size === 0
      ? 0
      : Math.max(...[...perception.pretest, ...perception.training, ...perception.posttest].map((candidate) => availableVoiceCount(candidate.audio)))
    onComplete({
      pretestCorrect: scores.pretest,
      pretestTotal: perception.pretest.length,
      trainingCompleted: perception.training.length,
      posttestCorrect: scores.posttest,
      posttestTotal: perception.posttest.length,
      diagnosticMissedItemIds: [...new Set(missed)],
      optedOut: false,
      availableVariantCount,
      variabilityQualified: availableVariantCount >= 3
    })
  }

  return (
    <section aria-labelledby="perception-title" className="space-y-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Nghe nhận diện · {PERCEPTION_PHASE_LABELS[phase]} · {index + 1}/{items.length}</p>
        <h3 ref={phaseHeading} tabIndex={-1} id="perception-title" className="mt-2 text-xl font-black">Nghe trước khi nói</h3>
      </div>
      <ModelAudioPlayer source={item.audio} transcriptVisible={Boolean(answer)} />
      <fieldset className="space-y-2">
        <legend lang={languageOf(item.question)} className="font-semibold">{item.question}</legend>
        {orderOptions(item.options, `${item.id}:${salt}`).map((option) => (
          <button key={option} type="button" lang={languageOf(option)} aria-disabled={answer ? true : undefined} onClick={() => answerItem(option)}
            className={`mr-2 rounded-lg border border-zinc-700 px-3 py-2 ${answer ? 'cursor-not-allowed opacity-70' : ''}`}>
            {option}
          </button>
        ))}
      </fieldset>
      <div role="status" aria-label="Kết quả câu nghe" className={answer ? 'rounded-lg bg-zinc-900 p-3 text-sm' : undefined}>
        {answer && (
          <>
            <p>{answer === item.correctAnswer ? 'Đúng.' : `Đáp án: ${item.correctAnswer}`}</p>
            {phase === 'training' && <p lang={languageOf(item.feedback ?? '')} className="mt-1 text-zinc-300">{item.feedback}</p>}
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <GuardedButton disabledReason={answer ? undefined : 'Chọn một đáp án trước khi sang câu tiếp.'} onClick={next} className="rounded-lg bg-purple-700 px-4 py-2 font-bold">
          {last ? (phase === 'posttest' ? 'Hoàn thành perception' : 'Sang phần tiếp theo') : 'Câu tiếp'}
        </GuardedButton>
        <button type="button" onClick={() => onComplete({
          pretestCorrect: scores.pretest, pretestTotal: perception.pretest.length,
          trainingCompleted,
          posttestCorrect: scores.posttest, posttestTotal: perception.posttest.length,
          diagnosticMissedItemIds: [...new Set(missed)], optedOut: true,
          availableVariantCount: 0, variabilityQualified: false
        })} className="rounded-lg border border-zinc-700 px-4 py-2">
          Bỏ qua vì audio không phù hợp
        </button>
      </div>
    </section>
  )
}
