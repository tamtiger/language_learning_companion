import { describe, expect, it } from 'vitest'
import { normalizeLesson, parseLesson } from '@/content/normalization'
import { validWrittenMission } from '../helpers/lessonFixtures'

const bundledLessons = Object.values(
  import.meta.glob('/content/**/*.json', { eager: true, import: 'default' })
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

  it('resolves provenance references before source metadata reaches the UI', () => {
    const mission = structuredClone(validWrittenMission) as any
    const source = {
      sourceId: 'official-standard', kind: 'standard', title: 'Official standard',
      publisher: 'Standards body', canonicalUrl: 'https://example.org/standard.pdf',
      versionOrPublishedAt: '2026 edition', accessedAt: '2026-08-27',
      exactLocation: 'Section 4, page 12',
      licenseIdOrRightsUrl: 'https://example.org/rights', reuseMode: 'reference-only'
    }
    const provenance = {
      origin: 'synthetic', sourceIds: [source.sourceId],
      adaptationNote: 'The scenario and metrics are fictional training data.'
    }
    mission.sourceRegistry = [source]
    mission.sections[1].provenance = provenance
    mission.performanceTask.practiceContexts = {
      baseline: {
        title: 'Baseline', brief: 'Use this packet.',
        artifacts: [{
          id: 'baseline-source', type: 'source', title: 'Baseline notes',
          format: 'meeting-notes', content: 'Synthetic notes.', provenance
        }]
      },
      transfer: {
        title: 'Transfer', brief: 'Use this packet.',
        artifacts: [{
          id: 'transfer-source', type: 'source', title: 'Transfer notes',
          format: 'meeting-notes', content: 'Fresh synthetic notes.', provenance
        }]
      },
      review: {
        title: 'Review', brief: 'Use this packet.',
        artifacts: [{
          id: 'review-source', type: 'source', title: 'Review notes',
          format: 'meeting-notes', content: 'Delayed synthetic notes.', provenance
        }]
      }
    }

    const lesson = normalizeLesson(parseLesson(mission))
    const lessonSource = lesson.sections[1]
    const task = lesson.performanceTask
    const baselineSource = task?.practiceContexts?.baseline.artifacts[0]
    if (lessonSource?.type !== 'source' || !lessonSource.provenance
      || !baselineSource?.provenance) {
      throw new Error('Resolved canonical sources missing')
    }
    expect(lessonSource.resolvedSources).toEqual([source])
    expect(baselineSource.resolvedSources).toEqual([source])
    expect('sourceRegistry' in lesson).toBe(false)
  })

  it('returns a structured parsing error for unknown versions', () => {
    expect(() => parseLesson({ schemaVersion: 'v99' })).toThrow(/schemaVersion/i)
  })
})
