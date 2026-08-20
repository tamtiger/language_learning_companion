import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyLessonProgress, type AttemptEvidence } from '../../domain/progress/progress'
import { createCapabilityBackup, parseCapabilityBackup, useAppStore } from './use_app_store'

function attempt(overrides: Partial<AttemptEvidence> = {}): AttemptEvidence {
  return {
    attemptId: 'attempt-1',
    lessonId: 'workplace-issue-update-b1',
    taskId: 'issue-update-task',
    capabilityId: 'workplace-communication',
    phase: 'performance',
    attemptedAt: '2026-08-18T08:00:00.000Z',
    durationSeconds: 75,
    wordCount: 48,
    rubric: { action: 'met' },
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount: 0,
      preparationSeconds: 22
    },
    completed: true,
    ...overrides
  }
}

describe('v5 app store', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('starts with only canonical progress state', () => {
    const state = useAppStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.lessonProgress).toEqual({})
    expect(state).not.toHaveProperty('completedLessons')
    expect(state).not.toHaveProperty('performanceProgress')
  })

  it('persists active phase and correct exercise ids', () => {
    const store = useAppStore.getState()
    store.setActivePhase('lesson-1', 'retry')
    store.markExerciseCorrect('lesson-1', 'exercise-1')
    store.markExerciseCorrect('lesson-1', 'exercise-1')

    expect(useAppStore.getState().lessonProgress['lesson-1']).toMatchObject({
      activePhase: 'retry',
      completedExerciseIds: ['exercise-1']
    })
  })

  it('keeps active learning-loop process metadata across backup without learner output', () => {
    const process = {
      perceptionPretestCorrect: 2,
      perceptionPretestTotal: 4,
      perceptionPosttestCorrect: 3,
      perceptionPosttestTotal: 4,
      perceptionTrainingCompleted: 6,
      availableVariantCount: 2,
      variabilityQualified: false,
      shadowingStepIds: ['listen', 'variation'],
      listenedBack: false,
      listenBackChecklistCompleted: false,
      cueToSpeechStartMs: null,
      interactionTurnIds: [],
      optedOut: false
    }

    useAppStore.getState().setActiveProcessEvidence('pilot', process)
    const backup = createCapabilityBackup(useAppStore.getState(), '2026-08-18T09:00:00.000Z')

    expect(backup.lessonProgress.pilot.activeProcessEvidence).toEqual(process)
    expect(JSON.stringify(backup)).not.toMatch(/audioUrl|responseText|transcript/i)
  })

  it('records measured attempts and clears phase after transfer', () => {
    useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'transfer' }), [1, 3, 7])
    const progress = useAppStore.getState().lessonProgress['workplace-issue-update-b1']
    expect(progress.recentAttempts[0]).toMatchObject({ durationSeconds: 75, wordCount: 48 })
    expect(progress.activePhase).toBeNull()
    expect(progress.nextReviewAt).toBe('2026-08-19T08:00:00.000Z')
    expect(JSON.stringify(progress)).not.toMatch(/responseText|audio|blob/i)
  })

  it('round-trips v5 backup and rejects v2 without replacing state', () => {
    useAppStore.setState({
      lessonProgress: { mission: { ...createEmptyLessonProgress(), activePhase: 'performance' } }
    })
    const backup = createCapabilityBackup(useAppStore.getState(), '2026-08-18T09:00:00.000Z')
    expect(backup.storageVersion).toBe(5)
    expect(parseCapabilityBackup(JSON.stringify(backup))).toEqual({ success: true, data: backup })
    expect(parseCapabilityBackup({ ...backup, storageVersion: 2 }).success).toBe(false)
    expect(useAppStore.getState().lessonProgress.mission.activePhase).toBe('performance')
  })

  it('restart clears lesson progress including completed exercises', () => {
    useAppStore.setState({
      lessonProgress: {
        lesson: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          completedExerciseIds: ['one', 'two']
        }
      }
    })
    useAppStore.getState().restartLesson('lesson')
    expect(useAppStore.getState().lessonProgress.lesson).toEqual(createEmptyLessonProgress())
  })
})
