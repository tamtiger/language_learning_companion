import { describe, expect, it } from 'vitest'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { ProgressEnvelopeSchema, migrateProgressEnvelope } from '@/infrastructure/storage/progressStorage'

function envelope(inputProgress?: unknown) {
  return {
    storageVersion: 6,
    lessonProgress: {
      mission: { ...createEmptyLessonProgress(), ...(inputProgress === undefined ? {} : { inputProgress }) }
    },
    settings: { theme: 'dark' },
    storyBank: []
  }
}

const loopState = {
  stage: 'guided-shadowing',
  pronunciationStatus: 'completed',
  requiredShadowingStepIds: ['listen', 'chunk-shadow'],
  completedShadowingSteps: [],
  perception: {
    pretestCorrect: 3,
    pretestTotal: 4,
    trainingCompleted: 6,
    posttestCorrect: 4,
    posttestTotal: 4,
    diagnosticMissedItemIds: ['pre-1'],
    availableVariantCount: 3,
    variabilityQualified: true,
    optedOut: false
  }
}

describe('stored input progress', () => {
  it('accepts perception, shadowing, loop and reading ladder metadata', () => {
    const result = ProgressEnvelopeSchema.safeParse(envelope({
      loop: loopState,
      perception: { phase: 'training', index: 2, pretestCorrect: 3, posttestCorrect: 0, missedItemIds: ['pre-1'] },
      shadowingIndex: 1,
      ladder: { stage: 'extract', answers: { x1: 'cachectl migrate' } }
    }))
    expect(result.success).toBe(true)
  })

  it('keeps lesson progress without the field valid and does not invent it', () => {
    const result = migrateProgressEnvelope(envelope())
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.lessonProgress.mission.inputProgress).toBeUndefined()
  })

  it('rejects unknown fields, wrong types and out-of-range values', () => {
    const bad = [
      { perception: { phase: 'warmup', index: 0, pretestCorrect: 0, posttestCorrect: 0, missedItemIds: [] } },
      { perception: { phase: 'pretest', index: -1, pretestCorrect: 0, posttestCorrect: 0, missedItemIds: [] } },
      { perception: { phase: 'pretest', index: 0, pretestCorrect: 0, posttestCorrect: 0, missedItemIds: [], answerText: 'x' } },
      { ladder: { stage: 'apply', answers: { x1: 1 } } },
      { ladder: { stage: 'apply', answers: {}, draft: 'free text' } },
      { shadowingIndex: 1.5 },
      { loop: { ...loopState, stage: 'unknown' } },
      { transcript: 'free text' }
    ]
    for (const value of bad) {
      expect(ProgressEnvelopeSchema.safeParse(envelope(value)).success, JSON.stringify(value)).toBe(false)
    }
  })

  it('allows a loop that has not finished perception yet', () => {
    const result = ProgressEnvelopeSchema.safeParse(envelope({
      loop: { stage: 'perception', pronunciationStatus: 'pending', requiredShadowingStepIds: ['listen'], completedShadowingSteps: [], perception: null }
    }))
    expect(result.success).toBe(true)
  })
})
