import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { buildEvidenceContract, contractRevision } from '@/domain/progress/evidenceContract'
import {
  addLocalDays,
  appendAttempt,
  applyReviewResult,
  applyTransferOutcome,
  assessReview,
  assessTransfer,
  buildTodayQueue,
  createEmptyLessonProgress,
  isLessonProgressStale,
  scheduleTransferReview,
  type AttemptEvidence,
  type EvidenceContract
} from '@/domain/progress/progress'

const contract: EvidenceContract = {
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
  minWords: 20,
  maxWords: 80
}

function attempt(phase: AttemptEvidence['phase'], overrides: Partial<AttemptEvidence> = {}): AttemptEvidence {
  return {
    attemptId: `${phase}-1`,
    lessonId: 'mission',
    taskId: 'task',
    capabilityId: 'workplace-communication',
    phase,
    attemptedAt: '2026-08-18T08:00:00.000Z',
    durationSeconds: 60,
    wordCount: 40,
    rubric: { clarity: 'met' },
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount: 0,
      preparationSeconds: 10
    },
    completed: true,
    ...overrides
  }
}

describe('transfer outcome', () => {
  const now = new Date('2026-08-18T08:00:00.000Z')

  it('keeps a failed transfer in the transfer phase without completing or scheduling review', () => {
    const failed = attempt('transfer', { rubric: { clarity: 'not-met' } })
    const assessment = assessTransfer(failed, contract)
    const before = {
      ...createEmptyLessonProgress(),
      status: 'in-progress' as const,
      activePhase: 'transfer' as const,
      reviewStage: 2,
      nextReviewAt: '2026-08-01T00:00:00.000Z'
    }
    const next = applyTransferOutcome(appendAttempt(before, failed), assessment, [1, 3, 7], now)

    expect(assessment.qualifies).toBe(false)
    expect(next.status).toBe('in-progress')
    expect(next.activePhase).toBe('transfer')
    expect(next.transferCompleted).toBe(false)
    expect(next.reviewStage).toBe(2)
    expect(next.nextReviewAt).toBe('2026-08-01T00:00:00.000Z')
    expect(next.attemptCount).toBe(1)
  })

  it('does not mark transferCompleted just because a transfer attempt was appended', () => {
    const next = appendAttempt(createEmptyLessonProgress(), attempt('transfer'))
    expect(next.transferCompleted).toBe(false)
  })

  it('completes and schedules the first review only for a qualifying transfer', () => {
    const passed = attempt('transfer')
    const assessment = assessTransfer(passed, contract)
    const next = applyTransferOutcome(
      appendAttempt({ ...createEmptyLessonProgress(), activePhase: 'transfer' }, passed),
      assessment,
      [1, 3, 7],
      now
    )

    expect(assessment.qualifies).toBe(true)
    expect(next.status).toBe('completed')
    expect(next.activePhase).toBeNull()
    expect(next.transferCompleted).toBe(true)
    expect(next.reviewStage).toBe(0)
    expect(next.nextReviewAt).toBe(addLocalDays(now, 1))
  })
})

describe('review assessment', () => {
  it('rejects an empty rubric', () => {
    expect(assessReview(attempt('review', { rubric: {} }), { ...contract, requiredRubricIds: [] })).toEqual({
      qualifies: false,
      reasons: ['rubric-not-rated']
    })
  })

  it('rejects a review that used assistance or broke the output contract', () => {
    const assessed = assessReview(attempt('review', {
      wordCount: 5,
      durationSeconds: 300,
      independence: {
        usedVietnamese: true,
        usedTranslation: false,
        usedModelAnswer: true,
        hintCount: 2,
        preparationSeconds: 10
      }
    }), contract)

    expect(assessed.qualifies).toBe(false)
    expect(assessed.reasons).toEqual(expect.arrayContaining([
      'used-vietnamese', 'used-model-answer', 'too-many-hints', 'overtime', 'too-short'
    ]))
  })

  it('accepts a fully met independent review and refuses other phases', () => {
    expect(assessReview(attempt('review'), contract)).toEqual({ qualifies: true, reasons: [] })
    expect(assessReview(attempt('retry'), contract).reasons).toContain('incomplete')
  })
})

