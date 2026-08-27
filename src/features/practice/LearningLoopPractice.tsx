import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AudioLines, CheckCircle2, Ear, MessageSquareQuote, Mic2, MinusCircle } from 'lucide-react'
import type { LearningLoopV1 } from '../../content/schema'
import {
  advanceLearningLoop,
  createLearningLoopState,
  type LearningLoopStage as DomainLearningLoopStage,
  type PronunciationStatus as DomainPronunciationStatus
} from '../../domain/learning/learning_loop'
import type { AttemptProcessEvidence } from '../../domain/progress/progress'
import { GuidedShadowing } from './GuidedShadowing'
import { PerceptionPractice } from './PerceptionPractice'
import { getRelevantPronunciationCues } from './learning_loop_diagnostics'
import { PronunciationCueCard } from './PronunciationCueCard'

export type LearningLoopStage = 'perception' | 'cue' | 'shadowing' | 'ready'
export type PronunciationStatus = DomainPronunciationStatus
export type PronunciationDisplayStatus = PronunciationStatus | 'resumed'

export interface LearningLoopSummary {
  pronunciationStatus: Exclude<PronunciationStatus, 'pending' | 'recommended'>
}

const JOURNEY_STEPS = [
  { id: 'perception', label: 'Nghe nhận diện', icon: Ear },
  { id: 'cue', label: 'Luyện phát âm', icon: AudioLines },
  { id: 'shadowing', label: 'Sentence chunks', icon: MessageSquareQuote },
  { id: 'ready', label: 'Lượt nói chính', icon: Mic2 }
] as const

function pronunciationDetail(status: PronunciationDisplayStatus): string {
  if (status === 'recommended') return 'Đang luyện theo lỗi nghe'
  if (status === 'completed') return 'Đã luyện bổ sung'
  if (status === 'not-needed') return 'Không cần luyện bổ sung'
  if (status === 'unavailable') return 'Đã bỏ qua cùng bài nghe'
  if (status === 'resumed') return 'Đã khôi phục tiến trình'
  return 'Cá nhân hóa sau bài nghe'
}

function journeyStage(stage: DomainLearningLoopStage): LearningLoopStage {
  if (stage === 'pronunciation-cue') return 'cue'
  if (stage === 'guided-shadowing') return 'shadowing'
  if (stage === 'ready-for-performance') return 'ready'
  return 'perception'
}

export function LearningLoopProgress({ stage, pronunciationStatus }: {
  stage: LearningLoopStage
  pronunciationStatus: PronunciationDisplayStatus
}) {
  const activeIndex = JOURNEY_STEPS.findIndex((item) => item.id === stage)
  const currentStepRef = useRef<HTMLSpanElement>(null)
  const previousStageRef = useRef(stage)

  useEffect(() => {
    if (previousStageRef.current !== stage) currentStepRef.current?.focus()
    previousStageRef.current = stage
  }, [stage])

  return (
    <nav aria-label="Tiến trình luyện nói" className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
      <ol className="grid grid-cols-2 sm:grid-cols-4">
        {JOURNEY_STEPS.map(({ id, label, icon: Icon }, index) => {
          const skipped = id === 'cue'
            && (pronunciationStatus === 'not-needed'
              || pronunciationStatus === 'unavailable'
              || pronunciationStatus === 'resumed')
            && index < activeIndex
          const complete = index < activeIndex && !skipped
          const current = index === activeIndex
          const detail = id === 'cue'
            ? pronunciationDetail(pronunciationStatus)
            : current ? 'Đang thực hiện' : complete ? 'Đã hoàn thành' : 'Tiếp theo'
          const StatusIcon = complete ? CheckCircle2 : skipped ? MinusCircle : Icon
          return (
            <li key={id} className={`min-h-24 border-b border-r border-zinc-800 p-3 last:border-r-0 sm:border-b-0 ${current ? 'bg-cyan-500/10 text-cyan-100' : complete ? 'text-green-300' : skipped ? 'text-zinc-300' : 'text-zinc-400'}`}>
              <StatusIcon aria-hidden="true" className="h-4 w-4" />
              <span
                ref={current ? currentStepRef : undefined}
                aria-current={current ? 'step' : undefined}
                tabIndex={current ? -1 : undefined}
                className="mt-2 block text-xs font-bold leading-tight"
              >{label}</span>
              <span className="mt-1 block text-xs leading-tight text-current/80">{detail}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function LearningLoopPractice({ loop, onComplete }: {
  loop: LearningLoopV1
  onComplete: (process: AttemptProcessEvidence, summary: LearningLoopSummary) => void
}) {
  const [learningState, setLearningState] = useState(() => createLearningLoopState(loop.shadowingSteps))
  const [transitionError, setTransitionError] = useState<string | null>(null)
  const stage = journeyStage(learningState.stage)
  const pronunciationStatus = learningState.pronunciationStatus
  const perception = learningState.perception
  let practice: ReactNode

  if (learningState.stage === 'perception') {
    practice = <PerceptionPractice perception={loop.perception} onComplete={(result) => {
      const hasDiagnosticCue = getRelevantPronunciationCues(loop.pronunciationCues, result.diagnosticMissedItemIds).length > 0
      setLearningState(advanceLearningLoop(learningState, {
        type: 'COMPLETE_PERCEPTION',
        evidence: result,
        requiresPronunciationCue: hasDiagnosticCue
      }))
      setTransitionError(null)
    }} />
  } else if (learningState.stage === 'pronunciation-cue' && perception) {
    practice = <PronunciationCueCard cues={loop.pronunciationCues} missedItemIds={perception.diagnosticMissedItemIds} onComplete={() => {
      setLearningState(advanceLearningLoop(learningState, { type: 'ACKNOWLEDGE_CUES' }))
      setTransitionError(null)
    }} />
  } else if (learningState.stage === 'guided-shadowing') {
    practice = <GuidedShadowing chunks={loop.chunks} steps={loop.shadowingSteps} onComplete={(stepIds) => {
      let nextState
      try {
        nextState = advanceLearningLoop(learningState, { type: 'COMPLETE_SHADOWING', stepIds })
      } catch {
        setTransitionError('Không thể xác nhận Sentence chunks. Vui lòng hoàn thành đủ các bước theo đúng thứ tự.')
        return
      }

      const result = nextState.perception
      const finalPronunciationStatus = nextState.pronunciationStatus
      if (!result || finalPronunciationStatus === 'pending' || finalPronunciationStatus === 'recommended') {
        setTransitionError('Không thể xác nhận tiến trình luyện nói. Vui lòng bắt đầu lại phần luyện này.')
        return
      }

      setLearningState(nextState)
      setTransitionError(null)
      onComplete({
        perceptionPretestCorrect: result.pretestCorrect,
        perceptionPretestTotal: result.pretestTotal,
        perceptionPosttestCorrect: result.posttestCorrect,
        perceptionPosttestTotal: result.posttestTotal,
        perceptionTrainingCompleted: result.trainingCompleted,
        availableVariantCount: result.availableVariantCount,
        variabilityQualified: result.variabilityQualified,
        shadowingStepIds: nextState.completedShadowingSteps,
        listenedBack: false,
        listenBackChecklistCompleted: false,
        cueToSpeechStartMs: null,
        interactionTurnIds: [],
        optedOut: result.optedOut
      }, { pronunciationStatus: finalPronunciationStatus })
    }} />
  } else {
    practice = null
  }

  return (
    <div className="space-y-5">
      <LearningLoopProgress stage={stage} pronunciationStatus={pronunciationStatus} />
      {practice}
      {transitionError && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{transitionError}</p>}
    </div>
  )
}
