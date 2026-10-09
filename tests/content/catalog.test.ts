import { describe, expect, it } from 'vitest'
import { buildCatalog, getBundledCatalog } from '@/content/catalog'
import { validWrittenMission } from './schema.test'

describe('capability-first catalog', () => {
  it('loads every bundled JSON and keeps the six pronunciation legacy lessons', () => {
    const catalog = getBundledCatalog()
    expect(catalog.errors).toEqual([])
    expect(catalog.lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v1')).toHaveLength(6)
    expect(catalog.lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v2')).toHaveLength(0)
  })

  it('contains two baseline missions for each of the six primary capabilities', () => {
    const catalog = getBundledCatalog()
    const capabilities = catalog.baselineMissions.flatMap((lesson) => lesson.capabilities)

    expect(catalog.baselineMissions).toHaveLength(12)
    expect(new Set(capabilities)).toEqual(new Set([
      'workplace-communication',
      'technical-reading',
      'international-meetings',
      'technical-explanation',
      'international-interview',
      'technology-learning'
    ]))
    for (const capability of new Set(capabilities)) {
      expect(capabilities.filter((item) => item === capability)).toHaveLength(2)
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
