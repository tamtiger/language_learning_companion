import { describe, expect, it } from 'vitest'
import { readContentInventory } from '../helpers/contentInventory'
import { validWrittenMission } from '../helpers/lessonFixtures'

describe('adding a lesson does not require editing tests', () => {
  const base = readContentInventory()
  const added = structuredClone(validWrittenMission) as Record<string, unknown>
  added.lessonId = 'extra-written-mission-b1'
  added.capabilities = ['technical-reading']
  const withExtra = readContentInventory([['missions/technical-reading/extra-written-mission-b1.json', added]])

  it('is accepted by the catalog like any other mission', () => {
    expect(withExtra.catalog.errors).toEqual([])
    expect(withExtra.files).toHaveLength(base.files.length + 1)
    expect(withExtra.catalog.lessons).toHaveLength(base.catalog.lessons.length + 1)
  })

  it('shows up in every derived count instead of breaking a hard-coded one', () => {
    expect(withExtra.byVersion.v3).toHaveLength(base.byVersion.v3.length + 1)
    expect(withExtra.catalog.baselineMissions).toHaveLength(base.catalog.baselineMissions.length + 1)
    expect(withExtra.capabilityCounts.get('technical-reading')).toBe((base.capabilityCounts.get('technical-reading') ?? 0) + 1)
    expect(withExtra.sourceCount).toBe(withExtra.rawSourceCount)
    expect(withExtra.rawSourceCount).toBeGreaterThan(base.rawSourceCount)
  })

  it('keeps ids unique across the larger catalog', () => {
    const ids = withExtra.catalog.lessons.map((lesson) => lesson.lessonId)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
