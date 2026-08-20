import { useState } from 'react'
import type { LearningLoopV1 } from '../../content/schema'
import type { AttemptProcessEvidence } from '../../domain/progress/progress'
import { GuidedShadowing } from './GuidedShadowing'
import { PerceptionPractice, type PerceptionResult } from './PerceptionPractice'
import { getRelevantPronunciationCues } from './learning_loop_diagnostics'
import { PronunciationCueCard } from './PronunciationCueCard'

type Stage = 'perception' | 'cue' | 'shadowing'

export function LearningLoopPractice({ loop, onComplete }: {
  loop: LearningLoopV1
  onComplete: (process: AttemptProcessEvidence) => void
}) {
  const [stage, setStage] = useState<Stage>('perception')
  const [perception, setPerception] = useState<PerceptionResult | null>(null)
  if (stage === 'perception') {
    return <PerceptionPractice perception={loop.perception} onComplete={(result) => {
      setPerception(result)
      const hasDiagnosticCue = getRelevantPronunciationCues(loop.pronunciationCues, result.diagnosticMissedItemIds).length > 0
      setStage(hasDiagnosticCue && !result.optedOut ? 'cue' : 'shadowing')
    }} />
  }
  if (stage === 'cue' && perception) {
    return <PronunciationCueCard cues={loop.pronunciationCues} missedItemIds={perception.diagnosticMissedItemIds} onComplete={() => setStage('shadowing')} />
  }
  return <GuidedShadowing chunks={loop.chunks} steps={loop.shadowingSteps} onComplete={(stepIds) => {
    const result = perception ?? {
      pretestCorrect: 0, pretestTotal: 0, trainingCompleted: 0, posttestCorrect: 0,
      posttestTotal: 0, diagnosticMissedItemIds: [], availableVariantCount: 0, variabilityQualified: false, optedOut: true
    }
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
    })
  }} />
}
