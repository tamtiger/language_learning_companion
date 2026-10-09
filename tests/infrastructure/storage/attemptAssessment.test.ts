import { describe, expect, it } from 'vitest'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { ProgressEnvelopeSchema, migrateProgressEnvelope } from '@/infrastructure/storage/progressStorage'

function attempt(extra: Record<string, unknown> = {}) {
  return {
    attemptId: 'transfer-1',
    lessonId: 'mission',
    taskId: 'task',
    capabilityId: 'workplace-communication',
    phase: 'transfer',
    attemptedAt: '2026-08-18T09:00:00.000Z',
    durationSeconds: 60,
    wordCount: 42,
    rubric: { clarity: 'met' },
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount: 0,
      preparationSeconds: 18
    },
    process: null,
    completed: true,
    ...extra
  }
}

function envelope(attempts: unknown[]) {
  return {
    storageVersion: 6,
    lessonProgress: {
      mission: { ...createEmptyLessonProgress(), attemptCount: attempts.length, recentAttempts: attempts }
    },
    settings: { theme: 'dark' },
    storyBank: []
  }
}

describe('stored attempt assessment', () => {
  it('accepts an assessment with a content revision on a v5 attempt', () => {
    const result = ProgressEnvelopeSchema.safeParse(envelope([
      attempt({ assessment: { qualifies: false, reasons: ['rubric-gap', 'overtime'] }, contentRevision: 'c1-0a1b2c3d' })
    ]))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lessonProgress.mission.recentAttempts[0].assessment).toEqual({
        qualifies: false,
        reasons: ['rubric-gap', 'overtime']
      })
    }
  })

  it('keeps attempts without an assessment valid and does not invent one', () => {
    const result = migrateProgressEnvelope(envelope([attempt()]))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lessonProgress.mission.recentAttempts[0].assessment).toBeUndefined()
      expect(result.data.lessonProgress.mission.recentAttempts[0].contentRevision).toBeUndefined()
    }
  })

  it('rejects an unknown reason, a missing qualifies flag and a stray assessment field', () => {
    for (const assessment of [
      { qualifies: false, reasons: ['made-up'] },
      { reasons: [] },
      { qualifies: true, reasons: [], score: 9 }
    ]) {
      expect(ProgressEnvelopeSchema.safeParse(envelope([attempt({ assessment })])).success).toBe(false)
    }
  })

  it('does not add an assessment when migrating a v4 envelope', () => {
    const v4Attempt = { ...attempt(), process: null }
    const v4 = {
      storageVersion: 4,
      lessonProgress: {
        mission: {
          ...(({ activeProcessEvidence: _ignored, contentRevision: _revision, ...rest }) => rest)(createEmptyLessonProgress()),
          attemptCount: 1,
          recentAttempts: [v4Attempt]
        }
      },
      settings: { theme: 'dark' }
    }
    const result = migrateProgressEnvelope(v4)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.lessonProgress.mission.recentAttempts[0].assessment).toBeUndefined()
    }
  })
})
