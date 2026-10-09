import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { CAPABILITY_IDS, CapabilityIdSchema, type CapabilityId } from '@/content/schema'
import { buildTodayQueue, createEmptyLessonProgress } from '@/domain/progress/progress'
import { ProgressEnvelopeSchema } from '@/infrastructure/storage/progressStorage'
import { CAPABILITY_LABELS } from '@/features/catalog/CatalogPage'

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) ? [path] : []
  })
}

function attemptFor(capabilityId: string) {
  return {
    attemptId: 'a1',
    lessonId: 'mission',
    taskId: 'task',
    capabilityId,
    phase: 'retry',
    attemptedAt: '2026-08-18T09:00:00.000Z',
    durationSeconds: 60,
    wordCount: 42,
    rubric: { clarity: 'met' },
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount: 0,
      preparationSeconds: 10
    },
    process: null,
    completed: true
  }
}

function envelopeWith(capabilityId: string) {
  return {
    storageVersion: 6,
    lessonProgress: {
      mission: { ...createEmptyLessonProgress(), attemptCount: 1, recentAttempts: [attemptFor(capabilityId)] }
    },
    settings: { theme: 'dark' },
    storyBank: []
  }
}

describe('capability ids have a single source', () => {
  it('exposes the ids as a tuple that the content schema accepts exactly', () => {
    expect([...CapabilityIdSchema.options]).toEqual([...CAPABILITY_IDS])
    expect(new Set(CAPABILITY_IDS).size).toBe(CAPABILITY_IDS.length)
  })

  it('accepts every id in stored attempts and rejects an unknown one', () => {
    for (const id of CAPABILITY_IDS) {
      expect(ProgressEnvelopeSchema.safeParse(envelopeWith(id)).success, id).toBe(true)
    }
    expect(ProgressEnvelopeSchema.safeParse(envelopeWith('made-up-capability')).success).toBe(false)
  })

  it('orders the Today queue by the declared capability order', () => {
    const catalog = [...CAPABILITY_IDS].reverse().map((capabilityId) => ({
      lessonId: `lesson-${capabilityId}`,
      capabilityId,
      hasPerformanceTask: true
    }))
    const queue = buildTodayQueue(catalog, {}, new Date('2026-08-18T08:00:00.000Z'))

    expect(queue.map((item) => item.capabilityId)).toEqual([...CAPABILITY_IDS])
  })

  it('labels every capability and every catalog lesson uses a declared id', () => {
    const labelled = Object.keys(CAPABILITY_LABELS) as CapabilityId[]
    expect(labelled.sort()).toEqual([...CAPABILITY_IDS].sort())
    for (const lesson of getBundledCatalog().lessons) {
      for (const id of lesson.capabilities) expect(CAPABILITY_IDS).toContain(id)
    }
  })

  it('does not re-declare the id list outside its owners', () => {
    const allowed = new Set([
      join('src', 'content', 'schema.ts'),
      join('src', 'features', 'catalog', 'CatalogPage.tsx'),
      join('src', 'features', 'today', 'TodayPage.tsx')
    ])
    const offenders = sourceFiles('src').filter((file) =>
      !allowed.has(file) && readFileSync(file, 'utf8').includes("'international-interview'")
    )
    expect(offenders).toEqual([])
  })
})
