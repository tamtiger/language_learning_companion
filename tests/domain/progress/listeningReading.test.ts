import { describe, expect, it } from 'vitest'
import type { CanonicalLesson } from '@/content/schema'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { summarizeListeningReading } from '@/domain/progress/listeningReading'

const exercise = (id: string) => ({ id, type: 'choice' as const, question: 'q', options: ['a', 'b', 'c'], correctAnswer: ['a'], explanation: 'e' })

const listening = {
  lessonId: 'listen-one', title: 'Listen one',
  sections: [{ id: 's', type: 'listening-source', title: 't', gist: [exercise('g1')], detail: [exercise('d1'), exercise('d2')], speakers: [], turns: [], durationSeconds: 90 }]
} as unknown as CanonicalLesson
const reading = {
  lessonId: 'read-one', title: 'Read one',
  sections: [{ id: 'r', type: 'long-reading', title: 't', format: 'rfc', parts: [], skim: [exercise('k1')], scan: [{ locatePartId: 'p', exercise: exercise('c1') }, { locatePartId: 'p', exercise: exercise('c2') }] }]
} as unknown as CanonicalLesson
const plain = { lessonId: 'plain', title: 'Plain', sections: [{ id: 'x', type: 'source', title: 't', content: 'c' }] } as unknown as CanonicalLesson

describe('summarizeListeningReading', () => {
  it('counts only lessons that carry a listening or long reading section', () => {
    const summary = summarizeListeningReading([listening, reading, plain], {})
    expect(summary.listening.total).toBe(1)
    expect(summary.reading.total).toBe(1)
    expect(summary.listening.items[0]).toMatchObject({ lessonId: 'listen-one', questions: 3, answered: 0, status: 'not-started' })
    expect(summary.reading.items[0]).toMatchObject({ lessonId: 'read-one', questions: 3, answered: 0 })
  })

  it('reports answered questions and completion from progress', () => {
    const summary = summarizeListeningReading([listening, reading], {
      'listen-one': { ...createEmptyLessonProgress(), status: 'in-progress', completedExerciseIds: ['g1', 'd2', 'other'] },
      'read-one': { ...createEmptyLessonProgress(), status: 'completed', completedExerciseIds: ['k1', 'c1', 'c2'] }
    })
    expect(summary.listening.items[0]).toMatchObject({ answered: 2, status: 'in-progress' })
    expect(summary.listening.completed).toBe(0)
    expect(summary.reading.items[0]).toMatchObject({ answered: 3, status: 'completed' })
    expect(summary.reading.completed).toBe(1)
  })
})
