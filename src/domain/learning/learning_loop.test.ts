import { describe, expect, it } from 'vitest'
import { advanceLearningLoop, createLearningLoopState } from './learning_loop'

describe('learning loop state', () => {
  it('requires perception, cue and shadowing before performance', () => {
    let state = createLearningLoopState()
    state = advanceLearningLoop(state, { type: 'COMPLETE_PRETEST', correct: 2, total: 4, missedItemIds: ['train-1'] })
    state = advanceLearningLoop(state, { type: 'COMPLETE_TRAINING', completed: 6, missedItemIds: [] })
    state = advanceLearningLoop(state, { type: 'COMPLETE_POSTTEST', correct: 3, total: 4, missedItemIds: ['post-1'] })
    expect(state.stage).toBe('pronunciation-cue')
    state = advanceLearningLoop(state, { type: 'ACKNOWLEDGE_CUES' })
    state = advanceLearningLoop(state, { type: 'COMPLETE_SHADOWING', stepIds: ['listen', 'delayed-imitation'] })
    expect(state.stage).toBe('ready-for-performance')
    expect(state.pretestCorrect).toBe(2)
    expect(state.posttestCorrect).toBe(3)
  })

  it('fails closed on an illegal phase jump and records accessible opt-out', () => {
    expect(() => advanceLearningLoop(createLearningLoopState(), { type: 'ACKNOWLEDGE_CUES' })).toThrow(/illegal/i)
    expect(advanceLearningLoop(createLearningLoopState(), { type: 'OPT_OUT' })).toMatchObject({
      stage: 'ready-for-performance', optedOut: true
    })
  })
})
