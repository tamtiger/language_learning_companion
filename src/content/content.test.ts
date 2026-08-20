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

  it('loads distinct phase contexts for every bundled v3 capability mission', () => {
    const missions = getBundledCatalog().lessons.filter((lesson) =>
      lesson.sourceSchemaVersion === 'v3' && lesson.performanceTask
    )

    expect(missions).toHaveLength(12)
    for (const mission of missions) {
      const contexts = mission.performanceTask?.practiceContexts
      expect(contexts, mission.lessonId).toBeTruthy()
      if (!contexts) continue
      expect(contexts.baseline.artifacts.length, mission.lessonId).toBeGreaterThan(0)
      expect(contexts.retry?.artifacts.length, mission.lessonId).toBeGreaterThan(0)
      expect(contexts.transfer.artifacts.length, mission.lessonId).toBeGreaterThan(0)
      expect(contexts.review.artifacts.length, mission.lessonId).toBeGreaterThan(0)

      const evidencePackets = [
        contexts.baseline.artifacts.map((artifact) => artifact.content).join('\n'),
        contexts.retry?.artifacts.map((artifact) => artifact.content).join('\n'),
        contexts.transfer.artifacts.map((artifact) => artifact.content).join('\n'),
        contexts.review.artifacts.map((artifact) => artifact.content).join('\n')
      ]
      expect(new Set(evidencePackets).size, mission.lessonId).toBe(4)
    }
  })

  it('loads a complete learning loop for every bundled spoken mission', () => {
    const pilots = getBundledCatalog().lessons.filter((lesson) => lesson.performanceTask?.mode === 'spoken'
      && lesson.performanceTask.learningLoop)

    expect(pilots.map((lesson) => lesson.lessonId).sort()).toEqual([
      'architecture-walkthrough-b2',
      'behavioral-interview-ownership-b2',
      'daily-standup-b1',
      'meeting-disagree-and-recap-b2',
      'technical-interview-decision-b2',
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
      expect(pilot.sourceSchemaVersion).toBe('v3')
      expect(task.practiceContexts?.retry?.artifacts.length).toBeGreaterThan(0)
      expect(task.practiceContexts?.baseline.artifacts[0]?.content)
        .not.toBe(task.practiceContexts?.transfer.artifacts[0]?.content)
      expect(task.practiceContexts?.review.artifacts[0]?.content)
        .not.toBe(task.practiceContexts?.transfer.artifacts[0]?.content)
      expect(task.learningLoop.interactionTurns.length).toBeGreaterThanOrEqual(2)
      expect(task.learningLoop.interactionTurns.some((turn) =>
        ['clarification', 'misunderstanding', 'repair', 'interruption'].includes(turn.kind)
      )).toBe(true)
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

  it('loads reading ladders and unseen phase sources for all four technical documentation missions', () => {
    const ids = [
      'learn-api-from-docs-b2',
      'technical-doc-action-b1',
      'technical-log-diagnosis-b1',
      'technology-troubleshooting-from-docs-b2'
    ]
    const lessons = getBundledCatalog().lessons.filter((lesson) => ids.includes(lesson.lessonId))
    expect(lessons.map((lesson) => lesson.lessonId).sort()).toEqual(ids)
    for (const lesson of lessons) {
      const task = lesson.performanceTask
      if (task?.mode !== 'written') throw new Error('Technical reading fixture missing')
      expect(task.readingLadder?.extractionItems).toHaveLength(3)
      expect(task.readingLadder?.applicationChecklist.length).toBeGreaterThanOrEqual(2)
      expect(task.practiceContexts?.retry?.artifacts.length).toBeGreaterThan(0)
      const sources = [
        task.practiceContexts?.baseline.artifacts[0]?.content,
        task.practiceContexts?.transfer.artifacts[0]?.content,
        task.practiceContexts?.review.artifacts[0]?.content
      ]
      expect(new Set(sources).size).toBe(3)
      expect(sources.every(Boolean)).toBe(true)
    }
  })

  it('requests at least three synthetic English locales in every spoken loop', () => {
    const spokenLoops = getBundledCatalog().lessons.filter((lesson) => lesson.performanceTask?.mode === 'spoken')
    expect(spokenLoops).toHaveLength(6)
    for (const lesson of spokenLoops) {
      const task = lesson.performanceTask
      if (task?.mode !== 'spoken' || !task.learningLoop) throw new Error('Spoken loop missing')
      const items = [
        ...task.learningLoop.perception.pretest,
        ...task.learningLoop.perception.training,
        ...task.learningLoop.perception.posttest
      ]
      const locales = new Set(items.flatMap((item) => item.audio.kind === 'speech-synthesis' ? [item.audio.locale] : []))
      expect(locales.size).toBeGreaterThanOrEqual(3)
    }
  })
})
