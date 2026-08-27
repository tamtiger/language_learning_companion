import { describe, expect, it } from 'vitest'
import { advanceLearningLoop, createLearningLoopState } from './learning_loop'

const perception = {
  pretestCorrect: 2,
  pretestTotal: 4,
  trainingCompleted: 6,
  posttestCorrect: 3,
  posttestTotal: 4,
  diagnosticMissedItemIds: ['post-1'],
  availableVariantCount: 2,
  variabilityQualified: true,
  optedOut: false
}

function guidedState() {
  return advanceLearningLoop(createLearningLoopState(['listen', 'delayed-imitation']), {
    type: 'COMPLETE_PERCEPTION',
    evidence: perception,
    requiresPronunciationCue: false
  })
}

describe('learning loop state', () => {
  it('requires perception, cue and the configured shadowing sequence before performance', () => {
    let state = advanceLearningLoop(createLearningLoopState(['listen', 'delayed-imitation']), {
      type: 'COMPLETE_PERCEPTION',
      evidence: perception,
      requiresPronunciationCue: true
    })
    expect(state.stage).toBe('pronunciation-cue')
    expect(state.pronunciationStatus).toBe('recommended')

    state = advanceLearningLoop(state, { type: 'ACKNOWLEDGE_CUES' })
    state = advanceLearningLoop(state, {
      type: 'COMPLETE_SHADOWING',
      stepIds: ['listen', 'delayed-imitation']
    })

    expect(state.stage).toBe('ready-for-performance')
    expect(state.pronunciationStatus).toBe('completed')
    expect(state.perception).toMatchObject({ pretestCorrect: 2, posttestCorrect: 3 })
  })

  it('fails closed on an illegal phase jump and keeps perception opt-out accessible', () => {
    expect(() => advanceLearningLoop(
      createLearningLoopState(['listen']),
      { type: 'ACKNOWLEDGE_CUES' }
    )).toThrow(/illegal/i)

    const state = advanceLearningLoop(createLearningLoopState(['listen']), {
      type: 'COMPLETE_PERCEPTION',
      evidence: { ...perception, optedOut: true },
      requiresPronunciationCue: true
    })
    expect(state).toMatchObject({
      stage: 'guided-shadowing',
      pronunciationStatus: 'unavailable',
      perception: { optedOut: true }
    })
  })

  it.each([
    ['an arbitrary step', ['listen', 'unexpected-step']],
    ['a missing step', ['listen']],
    ['a duplicate step', ['listen', 'listen']],
    ['steps in a different order', ['delayed-imitation', 'listen']]
  ])('rejects %s instead of completing shadowing', (_case, stepIds) => {
    expect(() => advanceLearningLoop(guidedState(), {
      type: 'COMPLETE_SHADOWING',
      stepIds
    })).toThrow(/shadowing/i)
  })
})