describe('local calendar scheduling', () => {
  let originalTz: string | undefined
  beforeEach(() => { originalTz = process.env.TZ })
  afterEach(() => {
    if (originalTz === undefined) delete process.env.TZ
    else process.env.TZ = originalTz
  })

  it('makes a one-day review due at the next local midnight, not 24 hours later', () => {
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    const late = new Date(2026, 7, 18, 23, 59)
    const early = new Date(2026, 7, 19, 0, 1)

    expect(new Date(addLocalDays(late, 1)).getTime()).toBe(new Date(2026, 7, 19, 0, 0).getTime())
    expect(new Date(addLocalDays(early, 1)).getTime()).toBe(new Date(2026, 7, 20, 0, 0).getTime())
  })

  it('keeps local midnight across a daylight-saving change', () => {
    process.env.TZ = 'America/Los_Angeles'
    const due = new Date(addLocalDays(new Date(2026, 2, 7, 20, 0), 2))

    expect(due.getTime()).toBe(new Date(2026, 2, 9, 0, 0).getTime())
    expect(due.getHours()).toBe(0)
  })

  it('schedules the first review and failed-review repeat on local days', () => {
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    const scheduled = scheduleTransferReview(createEmptyLessonProgress(), [1, 3, 7], new Date(2026, 7, 18, 23, 50))
    expect(new Date(scheduled.nextReviewAt as string).getTime()).toBe(new Date(2026, 7, 19, 0, 0).getTime())

    const failed = applyReviewResult(scheduled, false, [1, 3, 7], new Date(2026, 7, 19, 9, 0))
    expect(new Date(failed.nextReviewAt as string).getTime()).toBe(new Date(2026, 7, 20, 0, 0).getTime())
    expect(failed.reviewStage).toBe(0)
  })
})

describe('today queue with a repeat in progress', () => {
  it('lists the due review and the repeat as separate items', () => {
    const items = buildTodayQueue([
      { lessonId: 'repeat', capabilityId: 'workplace-communication', hasPerformanceTask: true }
    ], {
      repeat: {
        ...createEmptyLessonProgress(),
        status: 'in-progress',
        activePhase: 'input',
        reviewStage: 1,
        nextReviewAt: '2026-08-17T00:00:00.000Z'
      }
    }, new Date('2026-08-18T08:00:00.000Z'))

    expect(items.map((item) => `${item.lessonId}:${item.kind}`)).toEqual(['repeat:review', 'repeat:resume'])
  })

  it('does not add a review item before the review is due', () => {
    const items = buildTodayQueue([
      { lessonId: 'repeat', capabilityId: 'workplace-communication', hasPerformanceTask: true }
    ], {
      repeat: {
        ...createEmptyLessonProgress(),
        status: 'in-progress',
        nextReviewAt: '2026-08-20T00:00:00.000Z'
      }
    }, new Date('2026-08-18T08:00:00.000Z'))

    expect(items.map((item) => item.kind)).toEqual(['resume'])
  })
})

