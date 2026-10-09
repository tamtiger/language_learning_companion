import type { LearningLoopV1 } from '../../content/schema'

export type PerceptionPhase = 'pretest' | 'training' | 'posttest'

export function recordPerceptionMiss(current: string[], phase: PerceptionPhase, itemId: string): string[] {
  return phase === 'training' ? current : [...current, itemId]
}

export function getRelevantPronunciationCues(
  cues: LearningLoopV1['pronunciationCues'],
  diagnosticMissedItemIds: string[]
) {
  return cues.filter((cue) => cue.triggerItemIds.some((id) => diagnosticMissedItemIds.includes(id)))
}
