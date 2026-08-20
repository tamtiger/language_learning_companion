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

  it('loads exactly two complete spoken learning-loop pilots', () => {
    const pilots = getBundledCatalog().lessons.filter((lesson) => lesson.performanceTask?.mode === 'spoken'
      && lesson.performanceTask.learningLoop)

    expect(pilots.map((lesson) => lesson.lessonId).sort()).toEqual([
      'meeting-disagree-and-recap-b2',
      'technical-tradeoff-explanation-b2'
    ])
    for (const pilot of pilots) {
      const task = pilot.performanceTask
      if (task?.mode !== 'spoken' || !task.learningLoop) throw new Error('Spoken pilot fixture missing')
      expect(task.learningLoop.perception.pretest).toHaveLength(4)
      expect(task.learningLoop.perception.training).toHaveLength(6)
      expect(task.learningLoop.perception.posttest).toHaveLength(4)
      expect(task.learningLoop.pronunciationCues.length).toBeLessThanOrEqual(2)
      expect(task.learningLoop.chunks.length).toBeGreaterThanOrEqual(4)
      expect(task.learningLoop.chunks.length).toBeLessThanOrEqual(6)
      expect(task.practiceContexts?.retry?.artifacts.length).toBeGreaterThan(0)
      expect(task.practiceContexts?.baseline.artifacts[0]?.content)
        .not.toBe(task.practiceContexts?.transfer.artifacts[0]?.content)
      expect(pilot.reviewPolicy.intervalDays).toEqual([2, 7])
    }
  })

  it('shows a complete technical source before the read-from-memory baseline', () => {
    const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === 'technical-doc-action-b1')
    const baseline = lesson?.performanceTask?.practiceContexts?.baseline

    expect(lesson?.performanceTask?.baselinePrompt).toMatch(/read once|memory/i)
    expect(baseline?.artifacts[0]?.content).toMatch(/cachectl migrate --target v2/i)
    expect(baseline?.artifacts[0]?.content).toMatch(/MIGRATION_COMPLETE/i)
    expect(baseline?.artifacts[0]?.content).toMatch(/rollback/i)
  })
})
