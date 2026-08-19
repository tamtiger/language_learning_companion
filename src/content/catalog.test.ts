import { describe, expect, it } from 'vitest'
import { buildCatalog, getBundledCatalog } from './catalog'

describe('capability-first catalog', () => {
  it('loads every bundled JSON and keeps all seven legacy lessons', () => {
    const catalog = getBundledCatalog()
    expect(catalog.errors).toEqual([])
    expect(catalog.lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v1')).toHaveLength(6)
    expect(catalog.lessons.filter((lesson) => lesson.sourceSchemaVersion === 'v2')).toHaveLength(1)
  })

  it('contains one baseline mission for each of the six primary capabilities', () => {
    const catalog = getBundledCatalog()
    const capabilities = catalog.baselineMissions.flatMap((lesson) => lesson.capabilities)

    expect(catalog.baselineMissions).toHaveLength(6)
    expect(new Set(capabilities)).toEqual(new Set([
      'workplace-communication',
      'technical-reading',
      'international-meetings',
      'technical-explanation',
      'international-interview',
      'technology-learning'
    ]))
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
})
