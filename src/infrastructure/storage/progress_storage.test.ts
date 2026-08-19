import { describe, expect, it } from 'vitest'
import {
  createBackup,
  migrateLegacyState,
  parseBackup,
  serializeBackup
} from './progress_storage'

describe('versioned progress storage', () => {
  it('migrates legacy aggregates without fabricating attempt evidence', () => {
    const migrated = migrateLegacyState({
      completedLessons: { legacy: true },
      incorrectAnswersLog: { legacy: ['q1'] },
      performanceProgress: {
        standup: {
          attemptCount: 2,
          lastAttemptAt: '2026-08-18T08:00:00.000Z',
          latestRubric: { clarity: true },
          transferCompleted: true
        }
      }
    })

    expect(migrated.storageVersion).toBe(2)
    expect(migrated.lessonProgress.legacy.status).toBe('completed')
    expect(migrated.lessonProgress.legacy.legacyImport?.incorrectExerciseIds).toEqual(['q1'])
    expect(migrated.lessonProgress.standup.attemptCount).toBe(2)
    expect(migrated.lessonProgress.standup.recentAttempts).toEqual([])
  })

  it('exports only allowlisted metadata and rejects a backup containing free text', () => {
    const backup = createBackup(migrateLegacyState({ completedLessons: { legacy: true } }), '2026-08-18T09:00:00.000Z')
    const serialized = serializeBackup(backup)
    expect(serialized).not.toMatch(/audio|blob|transcript|responseText/i)

    const parsed = JSON.parse(serialized) as Record<string, unknown>
    parsed.responseText = 'sensitive answer'
    expect(parseBackup(parsed).success).toBe(false)
  })

  it('round-trips an optional rubric focus while accepting older attempts without it', () => {
    const baseAttempt = {
      attemptId: 'retry-1',
      lessonId: 'mission',
      taskId: 'task',
      capabilityId: 'workplace-communication',
      phase: 'retry',
      attemptedAt: '2026-08-18T09:00:00.000Z',
      durationSeconds: 60,
      rubric: { clarity: 'met' },
      independence: {
        usedVietnamese: false,
        usedTranslation: false,
        usedModelAnswer: false,
        hintCount: 0,
        preparationSeconds: 30
      },
      completed: true
    }
    const backup = {
      storageVersion: 2,
      exportedAt: '2026-08-18T10:00:00.000Z',
      settings: { theme: 'dark' },
      lessonProgress: {
        mission: {
          status: 'in-progress',
          currentSectionId: null,
          completedSectionIds: [],
          attemptCount: 2,
          recentAttempts: [baseAttempt, { ...baseAttempt, attemptId: 'retry-2', focusCriterionId: 'clarity' }],
          transferCompleted: false,
          reviewStage: 0,
          nextReviewAt: null,
          lastActivityAt: '2026-08-18T09:00:00.000Z'
        }
      }
    }

    const result = parseBackup(backup)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lessonProgress.mission.recentAttempts[0]).not.toHaveProperty('focusCriterionId')
      expect(result.data.lessonProgress.mission.recentAttempts[1].focusCriterionId).toBe('clarity')
    }

    const unsafe = structuredClone(backup)
    Object.assign(unsafe.lessonProgress.mission.recentAttempts[1], { focusNote: 'private feedback' })
    expect(parseBackup(unsafe).success).toBe(false)
  })
})
