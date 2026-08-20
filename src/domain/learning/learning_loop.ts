export type LearningLoopStage =
  | 'perception-pretest'
  | 'perception-training'
  | 'perception-posttest'
  | 'pronunciation-cue'
  | 'guided-shadowing'
  | 'ready-for-performance'

export interface LearningLoopState {
  stage: LearningLoopStage
  pretestCorrect: number
  pretestTotal: number
  trainingCompleted: number
  posttestCorrect: number
  posttestTotal: number
  missedItemIds: string[]
  completedShadowingSteps: string[]
  optedOut: boolean
}
export function createLearningLoopState(): LearningLoopState {
  return {
    stage: 'perception-pretest',
    pretestCorrect: 0,
    pretestTotal: 0,
    trainingCompleted: 0,
    posttestCorrect: 0,
    posttestTotal: 0,
    missedItemIds: [],
    completedShadowingSteps: [],
    optedOut: false
  }
}

export type LearningLoopEvent =
  | { type: 'COMPLETE_PRETEST'; correct: number; total: number; missedItemIds: string[] }
  | { type: 'COMPLETE_TRAINING'; completed: number; missedItemIds: string[] }
  | { type: 'COMPLETE_POSTTEST'; correct: number; total: number; missedItemIds: string[] }
  | { type: 'ACKNOWLEDGE_CUES' }
  | { type: 'COMPLETE_SHADOWING'; stepIds: string[] }
  | { type: 'OPT_OUT' }

export function advanceLearningLoop(state: LearningLoopState, event: LearningLoopEvent): LearningLoopState {
  if (event.type === 'OPT_OUT') {
    return { ...state, stage: 'ready-for-performance', optedOut: true }
  }
  if (state.stage === 'perception-pretest' && event.type === 'COMPLETE_PRETEST') {
    return {
      ...state,
      stage: 'perception-training',
      pretestCorrect: event.correct,
      pretestTotal: event.total,
      missedItemIds: [...event.missedItemIds]
    }
  }
  if (state.stage === 'perception-training' && event.type === 'COMPLETE_TRAINING') {
    return {
      ...state,
      stage: 'perception-posttest',
      trainingCompleted: event.completed
    }
  }
  if (state.stage === 'perception-posttest' && event.type === 'COMPLETE_POSTTEST') {
    const missedItemIds = [...new Set([...state.missedItemIds, ...event.missedItemIds])]
    return {
      ...state,
      stage: missedItemIds.length > 0 ? 'pronunciation-cue' : 'guided-shadowing',
      posttestCorrect: event.correct,
      posttestTotal: event.total,
      missedItemIds
    }
  }
  if (state.stage === 'pronunciation-cue' && event.type === 'ACKNOWLEDGE_CUES') {
    return { ...state, stage: 'guided-shadowing' }
  }
  if (state.stage === 'guided-shadowing' && event.type === 'COMPLETE_SHADOWING') {
    return { ...state, stage: 'ready-for-performance', completedShadowingSteps: [...new Set(event.stepIds)] }
  }
  throw new Error(`Illegal learning-loop transition: ${state.stage} + ${event.type}`)
}
