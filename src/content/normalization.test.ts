import { describe, expect, it } from 'vitest'
import { normalizeLesson, parseLesson } from './normalization'
import { validWrittenMission } from './schema.test'

const bundledLessons = Object.values(
  import.meta.glob('../../content/**/*.json', { eager: true, import: 'default' })
)

function bundledLessonByVersion(schemaVersion: 'v1'): unknown {
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

  it('keeps the migrated v3 Daily Standup as a spoken capability loop', () => {
    const raw = bundledLessons.find((candidate) => typeof candidate === 'object' && candidate !== null
      && 'lessonId' in candidate && candidate.lessonId === 'daily-standup-b1')
    if (!raw) throw new Error('Missing migrated Daily Standup fixture')
    const lesson = normalizeLesson(parseLesson(raw))

    expect(lesson.sourceSchemaVersion).toBe('v3')
    expect(lesson.completionMode).toBe('capability-loop')
    const task = lesson.performanceTask
    expect(task?.mode).toBe('spoken')
    if (task?.mode !== 'spoken') throw new Error('Daily Standup must stay spoken')
    expect(task.learningLoop).toBeTruthy()
    expect(lesson.reviewPolicy.intervalDays).toEqual([2, 7])
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
