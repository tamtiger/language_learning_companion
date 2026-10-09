import { describe, expect, it } from 'vitest'
import { buildCatalog, getBundledCatalog } from '@/content/catalog'
import { CAPABILITY_IDS } from '@/content/schema'
import { readContentInventory } from '../helpers/contentInventory'
import { validWrittenMission } from '../helpers/lessonFixtures'

describe('capability-first catalog', () => {
  it('loads and validates every executable lesson JSON on disk', () => {
    const inventory = readContentInventory()

    expect(inventory.files.length).toBeGreaterThan(0)
    expect(inventory.catalog.errors).toEqual([])
    expect(inventory.catalog.lessons).toHaveLength(inventory.files.length)
    expect(getBundledCatalog().errors).toEqual([])
    expect(getBundledCatalog().lessons.map((lesson) => lesson.lessonId))
      .toEqual(inventory.catalog.lessons.map((lesson) => lesson.lessonId))
  })

  it('keeps lesson, section and exercise ids unique', () => {
    const { catalog } = readContentInventory()
    const lessonIds = catalog.lessons.map((lesson) => lesson.lessonId)
    expect(new Set(lessonIds).size).toBe(lessonIds.length)

    catalog.lessons.forEach((lesson) => {
      const sectionIds = lesson.sections.map((section) => section.id)
      const exerciseIds = lesson.sections.flatMap((section) =>
        section.type === 'auto-check' ? section.exercises.map((exercise) => exercise.id) : []
      )
      expect(new Set(sectionIds).size, lesson.lessonId).toBe(sectionIds.length)
      expect(new Set(exerciseIds).size, lesson.lessonId).toBe(exerciseIds.length)
    })
  })

  it('keeps every capability mission complete and only pronunciation lessons on the legacy schema', () => {
    const inventory = readContentInventory()

    expect(inventory.catalog.baselineMissions.length).toBe(inventory.byVersion.v3.length)
    inventory.catalog.baselineMissions.forEach((lesson) => {
      expect(lesson.performanceTask?.rubric.length, lesson.lessonId).toBeGreaterThanOrEqual(3)
      expect(lesson.performanceTask?.baselinePrompt, lesson.lessonId).toBeTruthy()
      expect(lesson.performanceTask?.retryPrompt, lesson.lessonId).toBeTruthy()
      expect(lesson.performanceTask?.transferPrompt, lesson.lessonId).toBeTruthy()
      expect(lesson.performanceTask?.reviewPrompt, lesson.lessonId).toBeTruthy()
      expect(lesson.reviewPolicy.intervalDays.length, lesson.lessonId).toBeGreaterThan(0)
    })
    expect(inventory.byVersion.v2).toHaveLength(0)
    expect(inventory.byVersion.v1.every((lesson) => lesson.performanceTask === undefined)).toBe(true)
  })

  it('covers every primary capability with at least two missions', () => {
    const { capabilityCounts } = readContentInventory()

    for (const capability of CAPABILITY_IDS) {
      expect(capabilityCounts.get(capability) ?? 0, capability).toBeGreaterThanOrEqual(2)
    }
  })

  it('returns structured errors for invalid files and duplicate lesson ids', () => {
    const catalog = buildCatalog([
      ['bad.json', { schemaVersion: 'v99' }],
      ['duplicate-a.json', {
        schemaVersion: 'v1', lessonId: 'same', title: 'A', cefrLevel: 'B1', durationMinutes: 5,
        learningObjectives: ['A'], vocabulary: [], expressions: [],
        reading: { title: 'A', sourceType: 'A', content: 'A' }, exercises: []
      }],
      ['duplicate-b.json', {
        schemaVersion: 'v1', lessonId: 'same', title: 'B', cefrLevel: 'B1', durationMinutes: 5,
        learningObjectives: ['B'], vocabulary: [], expressions: [],
        reading: { title: 'B', sourceType: 'B', content: 'B' }, exercises: []
      }]
    ])

    expect(catalog.errors.map((error) => error.kind)).toEqual(['validation', 'duplicate-id'])
    expect(catalog.lessons).toHaveLength(1)
  })

  it('returns a structured validation error for a broken provenance reference', () => {
    const mission = structuredClone(validWrittenMission) as any
    mission.sourceRegistry = [{
      sourceId: 'official-standard', kind: 'standard', title: 'Official standard',
      publisher: 'Standards body', canonicalUrl: 'https://example.org/standard.pdf',
      versionOrPublishedAt: '2026 edition', accessedAt: '2026-08-27',
      exactLocation: 'Section 4, page 12',
      licenseIdOrRightsUrl: 'https://example.org/rights', reuseMode: 'reference-only'
    }]
    mission.sections[1].provenance = {
      origin: 'synthetic', sourceIds: ['not-in-registry'],
      adaptationNote: 'The scenario is fictional training data.'
    }

    const catalog = buildCatalog([['broken-provenance.json', mission]])

    expect(catalog.lessons).toEqual([])
    expect(catalog.errors).toHaveLength(1)
    expect(catalog.errors[0]).toMatchObject({ kind: 'validation', path: 'broken-provenance.json' })
    expect(catalog.errors[0]?.message).toMatch(/source|provenance|registry/i)
  })
})
