import { describe, expect, it } from 'vitest'
import {
  appendAttempt,
  assessTransfer,
  applyReviewResult,
  buildTodayQueue,
  createEmptyLessonProgress,
  scheduleTransferReview,
  type AttemptEvidence,
  type ProgressByLesson
} from '@/domain/progress/progress'

function attempt(index: number): AttemptEvidence {
  return {
    attemptId: `attempt-${index}`,
    lessonId: 'mission',
    taskId: 'task',
    capabilityId: 'workplace-communication',
    phase: 'retry',
    attemptedAt: new Date(Date.UTC(2026, 7, 18, 0, index)).toISOString(),
    durationSeconds: 60,
    wordCount: null,
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
}

describe('progress evidence and scheduling', () => {
  it('keeps aggregate count while bounding recent metadata to 50 attempts', () => {
    let progress = createEmptyLessonProgress()
    for (let index = 0; index < 52; index += 1) progress = appendAttempt(progress, attempt(index))

    expect(progress.attemptCount).toBe(52)
    expect(progress.recentAttempts).toHaveLength(50)
    expect(progress.recentAttempts[0].attemptId).toBe('attempt-2')
  })

  it('returns actionable reasons for rubric, independence and output-contract gaps', () => {
    const transfer = {
      ...attempt(1),
      phase: 'transfer' as const,
      wordCount: 20,
      durationSeconds: 200,
      rubric: { clarity: 'not-met' as const },
      independence: {
        ...attempt(1).independence,
        usedTranslation: true,
        hintCount: 2
      }
    }

    expect(assessTransfer(transfer, {
      expectedLessonId: 'mission',
      expectedTaskId: 'task',
      expectedCapabilityId: 'workplace-communication',
      forbidVietnamese: true,
      forbidTranslation: true,
      forbidModelAnswer: true,
      maxHints: 1,
      maxPreparationSeconds: 60,
      requiredRubricIds: ['clarity'],
      timeLimitSeconds: 120,
      minWords: 80,
      maxWords: 120
    })).toEqual({
      qualifies: false,
      reasons: ['rubric-gap', 'used-translation', 'too-many-hints', 'overtime', 'too-short']
    })
  })

  it('does not qualify a transfer that exceeds the preparation allowance', () => {
    const transfer = {
      ...attempt(1),
      phase: 'transfer' as const,
      independence: { ...attempt(1).independence, preparationSeconds: 61 }
    }

    expect(assessTransfer(transfer, {
      expectedLessonId: 'mission',
      expectedTaskId: 'task',
      expectedCapabilityId: 'workplace-communication',
      forbidVietnamese: true,
      forbidTranslation: true,
      forbidModelAnswer: true,
      maxHints: 0,
      maxPreparationSeconds: 60,
      requiredRubricIds: ['clarity'],
      timeLimitSeconds: 120
    })).toEqual({
      qualifies: false,
      reasons: ['preparation-overtime']
    })
  })

  it('allows declared assistance when the task independence contract permits it', () => {
    const transfer = {
      ...attempt(1),
      phase: 'transfer' as const,
      independence: {
        ...attempt(1).independence,
        usedVietnamese: true,
        usedTranslation: true,
        usedModelAnswer: true
      }
    }

    expect(assessTransfer(transfer, {
      expectedLessonId: 'mission',
      expectedTaskId: 'task',
      expectedCapabilityId: 'workplace-communication',
      forbidVietnamese: false,
      forbidTranslation: false,
      forbidModelAnswer: false,
      maxHints: 0,
      maxPreparationSeconds: 60,
      requiredRubricIds: ['clarity'],
      timeLimitSeconds: 120
    })).toEqual({ qualifies: true, reasons: [] })
  })

  it('does not qualify a pilot transfer without listen-back and scripted interaction evidence', () => {
    const transfer = {
      ...attempt(1),
      phase: 'transfer' as const,
      process: {
        perceptionPretestCorrect: 2,
        perceptionPretestTotal: 4,
        perceptionPosttestCorrect: 3,
        perceptionPosttestTotal: 4,
        perceptionTrainingCompleted: 6,
        availableVariantCount: 2,
        variabilityQualified: false,
        shadowingStepIds: ['listen'],
        listenedBack: false,
        listenBackChecklistCompleted: false,
        cueToSpeechStartMs: 1200,
        interactionTurnIds: ['clarify'],
        optedOut: false
      }
    }

    expect(assessTransfer(transfer, {
      expectedLessonId: 'mission',
      expectedTaskId: 'task',
      expectedCapabilityId: 'workplace-communication',
      forbidVietnamese: true,
      forbidTranslation: true,
      forbidModelAnswer: true,
      maxHints: 0,
      maxPreparationSeconds: 60,
      requiredRubricIds: ['clarity'],
      timeLimitSeconds: 120,
      requireListenBack: true,
      requiredInteractionTurnIds: ['clarify', 'repair']
    })).toEqual({
      qualifies: false,
      reasons: ['listen-back-missing', 'interaction-incomplete']
    })
  })

  it('fails closed when a transfer belongs to another task or uses a different rubric shape', () => {
    const transfer = { ...attempt(1), phase: 'transfer' as const }
    const contract = {
      expectedLessonId: 'mission',
      expectedTaskId: 'expected-task',
      expectedCapabilityId: 'workplace-communication' as const,
      forbidVietnamese: true,
      forbidTranslation: true,
      forbidModelAnswer: true,
      requiredRubricIds: ['action', 'clarity'],
      maxHints: 0,
      maxPreparationSeconds: 60,
      timeLimitSeconds: 120
    }

    expect(assessTransfer(transfer, contract)).toEqual({
      qualifies: false,
      reasons: ['task-mismatch', 'rubric-mismatch']
    })
    expect(assessTransfer({
      ...transfer,
      taskId: 'expected-task',
      rubric: { action: 'met', clarity: 'met', unexpected: 'met' }
    }, contract)).toEqual({
      qualifies: false,
      reasons: ['rubric-mismatch']
    })
  })

  it('fails closed when a transfer claims a different capability', () => {
    const transfer = {
      ...attempt(1),
      phase: 'transfer' as const,
      capabilityId: 'technical-reading' as const
    }

    expect(assessTransfer(transfer, {
      expectedLessonId: 'mission',
      expectedTaskId: 'task',
      expectedCapabilityId: 'workplace-communication',
      forbidVietnamese: true,
      forbidTranslation: true,
      forbidModelAnswer: true,
      requiredRubricIds: ['clarity'],
      maxHints: 0,
      maxPreparationSeconds: 60,
      timeLimitSeconds: 120
    })).toEqual({
      qualifies: false,
      reasons: ['capability-mismatch']
    })
  })

  it('uses content-owned review intervals and advances the stage on a passed review', () => {
    const originalTz = process.env.TZ
    process.env.TZ = 'UTC'
    try {
      const scheduled = scheduleTransferReview(
        createEmptyLessonProgress(), [1, 3, 7], new Date('2026-08-18T08:00:00.000Z')
      )
      expect(scheduled.nextReviewAt).toBe('2026-08-19T00:00:00.000Z')

      const failed = applyReviewResult(scheduled, false, [1, 3, 7], new Date('2026-08-19T08:00:00.000Z'))
      expect(failed.reviewStage).toBe(0)

      const passed = applyReviewResult(failed, true, [1, 3, 7], new Date('2026-08-20T08:00:00.000Z'))
      expect(passed.reviewStage).toBe(1)
      expect(passed.nextReviewAt).toBe('2026-08-23T00:00:00.000Z')
    } finally {
      if (originalTz === undefined) delete process.env.TZ
      else process.env.TZ = originalTz
    }
  })

  it('orders overdue review, active loop, missing baseline, then new lesson', () => {
    const progress: ProgressByLesson = {
      overdue: { ...createEmptyLessonProgress(), nextReviewAt: '2026-08-17T00:00:00.000Z' },
      active: { ...createEmptyLessonProgress(), status: 'in-progress', lastActivityAt: '2026-08-18T00:00:00.000Z' }
    }
    const items = buildTodayQueue([
      { lessonId: 'new', capabilityId: 'technical-reading', hasPerformanceTask: true },
      { lessonId: 'baseline', capabilityId: 'international-meetings', hasPerformanceTask: true },
      { lessonId: 'active', capabilityId: 'workplace-communication', hasPerformanceTask: true },
      { lessonId: 'overdue', capabilityId: 'technical-explanation', hasPerformanceTask: true }
    ], progress, new Date('2026-08-18T08:00:00.000Z'))

    expect(items.map((item) => item.kind)).toEqual(['review', 'resume', 'baseline', 'baseline'])
    expect(items[0].lessonId).toBe('overdue')
    expect(items[1].lessonId).toBe('active')
  })

  it('keeps completed missions out of Today until their review is due', () => {
    const progress: ProgressByLesson = {
      waiting: {
        ...createEmptyLessonProgress(),
        status: 'completed',
        transferCompleted: true,
        nextReviewAt: '2026-08-20T08:00:00.000Z'
      },
      due: {
        ...createEmptyLessonProgress(),
        status: 'completed',
        transferCompleted: true,
        nextReviewAt: '2026-08-18T07:00:00.000Z'
      }
    }
    const items = buildTodayQueue([
      { lessonId: 'waiting', capabilityId: 'workplace-communication', hasPerformanceTask: true },
      { lessonId: 'due', capabilityId: 'technical-reading', hasPerformanceTask: true }
    ], progress, new Date('2026-08-18T08:00:00.000Z'))

    expect(items.map((item) => item.lessonId)).toEqual(['due'])
    expect(items[0].kind).toBe('review')
  })
})
