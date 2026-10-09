import { describe, expect, it } from 'vitest'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import {
  ProgressEnvelopeSchema,
  migrateProgressEnvelope,
  parseBackup
} from '@/infrastructure/storage/progressStorage'

const attempt = {
  attemptId: 'transfer-1',
  lessonId: 'mission',
  taskId: 'task',
  capabilityId: 'workplace-communication',
  phase: 'transfer',
  attemptedAt: '2026-08-18T09:00:00.000Z',
  durationSeconds: 60,
  wordCount: 42,
  rubric: { clarity: 'met' },
  independence: { usedVietnamese: false, usedTranslation: false, usedModelAnswer: false, hintCount: 0, preparationSeconds: 18 },
  process: null,
  assessment: { qualifies: true, reasons: [] },
  contentRevision: 'c1-0a1b2c3d',
  completed: true
}

/** A lesson progress as it was stored before storage version 6 (no contentRevision). */
function legacyProgress(overrides: Record<string, unknown> = {}) {
  const { contentRevision: _revision, ...rest } = createEmptyLessonProgress() as unknown as Record<string, unknown>
  return { ...rest, status: 'completed', attemptCount: 1, recentAttempts: [attempt], reviewStage: 2, nextReviewAt: '2026-09-01T00:00:00.000Z', completedExerciseIds: ['e1'], ...overrides }
}

function v5() {
  return { storageVersion: 5, lessonProgress: { mission: legacyProgress(), other: legacyProgress({ status: 'in-progress', activePhase: 'input' }) }, settings: { theme: 'light' } }
}

function v4() {
  const strip = (progress: Record<string, unknown>) => {
    const { activeProcessEvidence: _a, inputProgress: _i, ...rest } = progress
    const { assessment: _assessment, contentRevision: _revision, ...v4Attempt } = attempt
    return { ...rest, recentAttempts: [v4Attempt] }
  }
  return { storageVersion: 4, lessonProgress: { mission: strip(legacyProgress()) }, settings: { theme: 'dark' } }
}

function v3() {
  const envelope = v4()
  const { process: _p, ...legacyAttempt } = (envelope.lessonProgress.mission.recentAttempts as Record<string, unknown>[])[0]
  return { ...envelope, storageVersion: 3, lessonProgress: { mission: { ...envelope.lessonProgress.mission, recentAttempts: [legacyAttempt] } } }
}

describe('storage version 6', () => {
  it('migrates a v5 envelope by adding contentRevision 1 and an empty story bank, keeping everything else', () => {
    const result = migrateProgressEnvelope(v5())

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.storageVersion).toBe(6)
    expect(result.data.storyBank).toEqual([])
    for (const [lessonId, migrated] of Object.entries(result.data.lessonProgress)) {
      const { contentRevision, ...rest } = migrated
      expect(contentRevision).toBe(1)
      const original = (v5().lessonProgress as Record<string, Record<string, unknown>>)[lessonId]
      expect(rest).toMatchObject({ status: original.status, reviewStage: original.reviewStage, completedExerciseIds: original.completedExerciseIds })
      expect(rest.recentAttempts[0]).toMatchObject({ attemptId: 'transfer-1', assessment: { qualifies: true, reasons: [] }, contentRevision: 'c1-0a1b2c3d' })
    }
    expect(result.data.settings.theme).toBe('light')
  })

  it('migrates v4 and v3 envelopes all the way to v6 without losing attempts', () => {
    for (const legacy of [v4(), v3()]) {
      const result = migrateProgressEnvelope(legacy)
      expect(result.success, `v${legacy.storageVersion}`).toBe(true)
      if (!result.success) continue
      expect(result.data.storageVersion).toBe(6)
      expect(result.data.lessonProgress.mission.contentRevision).toBe(1)
      expect(result.data.lessonProgress.mission.recentAttempts).toHaveLength(1)
      expect(result.data.storyBank).toEqual([])
    }
  })

  it('accepts a v6 envelope and keeps a recorded revision above one', () => {
    const migrated = migrateProgressEnvelope(v5())
    if (!migrated.success) throw new Error('migration failed')
    const bumped = structuredClone(migrated.data)
    bumped.lessonProgress.mission.contentRevision = 4

    const again = migrateProgressEnvelope(bumped)
    expect(again.success).toBe(true)
    if (again.success) expect(again.data.lessonProgress.mission.contentRevision).toBe(4)
  })

  it('requires contentRevision on v6 lesson progress and a positive integer', () => {
    const migrated = migrateProgressEnvelope(v5())
    if (!migrated.success) throw new Error('migration failed')
    const missing = structuredClone(migrated.data) as unknown as { lessonProgress: { mission: Record<string, unknown> } }
    delete missing.lessonProgress.mission.contentRevision
    expect(ProgressEnvelopeSchema.safeParse(missing).success).toBe(false)

    const zero = structuredClone(migrated.data)
    zero.lessonProgress.mission.contentRevision = 0
    expect(ProgressEnvelopeSchema.safeParse(zero).success).toBe(false)
  })

  it('rejects storage versions outside 3 to 6', () => {
    for (const storageVersion of [2, 7, 99]) {
      expect(migrateProgressEnvelope({ ...v5(), storageVersion }).success, String(storageVersion)).toBe(false)
    }
  })
})

