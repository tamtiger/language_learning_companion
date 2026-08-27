import assert from 'node:assert/strict'

const test = process.env.VITEST
  ? (await import('vitest')).test
  : (await import('node:test')).default

import {
  createHistoricalLocationMap,
  projectCorpusLocations
} from './check-curriculum-research.mjs'

const HISTORICAL_TASK_ID = '20260827-224143-complete-realistic-curriculum'

const EXPECTED_LEGACY_LOCATIONS = [
  ['architecture-walkthrough-b2', 'content/modules/capabilities/architecture-walkthrough-b2.json'],
  ['behavioral-interview-ownership-b2', 'content/modules/capabilities/behavioral-interview-ownership-b2.json'],
  ['daily-standup-b1', 'content/modules/workplace-communication/daily_standup.json'],
  ['learn-api-from-docs-b2', 'content/modules/capabilities/learn-api-from-docs-b2.json'],
  ['meeting-disagree-and-recap-b2', 'content/modules/capabilities/meeting-disagree-and-recap-b2.json'],
  ['pronunciation-ending-sounds', 'content/modules/pronunciation/lesson_02.json'],
  ['pronunciation-linking-intonation', 'content/modules/pronunciation/lesson_05.json'],
  ['pronunciation-sentence-stress', 'content/modules/pronunciation/lesson_04.json'],
  ['pronunciation-shadowing-routine', 'content/modules/pronunciation/lesson_06.json'],
  ['pronunciation-sounds', 'content/modules/pronunciation/lesson_01.json'],
  ['pronunciation-word-stress', 'content/modules/pronunciation/lesson_03.json'],
  ['technical-doc-action-b1', 'content/modules/capabilities/technical-doc-action-b1.json'],
  ['technical-interview-decision-b2', 'content/modules/capabilities/technical-interview-decision-b2.json'],
  ['technical-log-diagnosis-b1', 'content/modules/capabilities/technical-log-diagnosis-b1.json'],
  ['technical-tradeoff-explanation-b2', 'content/modules/capabilities/technical-tradeoff-explanation-b2.json'],
  ['technology-troubleshooting-from-docs-b2', 'content/modules/capabilities/technology-troubleshooting-from-docs-b2.json'],
  ['workplace-clarification-request-b1', 'content/modules/capabilities/workplace-clarification-request-b1.json'],
  ['workplace-issue-update-b1', 'content/modules/capabilities/workplace-issue-update-b1.json']
]

function corpusEntry(lessonId) {
  const livePath = `content/refactored/${lessonId}.json`
  return {
    absolutePath: `D:/repo/${livePath}`,
    filePath: livePath,
    locationPath: livePath,
    lesson: { lessonId }
  }
}

test('projects the exact historical task onto its frozen research locations', () => {
  const corpus = EXPECTED_LEGACY_LOCATIONS.map(([lessonId]) => corpusEntry(lessonId))
  const projected = projectCorpusLocations(corpus, HISTORICAL_TASK_ID)
  const projectedByLesson = new Map(projected.map((entry) => [entry.lesson.lessonId, entry]))

  assert.notStrictEqual(projected, corpus)
  assert.equal(projected.length, EXPECTED_LEGACY_LOCATIONS.length)
  for (const [lessonId, historicalPath] of EXPECTED_LEGACY_LOCATIONS) {
    const original = corpus.find((entry) => entry.lesson.lessonId === lessonId)
    const actual = projectedByLesson.get(lessonId)
    assert.equal(actual.locationPath, historicalPath)
    assert.equal(actual.filePath, original.filePath)
    assert.equal(actual.absolutePath, original.absolutePath)
  }
})

test('leaves live corpus locations unchanged for every other task', () => {
  const corpus = [corpusEntry('future-lesson')]

  assert.strictEqual(projectCorpusLocations(corpus, 'another-task'), corpus)
})

test('fails when the historical mapping does not cover the live corpus', () => {
  const corpus = [
    ...EXPECTED_LEGACY_LOCATIONS.map(([lessonId]) => corpusEntry(lessonId)),
    corpusEntry('unmapped-lesson')
  ]

  assert.throws(
    () => projectCorpusLocations(corpus, HISTORICAL_TASK_ID),
    /missing historical location mapping.*unmapped-lesson/u
  )
})

test('rejects duplicate historical location paths', () => {
  assert.throws(
    () => createHistoricalLocationMap([
      ['lesson-a', 'content/modules/shared.json'],
      ['lesson-b', 'content/modules/shared.json']
    ]),
    /duplicate historical location path.*content\/modules\/shared\.json/u
  )
})

test('rejects unsafe historical location paths', () => {
  assert.throws(
    () => createHistoricalLocationMap([
      ['lesson-a', 'content/modules/../outside.json']
    ]),
    /unsafe historical location path/u
  )
})
