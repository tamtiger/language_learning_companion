export type LearningLoopStage =
  | 'perception'
  | 'pronunciation-cue'
  | 'guided-shadowing'
  | 'ready-for-performance'

export type PronunciationStatus = 'pending' | 'recommended' | 'completed' | 'not-needed' | 'unavailable'

export interface LearningLoopPerceptionEvidence {
  pretestCorrect: number
  pretestTotal: number
  trainingCompleted: number
  posttestCorrect: number
  posttestTotal: number
  diagnosticMissedItemIds: string[]
  availableVariantCount: number
  variabilityQualified: boolean
  optedOut: boolean
}

export interface LearningLoopState {
  stage: LearningLoopStage
  pronunciationStatus: PronunciationStatus
  requiredShadowingStepIds: string[]
  completedShadowingSteps: string[]
  perception: LearningLoopPerceptionEvidence | null
}

export function createLearningLoopState(requiredShadowingStepIds: readonly string[]): LearningLoopState {
  if (requiredShadowingStepIds.length === 0 || new Set(requiredShadowingStepIds).size !== requiredShadowingStepIds.length) {
    throw new Error('Required shadowing step IDs must be non-empty and unique')
  }
  return {
    stage: 'perception',
    pronunciationStatus: 'pending',
    requiredShadowingStepIds: [...requiredShadowingStepIds],
    completedShadowingSteps: [],
    perception: null
  }
}

export type LearningLoopEvent =
  | {
    type: 'COMPLETE_PERCEPTION'
    evidence: LearningLoopPerceptionEvidence
    requiresPronunciationCue: boolean
  }
  | { type: 'ACKNOWLEDGE_CUES' }
  | { type: 'COMPLETE_SHADOWING'; stepIds: string[] }

export function advanceLearningLoop(state: LearningLoopState, event: LearningLoopEvent): LearningLoopState {
  if (state.stage === 'perception' && event.type === 'COMPLETE_PERCEPTION') {
    const needsCue = event.requiresPronunciationCue && !event.evidence.optedOut
    return {
      ...state,
      stage: needsCue ? 'pronunciation-cue' : 'guided-shadowing',
      pronunciationStatus: needsCue ? 'recommended' : event.evidence.optedOut ? 'unavailable' : 'not-needed',
      perception: {
        ...event.evidence,
        diagnosticMissedItemIds: [...event.evidence.diagnosticMissedItemIds]
      }
    }
  }
  if (state.stage === 'pronunciation-cue' && event.type === 'ACKNOWLEDGE_CUES') {
    return { ...state, stage: 'guided-shadowing', pronunciationStatus: 'completed' }
  }
  if (state.stage === 'guided-shadowing' && event.type === 'COMPLETE_SHADOWING') {
    if (new Set(event.stepIds).size !== event.stepIds.length) {
      throw new Error('Invalid shadowing completion: step IDs must be unique')
    }
    const matchesConfiguredSequence = event.stepIds.length === state.requiredShadowingStepIds.length
      && event.stepIds.every((stepId, index) => stepId === state.requiredShadowingStepIds[index])
    if (!matchesConfiguredSequence) {
      throw new Error('Invalid shadowing completion: completed steps must match the configured sequence')
    }
    return { ...state, stage: 'ready-for-performance', completedShadowingSteps: [...event.stepIds] }
  }
  throw new Error(`Illegal learning-loop transition: ${state.stage} + ${event.type}`)
}
