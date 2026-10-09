import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { CAPABILITY_IDS, type CanonicalSourceSection } from '@/content/schema'

describe('new capability mission wave', () => {
  it('loads at least one valid v3 mission for every capability', () => {
    const catalog = getBundledCatalog()

    for (const capabilityId of CAPABILITY_IDS) {
      const missions = catalog.lessons.filter((item) => item.capabilities.includes(capabilityId))
      expect(missions.length, capabilityId).toBeGreaterThanOrEqual(1)
      for (const lesson of missions) {
        expect(lesson.sourceSchemaVersion, lesson.lessonId).toBe('v3')
        expect(lesson.capabilities, lesson.lessonId).toEqual([capabilityId])
        expect(lesson.performanceTask?.rubric.length, lesson.lessonId).toBeGreaterThanOrEqual(3)
        expect(lesson.performanceTask?.transferPrompt.length, lesson.lessonId).toBeGreaterThan(20)
      }
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

  it('loads trustworthy provenance for every Daily Standup source artifact', () => {
    const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === 'daily-standup-b1')
    const task = lesson?.performanceTask
    if (!lesson || task?.mode !== 'spoken' || !task.practiceContexts) {
      throw new Error('Daily Standup fixture missing')
    }
    const lessonSources = lesson.sections.filter(
      (section): section is CanonicalSourceSection => section.type === 'source'
    )
    const contextSources = [
      ...task.practiceContexts.baseline.artifacts,
      ...(task.practiceContexts.retry?.artifacts ?? []),
      ...task.practiceContexts.transfer.artifacts,
      ...task.practiceContexts.review.artifacts
    ]
    const sources = [...lessonSources, ...contextSources]

    expect(sources).toHaveLength(5)
    for (const source of sources) {
      expect(source.provenance?.origin, source.id).toBe('synthetic')
      expect(source.provenance?.adaptationNote, source.id).toMatch(/fictional|mô phỏng/i)
      expect(source.provenance?.adaptationNote, source.id).toMatch(/team convention|quy ước nhóm/i)
      expect(source.resolvedSources?.map((item) => item.sourceId), source.id).toEqual([
        'scrum-guide-2020',
        'coe-cefr-companion-2020'
      ])
      expect(source.resolvedSources?.every((item) => item.reuseMode === 'reference-only'), source.id).toBe(true)
    }
    expect(sources.map((source) => source.content).length).toBe(new Set(sources.map((source) => source.content)).size)
    expect(sources.every((source) => /Sprint Goal/i.test(source.content))).toBe(true)
    expect(task.outputContract).toMatchObject({ timeLimitSeconds: 60, targetSeconds: 30 })
    expect(task.outputContract.requiredElements).toContain('Sprint Goal progress')
    expect(task.rubric[0]?.label).toMatch(/team convention/i)
    expect(task.rubric[0]?.description).toMatch(/not a Scrum requirement/i)
    expect(task.rubric[0]?.description).toMatch(/Sprint Goal/i)
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
