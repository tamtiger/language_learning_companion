import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { CAPABILITY_IDS, type CanonicalLesson } from '@/content/schema'
import {
  MAX_AVERAGE_RESPONSE_WORDS,
  findA2Violations,
  findChunkViolations,
  findPromptViolations,
  findRubricViolations,
  findSentenceViolations,
  sentencesOf,
  vietnameseShare,
  wordCount
} from '../helpers/a2Rules'
import { distinctiveTokens } from '../helpers/contentRules'

const A2_MISSIONS: Array<{ lessonId: string; capability: (typeof CAPABILITY_IDS)[number]; mode: 'spoken' | 'written' }> = [
  { lessonId: 'workplace-ask-for-help-a2', capability: 'workplace-communication', mode: 'written' },
  { lessonId: 'technical-readme-steps-a2', capability: 'technical-reading', mode: 'written' },
  { lessonId: 'meeting-join-and-repeat-a2', capability: 'international-meetings', mode: 'spoken' },
  { lessonId: 'explain-what-a-service-does-a2', capability: 'technical-explanation', mode: 'spoken' },
  { lessonId: 'interview-describe-your-job-a2', capability: 'international-interview', mode: 'spoken' },
  { lessonId: 'learn-a-tool-from-short-docs-a2', capability: 'technology-learning', mode: 'written' }
]

const a2Lessons = (): CanonicalLesson[] => getBundledCatalog().lessons.filter((lesson) => lesson.cefrLevel === 'A2')

describe('A2 entry missions', () => {
  it('gives every capability at least one A2 mission', () => {
    const covered = new Set(a2Lessons().flatMap((lesson) => lesson.capabilities))
    for (const capability of CAPABILITY_IDS) expect(covered.has(capability), capability).toBe(true)
  })

  it('ships the six planned missions with the right capability, mode and output size', () => {
    for (const planned of A2_MISSIONS) {
      const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === planned.lessonId)
      expect(lesson, planned.lessonId).toBeDefined()
      expect(lesson?.cefrLevel, planned.lessonId).toBe('A2')
      expect(lesson?.capabilities, planned.lessonId).toEqual([planned.capability])
      const task = lesson?.performanceTask
      expect(task?.mode, planned.lessonId).toBe(planned.mode)
      if (task?.mode === 'spoken') expect(task.outputContract).toMatchObject({ targetSeconds: 20, timeLimitSeconds: 40 })
      if (task?.mode === 'written') expect(task.outputContract).toMatchObject({ minWords: 40, maxWords: 60 })
    }
  })

  it('passes every measurable A2 rule', () => {
    const lessons = a2Lessons()
    expect(lessons.length).toBeGreaterThan(0)
    for (const lesson of lessons) expect(findA2Violations(lesson), lesson.lessonId).toEqual([])
  })

  it('keeps A2 lessons in the missions folder of their capability', () => {
    for (const lesson of a2Lessons()) {
      expect(lesson.sourceSchemaVersion).toBe('v3')
      expect(lesson.performanceTask, lesson.lessonId).toBeDefined()
    }
  })
})

describe('A2 rules catch flaws', () => {
  it('measures words, sentences and the Vietnamese share', () => {
    expect(wordCount('I work as ___. Every day, I test.')).toBe(7)
    expect(sentencesOf('One two. Three four? Five!')).toHaveLength(3)
    expect(vietnameseShare('Viết bằng tiếng Anh')).toBeGreaterThan(0.15)
    expect(vietnameseShare('Write in English')).toBe(0)
    expect(vietnameseShare('')).toBe(0)
  })

  it('requires bilingual prompts that lose Vietnamese and an English-only review', () => {
    const english = 'Write a short message in English.'
    const bilingual = 'Viết một tin nhắn ngắn. Write it in English.'
    const lighter = 'Viết ngắn. Write it in English, please.'
    expect(findPromptViolations({ baseline: bilingual, performance: lighter, retry: english, transfer: english, review: english })).toEqual([])
    expect(findPromptViolations({ baseline: english, performance: english, retry: english, transfer: english, review: english })).toEqual([
      'baseline prompt must be bilingual (it has no Vietnamese)'
    ])
    expect(findPromptViolations({ baseline: lighter, performance: bilingual, retry: english, transfer: english, review: english }))
      .toContain('performance prompt has more Vietnamese than baseline')
    expect(findPromptViolations({ baseline: bilingual, performance: lighter, retry: english, transfer: english, review: lighter }))
      .toEqual(expect.arrayContaining(['review prompt must be English only']))
  })

  it('rejects chunks and sentences that are too long', () => {
    expect(findChunkViolations([{ id: 'ok', text: 'I work as ___.' }, { id: 'long', text: 'I would like to ask you to please repeat the last sentence again.' }]))
      .toEqual(['long: chunk has more than 8 words'])
    expect(findSentenceViolations('I fixed the bug. It works now.', 'response', MAX_AVERAGE_RESPONSE_WORDS)).toEqual([])
    expect(findSentenceViolations('I fixed the bug in the checkout service after the team found that the old timeout was too short for slow requests today.', 'response', MAX_AVERAGE_RESPONSE_WORDS))
      .toHaveLength(2)
  })

  it('needs a task criterion, a language criterion and distinct anchors', () => {
    const item = (id: string, dimension: 'task' | 'accuracy' | 'range' | 'register', anchors?: { met: string; notMet: string }) => ({ id, label: id, description: id, dimension, anchors })
    const anchors = { met: 'Clear.', notMet: 'Unclear.' }
    expect(findRubricViolations([item('a', 'task', anchors), item('b', 'accuracy', anchors), item('c', 'range', anchors)])).toEqual([])
    expect(findRubricViolations([item('a', 'task', anchors), item('b', 'task', anchors), item('c', 'task', anchors)])).toEqual(['rubric needs a language criterion'])
    expect(findRubricViolations([item('a', 'accuracy', anchors), item('b', 'accuracy', anchors), item('c', 'range', anchors)])).toEqual(['rubric needs a task criterion'])
    expect(findRubricViolations([item('a', 'task', anchors), item('b', 'accuracy'), item('c', 'range', { met: 'Same.', notMet: 'Same.' })]))
      .toEqual(['b: missing anchors', 'c: anchors must differ'])
    expect(findRubricViolations([item('a', 'task', anchors), item('b', 'accuracy', anchors)])).toEqual(['rubric must have 3 to 5 criteria'])
  })

  it('finds distinctive tokens: long words and anything with a digit', () => {
    expect([...distinctiveTokens('Fix the bug in checkout 503 now')].sort()).toEqual(['503', 'checkout'])
  })
})
