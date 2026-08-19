import { describe, expect, it } from 'vitest'
import { createEmptyLessonProgress } from '../../domain/progress/progress'
import {
  ProgressEnvelopeSchema,
  createBackup,
  parseBackup,
  serializeBackup
} from './progress_storage'

function measuredAttempt() {
  return {
    attemptId: 'retry-1',
    lessonId: 'mission',
    taskId: 'task',
    capabilityId: 'workplace-communication' as const,
    phase: 'retry' as const,
    attemptedAt: '2026-08-18T09:00:00.000Z',
    durationSeconds: 60,
    wordCount: 42,
    rubric: { clarity: 'met' as const },
    focusCriterionId: 'clarity',
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount: 0,
      preparationSeconds: 18
    },
    completed: true
  }
}

describe('fresh progress storage v3', () => {
  it('rejects v2 instead of migrating pre-release data', () => {
    expect(ProgressEnvelopeSchema.safeParse({
      storageVersion: 2,
      lessonProgress: {},
      settings: { theme: 'dark' }
    }).success).toBe(false)
  })

  it('requires measured metadata and durable phase/exercise progress', () => {
    const progress = {
      ...createEmptyLessonProgress(),
      status: 'in-progress' as const,
      activePhase: 'retry' as const,
      completedExerciseIds: ['exercise-1'],
      attemptCount: 1,
      recentAttempts: [measuredAttempt()]
    }
    const result = ProgressEnvelopeSchema.safeParse({
      storageVersion: 3,
      lessonProgress: { mission: progress },
      settings: { theme: 'dark' }
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lessonProgress.mission.activePhase).toBe('retry')
      expect(result.data.lessonProgress.mission.recentAttempts[0].wordCount).toBe(42)
    }

    const missingWordCount = structuredClone(result.success ? result.data : {}) as Record<string, any>
    delete missingWordCount.lessonProgress.mission.recentAttempts[0].wordCount
    expect(ProgressEnvelopeSchema.safeParse(missingWordCount).success).toBe(false)
  })

  it('exports only strict allowlisted metadata', () => {
    const envelope = ProgressEnvelopeSchema.parse({
      storageVersion: 3,
      lessonProgress: {
        mission: {
          ...createEmptyLessonProgress(),
          attemptCount: 1,
          recentAttempts: [measuredAttempt()]
        }
      },
      settings: { theme: 'dark' }
    })
    const backup = createBackup(envelope, '2026-08-18T10:00:00.000Z')
    const serialized = serializeBackup(backup)
    expect(serialized).not.toMatch(/audio|blob|transcript|responseText|legacy-unknown/i)
    expect(parseBackup(serialized)).toEqual({ success: true, data: backup })

    const unsafe = JSON.parse(serialized) as Record<string, unknown>
    unsafe.responseText = 'private learner output'
    expect(parseBackup(unsafe).success).toBe(false)
  })
})
