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
})
