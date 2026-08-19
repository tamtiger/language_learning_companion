import { describe, expect, it } from 'vitest'
import { normalizeLesson, parseLesson } from './normalization'
import { validWrittenMission } from './schema.test'

const bundledLessons = Object.values(
  import.meta.glob('../../content/**/*.json', { eager: true, import: 'default' })
)

function bundledLessonByVersion(schemaVersion: 'v1' | 'v2'): unknown {
  const lesson = bundledLessons.find((candidate) =>
    typeof candidate === 'object'
    && candidate !== null
    && 'schemaVersion' in candidate
    && candidate.schemaVersion === schemaVersion
  )
  if (!lesson) throw new Error(`Missing bundled ${schemaVersion} lesson fixture`)
  return lesson
}

describe('parseLesson and normalizeLesson', () => {
  it('normalizes a v1 lesson without fabricating a performance task', () => {
    const lesson = normalizeLesson(parseLesson(bundledLessonByVersion('v1')))

    expect(lesson.sourceSchemaVersion).toBe('v1')
    expect(lesson.completionMode).toBe('legacy-quiz')
    expect(lesson.performanceTask).toBeUndefined()
    expect(lesson.sections.map((section) => section.type)).toEqual([
      'brief', 'language-support', 'source', 'auto-check'
    ])
  })

  it('normalizes the v2 Daily Standup into a spoken canonical task', () => {
    const lesson = normalizeLesson(parseLesson(bundledLessonByVersion('v2')))

    expect(lesson.sourceSchemaVersion).toBe('v2')
    expect(lesson.completionMode).toBe('performance')
    expect(lesson.performanceTask?.mode).toBe('spoken')
    expect(lesson.performanceTask?.baselinePrompt).toBeTruthy()
    expect(lesson.reviewPolicy.intervalDays).toEqual([1, 3, 7])
  })

  it('keeps a valid v3 lesson data-driven', () => {
    const lesson = normalizeLesson(parseLesson(validWrittenMission))

    expect(lesson.sourceSchemaVersion).toBe('v3')
    expect(lesson.completionMode).toBe('capability-loop')
    expect(lesson.capabilities).toEqual(['workplace-communication'])
    expect(lesson.performanceTask?.mode).toBe('written')
  })

  it('returns a structured parsing error for unknown versions', () => {
    expect(() => parseLesson({ schemaVersion: 'v99' })).toThrow(/schemaVersion/i)
  })
})
