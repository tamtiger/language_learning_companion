import { describe, it, expect, beforeEach } from 'vitest'
import {
  createProgressBackup,
  migratePersistedAppState,
  parseProgressBackup,
  useAppStore
} from './use_app_store'

describe('useAppStore Zustand Store', () => {
  beforeEach(() => {
    // Reset store state trước mỗi bài test
    useAppStore.getState().resetProgress()
  })

  it('should have correct initial state', () => {
    const state = useAppStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.currentCefrLevel).toBeNull()
    expect(state.activeLessonId).toBeNull()
    expect(state.completedLessons).toEqual({})
    expect(state.incorrectAnswersLog).toEqual({})
    expect(state.performanceProgress).toEqual({})
  })

  it('should allow setting CEFR level', () => {
    useAppStore.getState().setCefrLevel('B2')
    expect(useAppStore.getState().currentCefrLevel).toBe('B2')
  })

  it('should allow marking a lesson complete', () => {
    useAppStore.getState().markLessonComplete('lesson-01', true)
    expect(useAppStore.getState().completedLessons['lesson-01']).toBe(true)
  })

  it('should allow logging incorrect answers without duplication', () => {
    useAppStore.getState().logIncorrectAnswer('lesson-01', 'exercise-01')
    useAppStore.getState().logIncorrectAnswer('lesson-01', 'exercise-01') // duplicate log
    useAppStore.getState().logIncorrectAnswer('lesson-01', 'exercise-02')

    expect(useAppStore.getState().incorrectAnswersLog['lesson-01']).toEqual([
      'exercise-01',
      'exercise-02'
    ])
  })

  it('should clear progress when calling resetProgress', () => {
    const store = useAppStore.getState()
    store.setCefrLevel('B1')
    store.markLessonComplete('lesson-01', true)
    store.logIncorrectAnswer('lesson-01', 'exercise-01')
    store.recordPerformanceAttempt({
      lessonId: 'lesson-01',
      rubricAnswers: { structure: true },
      isTransfer: false,
      attemptedAt: '2026-08-18T08:00:00.000Z'
    })

    store.resetProgress()

    const state = useAppStore.getState()
    expect(state.currentCefrLevel).toBeNull()
    expect(state.completedLessons).toEqual({})
    expect(state.incorrectAnswersLog).toEqual({})
    expect(state.performanceProgress).toEqual({})
  })

  it('should persist attempt metadata without media data', () => {
    const store = useAppStore.getState()

    store.recordPerformanceAttempt({
      lessonId: 'daily-standup-b1',
      rubricAnswers: { structure: true, clarity: false },
      isTransfer: false,
      attemptedAt: '2026-08-18T08:00:00.000Z'
    })
    store.recordPerformanceAttempt({
      lessonId: 'daily-standup-b1',
      rubricAnswers: { structure: true, clarity: true },
      isTransfer: true,
      attemptedAt: '2026-08-18T08:03:00.000Z'
    })

    expect(useAppStore.getState().performanceProgress['daily-standup-b1']).toEqual({
      attemptCount: 2,
      lastAttemptAt: '2026-08-18T08:03:00.000Z',
      latestRubric: { structure: true, clarity: true },
      transferCompleted: true
    })
    expect(useAppStore.getState().performanceProgress['daily-standup-b1']).not.toHaveProperty('audio')
  })

  it('records canonical capability evidence and schedules transfer review', () => {
    useAppStore.getState().recordCapabilityAttempt({
      attemptId: 'transfer-1',
      lessonId: 'workplace-issue-update-b1',
      taskId: 'issue-update-task',
      capabilityId: 'workplace-communication',
      phase: 'transfer',
      attemptedAt: '2026-08-18T08:00:00.000Z',
      durationSeconds: 120,
      rubric: { action: 'met' },
      independence: {
        usedVietnamese: false,
        usedTranslation: false,
        usedModelAnswer: false,
        hintCount: 0,
        preparationSeconds: 60
      },
      completed: true
    }, [1, 3, 7])

    const progress = useAppStore.getState().lessonProgress['workplace-issue-update-b1']
    expect(progress.attemptCount).toBe(1)
    expect(progress.transferCompleted).toBe(true)
    expect(progress.nextReviewAt).toBe('2026-08-19T08:00:00.000Z')
    expect(JSON.stringify(progress)).not.toMatch(/responseText|audio|blob/i)
  })

  it('should migrate persisted state that predates performance progress', () => {
    const migrated = migratePersistedAppState({
      completedLessons: { 'lesson-01': true },
      incorrectAnswersLog: {}
    })

    expect(migrated.completedLessons).toEqual({ 'lesson-01': true })
    expect(migrated.performanceProgress).toEqual({})
  })

  it('should import an old backup with empty performance progress', () => {
    const result = parseProgressBackup({
      completedLessons: { 'lesson-01': true },
      incorrectAnswersLog: { 'lesson-01': ['exercise-01'] }
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.performanceProgress).toEqual({})
    }
  })

  it('should round-trip performance progress in backup JSON', () => {
    const backup = createProgressBackup({
      completedLessons: { 'daily-standup-b1': true },
      incorrectAnswersLog: {},
      performanceProgress: {
        'daily-standup-b1': {
          attemptCount: 2,
          lastAttemptAt: '2026-08-18T08:03:00.000Z',
          latestRubric: { structure: true, clarity: false },
          transferCompleted: true
        }
      }
    }, '2026-08-18T09:00:00.000Z')
    const result = parseProgressBackup(JSON.stringify(backup))

    expect(result).toEqual({ success: true, data: backup })
  })

  it('should reject an invalid backup instead of returning partial data', () => {
    const result = parseProgressBackup({
      completedLessons: { 'lesson-01': 'yes' },
      incorrectAnswersLog: {}
    })

    expect(result.success).toBe(false)
  })
})
