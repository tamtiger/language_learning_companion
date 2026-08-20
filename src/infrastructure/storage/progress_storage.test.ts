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
    process: null,
    completed: true
  }
}

describe('progress storage v5', () => {
  it('rejects v2 and migrates a valid v3 backup without learner output', () => {
    expect(ProgressEnvelopeSchema.safeParse({
      storageVersion: 2,
      lessonProgress: {},
      settings: { theme: 'dark' }
    }).success).toBe(false)

    const legacyAttempt = measuredAttempt() as Record<string, unknown>
    delete legacyAttempt.process
    const legacyProgress = structuredClone(createEmptyLessonProgress()) as unknown as Record<string, unknown>
    delete legacyProgress.activeProcessEvidence
    const legacy = {
      storageVersion: 3,
      exportedAt: '2026-08-18T10:00:00.000Z',
      lessonProgress: {
        mission: { ...legacyProgress, attemptCount: 1, recentAttempts: [legacyAttempt] }
      },
      settings: { theme: 'dark' }
    }
    const migrated = parseBackup(legacy)
    expect(migrated.success).toBe(true)
    if (migrated.success) {
      expect(migrated.data.storageVersion).toBe(5)
      expect(migrated.data.lessonProgress.mission.recentAttempts[0].process).toBeNull()
    }
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
      storageVersion: 5,
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
      storageVersion: 5,
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

  it('accepts measured process metadata and rejects learner media fields', () => {
    const process = {
      perceptionPretestCorrect: 2,
      perceptionPretestTotal: 4,
      perceptionPosttestCorrect: 4,
      perceptionPosttestTotal: 4,
      perceptionTrainingCompleted: 6,
      availableVariantCount: 1,
      variabilityQualified: false,
      shadowingStepIds: ['listen', 'chunk-shadow', 'full-shadow', 'delayed-imitation', 'variation'],
      listenedBack: true,
      listenBackChecklistCompleted: true,
      cueToSpeechStartMs: 3200,
      interactionTurnIds: ['clarify', 'repair'],
      optedOut: false
    }
    const attempt = { ...measuredAttempt(), process }
    const valid = ProgressEnvelopeSchema.safeParse({
      storageVersion: 5,
      lessonProgress: {
        mission: { ...createEmptyLessonProgress(), attemptCount: 1, recentAttempts: [attempt] }
      },
      settings: { theme: 'dark' }
    })
    expect(valid.success).toBe(true)

    const unsafe = structuredClone(attempt) as Record<string, unknown>
    unsafe.audioUrl = 'blob:private-recording'
    expect(ProgressEnvelopeSchema.safeParse({
      storageVersion: 5,
      lessonProgress: {
        mission: { ...createEmptyLessonProgress(), attemptCount: 1, recentAttempts: [unsafe] }
      },
      settings: { theme: 'dark' }
    }).success).toBe(false)
  })

  it('migrates a v4 backup with no active process evidence into v5', () => {
    const legacyProcess = {
      perceptionPretestCorrect: 2,
      perceptionPretestTotal: 4,
      perceptionPosttestCorrect: 3,
      perceptionPosttestTotal: 4,
      perceptionTrainingCompleted: 6,
      availableVariantCount: 2,
      variabilityQualified: false,
      shadowingStepIds: ['listen'],
      listenedBack: true,
      cueToSpeechStartMs: 1200,
      interactionTurnIds: ['clarify'],
      optedOut: false
    }
    const legacyProgress = structuredClone(createEmptyLessonProgress()) as unknown as Record<string, unknown>
    delete legacyProgress.activeProcessEvidence
    const legacy = {
      storageVersion: 4,
      exportedAt: '2026-08-18T10:00:00.000Z',
      lessonProgress: {
        mission: {
          ...legacyProgress,
          attemptCount: 1,
          recentAttempts: [{ ...measuredAttempt(), process: legacyProcess }]
        }
      },
      settings: { theme: 'dark' }
    }
    const migrated = parseBackup(legacy)
    expect(migrated.success).toBe(true)
    if (migrated.success) {
      expect(migrated.data.storageVersion).toBe(5)
      expect(migrated.data.lessonProgress.mission.activeProcessEvidence).toBeNull()
      expect(migrated.data.lessonProgress.mission.recentAttempts[0].process?.listenBackChecklistCompleted).toBe(false)
    }
  })
})
