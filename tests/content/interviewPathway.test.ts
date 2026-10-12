import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import type { CanonicalLesson, CapabilityId } from '@/content/schema'

type Planned = { lessonId: string; capability: CapabilityId; level: 'B1' | 'B2'; mode: 'spoken' | 'written' }

const INTERVIEW = 'international-interview'
const WORK = 'workplace-communication'

const PLANNED: Planned[] = [
  { lessonId: 'interview-tell-me-about-yourself-b1', capability: INTERVIEW, level: 'B1', mode: 'spoken' },
  { lessonId: 'interview-behavioral-story-bank-b2', capability: INTERVIEW, level: 'B2', mode: 'spoken' },
  { lessonId: 'interview-system-design-walkthrough-b2', capability: INTERVIEW, level: 'B2', mode: 'spoken' },
  { lessonId: 'interview-coding-think-aloud-b2', capability: INTERVIEW, level: 'B2', mode: 'spoken' },
  { lessonId: 'interview-ask-the-interviewer-b1', capability: INTERVIEW, level: 'B1', mode: 'spoken' },
  { lessonId: 'interview-negotiate-offer-b2', capability: INTERVIEW, level: 'B2', mode: 'spoken' },
  { lessonId: 'workplace-give-and-receive-feedback-b1', capability: WORK, level: 'B1', mode: 'spoken' },
  { lessonId: 'workplace-performance-review-b2', capability: WORK, level: 'B2', mode: 'spoken' },
  { lessonId: 'workplace-one-on-one-b1', capability: WORK, level: 'B1', mode: 'spoken' },
  { lessonId: 'workplace-code-review-comment-b1', capability: WORK, level: 'B1', mode: 'written' },
  { lessonId: 'workplace-small-talk-b1', capability: WORK, level: 'B1', mode: 'spoken' }
]

const lessons = (): CanonicalLesson[] => getBundledCatalog().lessons
const byId = (id: string) => lessons().find((lesson) => lesson.lessonId === id)

describe('interview and work pathway missions', () => {
  it.each(PLANNED)('ships $lessonId with the planned capability, level and mode', (planned) => {
    const lesson = byId(planned.lessonId)
    expect(lesson, planned.lessonId).toBeDefined()
    expect(lesson?.capabilities).toEqual([planned.capability])
    expect(lesson?.cefrLevel).toBe(planned.level)
    expect(lesson?.performanceTask?.mode).toBe(planned.mode)
  })

  it('declares the story bank for the behavioral mission', () => {
    const lesson = byId('interview-behavioral-story-bank-b2')
    expect(lesson?.storyBank?.competencies.length).toBeGreaterThanOrEqual(3)
    expect(lesson?.storyBank?.minStories).toBeGreaterThanOrEqual(2)
  })

  it('gives every new mission a learner-facing English output prompt and a rubric with anchors', () => {
    for (const planned of PLANNED) {
      const task = byId(planned.lessonId)?.performanceTask
      expect(task?.performancePrompt, planned.lessonId).toMatch(/English|tiếng Anh/i)
      expect(task?.rubric.length, planned.lessonId).toBeGreaterThanOrEqual(3)
      expect(task?.rubric.every((criterion) => criterion.anchors), planned.lessonId).toBe(true)
    }
  })

  it('does not repeat a scenario, title or baseline source of any other mission', () => {
    const all = lessons()
    const seen = {
      title: new Map<string, string>(), scenario: new Map<string, string>(), baseline: new Map<string, string>()
    }
    const dupes: string[] = []
    for (const lesson of all) {
      const task = lesson.performanceTask
      const baseline = task?.practiceContexts?.baseline.artifacts.map((artifact) => JSON.stringify(artifact)).join('|') ?? ''
      const entries: Array<[keyof typeof seen, string]> = [
        ['title', lesson.title.toLowerCase()], ['scenario', task?.scenario.toLowerCase() ?? ''], ['baseline', baseline.toLowerCase()]
      ]
      for (const [kind, value] of entries) {
        if (!value) continue
        const previous = seen[kind].get(value)
        if (previous) dupes.push(`${kind}: ${previous} = ${lesson.lessonId}`)
        else seen[kind].set(value, lesson.lessonId)
      }
    }
    expect(dupes).toEqual([])
  })

  it('does not reuse one workflow tag set between the new missions and older ones', () => {
    const planned = new Set(PLANNED.map((entry) => entry.lessonId))
    const older = new Set(lessons().filter((lesson) => !planned.has(lesson.lessonId)).flatMap((lesson) => lesson.workflowTags))
    for (const id of planned) {
      const tags = byId(id)?.workflowTags ?? []
      expect(tags.some((tag) => !older.has(tag)), id).toBe(true)
    }
  })
})