describe('backups of every supported version', () => {
  it('imports v3, v4, v5 and v6 backups and always returns a v6 backup', () => {
    const exportedAt = '2026-08-19T00:00:00.000Z'
    const v6Source = migrateProgressEnvelope(v5())
    if (!v6Source.success) throw new Error('migration failed')

    for (const envelope of [v3(), v4(), v5(), v6Source.data]) {
      const result = parseBackup({ ...envelope, exportedAt })
      expect(result.success, `v${envelope.storageVersion}`).toBe(true)
      if (!result.success) continue
      expect(result.data.storageVersion).toBe(6)
      expect(result.data.exportedAt).toBe(exportedAt)
    }
  })

  it('rejects an unsupported version without partial recovery', () => {
    expect(parseBackup({ ...v5(), storageVersion: 7, exportedAt: '2026-08-19T00:00:00.000Z' }).success).toBe(false)
    expect(parseBackup({ ...v5(), storageVersion: 2, exportedAt: '2026-08-19T00:00:00.000Z' }).success).toBe(false)
  })
})

describe('story bank storage', () => {
  function withStories(storyBank: unknown) {
    const migrated = migrateProgressEnvelope(v5())
    if (!migrated.success) throw new Error('migration failed')
    return { ...migrated.data, storyBank }
  }
  const story = (id: string, extra: Record<string, unknown> = {}) => ({
    id, label: 'Fixed the checkout outage', competencyIds: ['ownership'], createdAt: '2026-08-18T09:00:00.000Z', lastPracticedAt: null, ...extra
  })

  it('stores only metadata: a short label, competencies and times', () => {
    expect(ProgressEnvelopeSchema.safeParse(withStories([story('s1'), story('s2', { lastPracticedAt: '2026-08-19T09:00:00.000Z' })])).success).toBe(true)
  })

  it('rejects story text, long labels, unknown competencies and duplicate ids', () => {
    for (const bad of [
      [story('s1', { body: 'The full story text.' })],
      [story('s1', { label: 'x'.repeat(61) })],
      [story('s1', { label: '  ' })],
      [story('s1', { competencyIds: [] })],
      [story('s1', { competencyIds: ['ownership', 'conflict', 'failure', 'leadership', 'ambiguity'] })],
      [story('s1', { competencyIds: ['charisma'] })],
      [story('s1'), story('s1')]
    ]) {
      expect(ProgressEnvelopeSchema.safeParse(withStories(bad)).success, JSON.stringify(bad)).toBe(false)
    }
  })

  it('holds at most thirty stories', () => {
    const many = (count: number) => Array.from({ length: count }, (_, index) => story(`s${index}`))
    expect(ProgressEnvelopeSchema.safeParse(withStories(many(30))).success).toBe(true)
    expect(ProgressEnvelopeSchema.safeParse(withStories(many(31))).success).toBe(false)
  })
})