describe('evidence contract', () => {
  const lessons = getBundledCatalog().lessons
  const spoken = lessons.find((lesson) => lesson.performanceTask?.mode === 'spoken')
  const written = lessons.find((lesson) => lesson.performanceTask?.mode === 'written')

  it('builds spoken and written contracts from the task', () => {
    const spokenTask = spoken?.performanceTask
    const writtenTask = written?.performanceTask
    if (spokenTask?.mode !== 'spoken' || writtenTask?.mode !== 'written' || !spoken || !written) {
      throw new Error('Catalog must contain a spoken and a written performance task')
    }

    expect(buildEvidenceContract(spoken)).toMatchObject({
      expectedLessonId: spoken.lessonId,
      expectedTaskId: spokenTask.id,
      requiredRubricIds: spokenTask.rubric.map((item) => item.id),
      timeLimitSeconds: spokenTask.outputContract.timeLimitSeconds,
      targetSeconds: spokenTask.outputContract.targetSeconds
    })
    expect(buildEvidenceContract(written)).toMatchObject({
      expectedLessonId: written.lessonId,
      minWords: writtenTask.outputContract.minWords,
      maxWords: writtenTask.outputContract.maxWords
    })
  })

  it('derives a stable revision that changes with the contract', () => {
    const reordered = Object.fromEntries(Object.entries(contract).reverse()) as unknown as EvidenceContract
    expect(contractRevision(reordered)).toBe(contractRevision(contract))
    expect(contractRevision({ ...contract, requiredRubricIds: ['clarity', 'tone'] })).not.toBe(contractRevision(contract))
    expect(contractRevision({ ...contract, timeLimitSeconds: 90 })).not.toBe(contractRevision(contract))
  })
})

describe('interleaved reviews in Today', () => {
  const due = (id: string, capabilityId: 'technical-reading' | 'international-meetings', day: number, interleave?: boolean) => ({
    item: { lessonId: id, capabilityId, hasPerformanceTask: true, ...(interleave === undefined ? {} : { interleave }) },
    progress: { ...createEmptyLessonProgress(), status: 'completed' as const, transferCompleted: true, nextReviewAt: `2026-08-0${day}T00:00:00.000Z` }
  })
  const now = new Date('2026-08-18T08:00:00.000Z')

  function queue(entries: ReturnType<typeof due>[]) {
    return buildTodayQueue(
      entries.map((entry) => entry.item),
      Object.fromEntries(entries.map((entry) => [entry.item.lessonId, entry.progress])),
      now
    ).map((item) => item.lessonId)
  }

  it('alternates capabilities when lessons opt in, keeping due order within a capability', () => {
    expect(queue([
      due('read-1', 'technical-reading', 1, true),
      due('read-2', 'technical-reading', 2, true),
      due('meet-1', 'international-meetings', 3, true)
    ])).toEqual(['read-1', 'meet-1', 'read-2'])
  })

  it('keeps the plain due-date order when the lessons do not opt in', () => {
    expect(queue([
      due('read-1', 'technical-reading', 1),
      due('read-2', 'technical-reading', 2),
      due('meet-1', 'international-meetings', 3)
    ])).toEqual(['read-1', 'read-2', 'meet-1'])
  })

  it('only reorders the opted-in reviews and leaves the other items in place', () => {
    const items = queue([
      due('read-1', 'technical-reading', 1, true),
      due('read-2', 'technical-reading', 2, true),
      due('meet-1', 'international-meetings', 3, true),
      { item: { lessonId: 'fresh', capabilityId: 'international-meetings' as const, hasPerformanceTask: true }, progress: createEmptyLessonProgress() } as unknown as ReturnType<typeof due>
    ])
    expect(items.at(-1)).toBe('fresh')
    expect(items.slice(0, 3)).toEqual(['read-1', 'meet-1', 'read-2'])
  })
})

describe('content revision of a lesson progress', () => {
  it('starts on revision 1 unless the lesson says otherwise', () => {
    expect(createEmptyLessonProgress().contentRevision).toBe(1)
    expect(createEmptyLessonProgress(3).contentRevision).toBe(3)
  })

  it('is stale only when the lesson has moved past the revision the cycle started on', () => {
    const progress = createEmptyLessonProgress(2)
    expect(isLessonProgressStale(progress, { contentRevision: 2 })).toBe(false)
    expect(isLessonProgressStale(progress, { contentRevision: 3 })).toBe(true)
    expect(isLessonProgressStale(progress, { contentRevision: 1 })).toBe(false)
  })
})