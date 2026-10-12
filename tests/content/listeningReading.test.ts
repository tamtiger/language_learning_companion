import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import type { CanonicalLesson, CanonicalListeningSourceSection, CanonicalLongReadingSection } from '@/content/schema'

const SYNTHETIC = 'Synthetic training artifact — non-production.'
const MIN_WPM = 110
const MAX_WPM = 180

const LISTENING = [
  'listen-standup-blockers-b1',
  'listen-sprint-planning-estimates-b1',
  'listen-retro-what-went-wrong-b2',
  'listen-incident-call-b2',
  'listen-design-review-feedback-b2',
  'listen-tech-talk-summary-b2'
]

const READING: Array<{ lessonId: string; format: CanonicalLongReadingSection['format'] }> = [
  { lessonId: 'read-rfc-requirement-words-b2', format: 'rfc' },
  { lessonId: 'read-api-reference-pagination-b2', format: 'api-reference' },
  { lessonId: 'read-changelog-breaking-change-b1', format: 'changelog' },
  { lessonId: 'read-stack-trace-timeout-b2', format: 'log' },
  { lessonId: 'read-github-issue-thread-b1', format: 'issue' },
  { lessonId: 'read-tutorial-setup-ci-b1', format: 'tutorial' }
]

const words = (text: string): number => text.trim().split(/\s+/u).filter(Boolean).length
const lessonOf = (id: string): CanonicalLesson | undefined => getBundledCatalog().lessons.find((lesson) => lesson.lessonId === id)
const listeningOf = (lesson?: CanonicalLesson) =>
  lesson?.sections.find((section): section is CanonicalListeningSourceSection => section.type === 'listening-source')
const readingOf = (lesson?: CanonicalLesson) =>
  lesson?.sections.find((section): section is CanonicalLongReadingSection => section.type === 'long-reading')

describe('listening lessons', () => {
  it.each(LISTENING)('%s is a multi-voice dialogue of one to three minutes with hidden transcript support', (id) => {
    const lesson = lessonOf(id)
    const section = listeningOf(lesson)
    expect(section, id).toBeDefined()
    if (!section) return
    expect(section.durationSeconds).toBeGreaterThanOrEqual(60)
    expect(section.durationSeconds).toBeLessThanOrEqual(180)
    expect(new Set(section.speakers.map((speaker) => speaker.locale)).size).toBeGreaterThanOrEqual(3)
    const spoken = section.turns.reduce((total, turn) => total + words(turn.text), 0)
    const wpm = spoken / (section.durationSeconds / 60)
    expect(wpm).toBeGreaterThanOrEqual(MIN_WPM)
    expect(wpm).toBeLessThanOrEqual(MAX_WPM)
    expect(section.gist.length).toBeGreaterThanOrEqual(1)
    expect(section.detail.length).toBeGreaterThanOrEqual(3)
    expect(section.listeningNotes?.fields.length).toBeGreaterThanOrEqual(2)
    expect(section.title.toLowerCase()).toContain('synthetic training dialogue')
    const speakerIds = new Set(section.speakers.map((speaker) => speaker.id))
    expect(section.turns.every((turn) => speakerIds.has(turn.speakerId))).toBe(true)
    expect(lesson?.performanceTask?.mode).toBe('written')
  })

  it('covers the six meeting situations without repeating a topic', () => {
    const titles = LISTENING.map((id) => lessonOf(id)?.title.toLowerCase())
    expect(new Set(titles).size).toBe(LISTENING.length)
    const tags = LISTENING.flatMap((id) => lessonOf(id)?.workflowTags ?? [])
    for (const topic of ['standup', 'planning', 'retro', 'incident', 'design-review', 'tech-talk']) {
      expect(tags.some((tag) => tag.includes(topic)), topic).toBe(true)
    }
  })
})

describe('long reading lessons', () => {
  it.each(READING)('$lessonId is a $format document of 400 to 1500 words with skim and scan', ({ lessonId, format }) => {
    const lesson = lessonOf(lessonId)
    const section = readingOf(lesson)
    expect(section, lessonId).toBeDefined()
    if (!section) return
    expect(section.format).toBe(format)
    const total = section.parts.reduce((sum, part) => sum + words(part.content), 0)
    expect(total).toBeGreaterThanOrEqual(400)
    expect(total).toBeLessThanOrEqual(1500)
    expect(section.parts[0].content.startsWith(SYNTHETIC)).toBe(true)
    expect(section.skim.length).toBeGreaterThanOrEqual(1)
    expect(section.scan.length).toBeGreaterThanOrEqual(3)
    const partIds = new Set(section.parts.map((part) => part.id))
    expect(section.scan.every((item) => partIds.has(item.locatePartId))).toBe(true)
    expect(new Set(section.scan.map((item) => item.locatePartId)).size).toBeGreaterThanOrEqual(3)
    expect(lesson?.performanceTask?.mode).toBe('written')
  })

  it('does not repeat a title, scenario or document across the six reading lessons', () => {
    const lessons = READING.map(({ lessonId }) => lessonOf(lessonId))
    expect(new Set(lessons.map((lesson) => lesson?.title.toLowerCase())).size).toBe(READING.length)
    expect(new Set(lessons.map((lesson) => lesson?.performanceTask?.scenario)).size).toBe(READING.length)
    expect(new Set(lessons.map((lesson) => readingOf(lesson)?.parts[0].content)).size).toBe(READING.length)
  })
})

describe('listening and reading sources', () => {
  it('keeps every practice artifact declared as a synthetic training artifact', () => {
    const ids = [...LISTENING, ...READING.map((entry) => entry.lessonId)]
    for (const id of ids) {
      const lesson = lessonOf(id)
      const contexts = lesson?.performanceTask?.practiceContexts
      const artifacts = contexts
        ? [contexts.baseline, contexts.retry, contexts.transfer, contexts.review].flatMap((context) => context?.artifacts ?? [])
        : []
      expect(artifacts.length, id).toBeGreaterThanOrEqual(4)
      for (const artifact of artifacts) expect(artifact.content, `${id}:${artifact.id}`).toContain(SYNTHETIC)
    }
  })
})
