import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from './catalog'
import { NEW_CAPABILITY_MISSIONS } from './content'

describe('new capability mission wave', () => {
  it('loads exactly one valid v3 mission for every capability', () => {
    const catalog = getBundledCatalog()
    expect(NEW_CAPABILITY_MISSIONS).toHaveLength(6)
    expect(new Set(NEW_CAPABILITY_MISSIONS.map((item) => item.lessonId)).size).toBe(6)
    expect(new Set(NEW_CAPABILITY_MISSIONS.map((item) => item.capabilityId)).size).toBe(6)

    for (const expected of NEW_CAPABILITY_MISSIONS) {
      const lesson = catalog.lessons.find((item) => item.lessonId === expected.lessonId)
      expect(lesson?.sourceSchemaVersion).toBe('v3')
      expect(lesson?.capabilities).toEqual([expected.capabilityId])
      expect(lesson?.performanceTask?.rubric.length).toBeGreaterThanOrEqual(3)
      expect(lesson?.performanceTask?.transferPrompt.length).toBeGreaterThan(20)
    }
  })

  it('loads the issue-update realism pilot with varied phase contexts', () => {
    const pilot = getBundledCatalog().lessons.find((item) => item.lessonId === 'workplace-issue-update-b1')
    const contexts = pilot?.performanceTask?.practiceContexts

    expect(contexts?.baseline.artifacts.length).toBeGreaterThanOrEqual(2)
    expect(contexts?.transfer.artifacts.length).toBeGreaterThanOrEqual(2)
    expect(contexts?.review.artifacts.length).toBeGreaterThanOrEqual(2)
    expect(contexts?.baseline.brief).toMatch(/audience|handover|communication/i)
    expect(contexts?.transfer.artifacts.map((item) => item.content).join(' '))
      .not.toContain(contexts?.baseline.artifacts[0]?.content)
  })
})
