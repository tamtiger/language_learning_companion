import { useState, type ReactNode } from 'react'
import { AudioLines, CheckCircle2, Ear, MessageSquareQuote, Mic2, MinusCircle } from 'lucide-react'
import type { LearningLoopV1 } from '../../content/schema'
import type { AttemptProcessEvidence } from '../../domain/progress/progress'
import { GuidedShadowing } from './GuidedShadowing'
import { PerceptionPractice, type PerceptionResult } from './PerceptionPractice'
import { getRelevantPronunciationCues } from './learning_loop_diagnostics'
import { PronunciationCueCard } from './PronunciationCueCard'

export type LearningLoopStage = 'perception' | 'cue' | 'shadowing' | 'ready'
export type PronunciationStatus = 'pending' | 'recommended' | 'completed' | 'not-needed' | 'unavailable'

export interface LearningLoopSummary {
  pronunciationStatus: Exclude<PronunciationStatus, 'pending' | 'recommended'>
}

const JOURNEY_STEPS = [
  { id: 'perception', label: 'Nghe nhận diện', icon: Ear },
  { id: 'cue', label: 'Luyện phát âm', icon: AudioLines },
  { id: 'shadowing', label: 'Sentence chunks', icon: MessageSquareQuote },
  { id: 'ready', label: 'Lượt nói chính', icon: Mic2 }
] as const

function pronunciationDetail(status: PronunciationStatus): string {
  if (status === 'recommended') return 'Đang luyện theo lỗi nghe'
  if (status === 'completed') return 'Đã luyện bổ sung'
  if (status === 'not-needed') return 'Không cần luyện bổ sung'
  if (status === 'unavailable') return 'Đã bỏ qua cùng bài nghe'
  return 'Cá nhân hóa sau bài nghe'
}

export function LearningLoopProgress({ stage, pronunciationStatus }: {
  stage: LearningLoopStage
  pronunciationStatus: PronunciationStatus
}) {
  const activeIndex = JOURNEY_STEPS.findIndex((item) => item.id === stage)
  return (
    <nav aria-label="Tiến trình luyện nói" className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/60">
      <ol className="grid grid-cols-2 sm:grid-cols-4">
        {JOURNEY_STEPS.map(({ id, label, icon: Icon }, index) => {
          const skipped = id === 'cue'
            && (pronunciationStatus === 'not-needed' || pronunciationStatus === 'unavailable')
            && index < activeIndex
          const complete = index < activeIndex && !skipped
          const current = index === activeIndex
          const detail = id === 'cue'
            ? pronunciationDetail(pronunciationStatus)
            : current ? 'Đang thực hiện' : complete ? 'Đã hoàn thành' : 'Tiếp theo'
          const StatusIcon = complete ? CheckCircle2 : skipped ? MinusCircle : Icon
          return (
            <li key={id} className={`min-h-24 border-b border-r border-zinc-800 p-3 last:border-r-0 sm:border-b-0 ${current ? 'bg-cyan-500/10 text-cyan-100' : complete ? 'text-green-300' : skipped ? 'text-zinc-300' : 'text-zinc-500'}`}>
              <StatusIcon aria-hidden="true" className="h-4 w-4" />
              <span aria-current={current ? 'step' : undefined} className="mt-2 block text-xs font-bold leading-tight">{label}</span>
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
  const [stage, setStage] = useState<LearningLoopStage>('perception')
  const [pronunciationStatus, setPronunciationStatus] = useState<PronunciationStatus>('pending')
  const [perception, setPerception] = useState<PerceptionResult | null>(null)
  let practice: ReactNode

  if (stage === 'perception') {
    practice = <PerceptionPractice perception={loop.perception} onComplete={(result) => {
      setPerception(result)
      const hasDiagnosticCue = getRelevantPronunciationCues(loop.pronunciationCues, result.diagnosticMissedItemIds).length > 0
      setPronunciationStatus(hasDiagnosticCue && !result.optedOut
        ? 'recommended'
        : result.optedOut ? 'unavailable' : 'not-needed')
      setStage(hasDiagnosticCue && !result.optedOut ? 'cue' : 'shadowing')
    }} />
  } else if (stage === 'cue' && perception) {
    practice = <PronunciationCueCard cues={loop.pronunciationCues} missedItemIds={perception.diagnosticMissedItemIds} onComplete={() => {
      setPronunciationStatus('completed')
      setStage('shadowing')
    }} />
  } else {
    practice = <GuidedShadowing chunks={loop.chunks} steps={loop.shadowingSteps} onComplete={(stepIds) => {
      const result = perception ?? {
        pretestCorrect: 0, pretestTotal: 0, trainingCompleted: 0, posttestCorrect: 0,
        posttestTotal: 0, diagnosticMissedItemIds: [], availableVariantCount: 0,
        variabilityQualified: false, optedOut: true
      }
      const finalPronunciationStatus = pronunciationStatus === 'pending' || pronunciationStatus === 'recommended'
        ? 'unavailable' : pronunciationStatus
      onComplete({
        perceptionPretestCorrect: result.pretestCorrect,
        perceptionPretestTotal: result.pretestTotal,
        perceptionPosttestCorrect: result.posttestCorrect,
        perceptionPosttestTotal: result.posttestTotal,
        perceptionTrainingCompleted: result.trainingCompleted,
        availableVariantCount: result.availableVariantCount,
        variabilityQualified: result.variabilityQualified,
        shadowingStepIds: stepIds,
        listenedBack: false,
        listenBackChecklistCompleted: false,
        cueToSpeechStartMs: null,
        interactionTurnIds: [],
        optedOut: result.optedOut
      }, { pronunciationStatus: finalPronunciationStatus })
    }} />
  }

  return (
    <div className="space-y-5">
      <LearningLoopProgress stage={stage} pronunciationStatus={pronunciationStatus} />
      {practice}
    </div>
  )
}
