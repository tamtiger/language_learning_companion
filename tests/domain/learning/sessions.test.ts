import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import {
  SESSION_COUNT,
  commitmentMinutes,
  currentSession,
  estimateSessionMinutes,
  sessionLabel,
  sessionOf
} from '@/domain/learning/sessions'
import { createEmptyLessonProgress } from '@/domain/progress/progress'

const lessons = getBundledCatalog().lessons.filter((lesson) => lesson.performanceTask)

describe('session model', () => {
  it('maps every phase to one of three sessions', () => {
    expect(SESSION_COUNT).toBe(3)
    expect(['baseline', 'input', 'auto-check'].map((phase) => sessionOf(phase as never))).toEqual([1, 1, 1])
    expect(['performance', 'interaction', 'self-feedback', 'retry'].map((phase) => sessionOf(phase as never))).toEqual([2, 2, 2, 2])
    expect(sessionOf('transfer')).toBe(3)
  })

  it('treats review and completed missions as outside the three sessions', () => {
    expect(sessionOf('review')).toBeNull()
    expect(sessionOf('completed')).toBeNull()
  })

  it('names each session for the learner', () => {
    expect(sessionLabel(1)).toBe('Thử sức và học')
    expect(sessionLabel(2)).toBe('Luyện và sửa')
    expect(sessionLabel(3)).toBe('Vận dụng mới')
  })
})

describe('current session from a saved checkpoint', () => {
  const progress = (activePhase: ReturnType<typeof createEmptyLessonProgress>['activePhase'], extra = {}) => ({
    ...createEmptyLessonProgress(), status: 'in-progress' as const, activePhase, ...extra
  })

  it('starts at session 1 for a new lesson and while the input checkpoint is saved', () => {
    expect(currentSession(undefined)).toBe(1)
    expect(currentSession(progress(null))).toBe(1)
    expect(currentSession(progress('input'))).toBe(1)
  })

  it('resumes the right session after the learner left in the middle of the mission', () => {
    expect(currentSession(progress('performance'))).toBe(2)
    expect(currentSession(progress('retry'))).toBe(2)
    expect(currentSession(progress('transfer'))).toBe(3)
  })

  it('reports no session for a completed mission', () => {
    expect(currentSession({ ...createEmptyLessonProgress(), status: 'completed', transferCompleted: true })).toBeNull()
  })
})

describe('session duration estimate', () => {
  it('returns three positive session estimates for every lesson with a task', () => {
    for (const lesson of lessons) {
      const minutes = estimateSessionMinutes(lesson)
      expect(minutes, lesson.lessonId).toHaveLength(3)
      expect(minutes.every((value) => value > 0), lesson.lessonId).toBe(true)
    }
  })

  it('makes the transfer session the shortest because it has no input or feedback', () => {
    for (const lesson of lessons) {
      const [first, second, third] = estimateSessionMinutes(lesson)
      expect(third, lesson.lessonId).toBeLessThan(Math.max(first, second))
    }
  })

  it('declares durationMinutes as the longest session, rounded up and kept inside the schema range', () => {
    const mismatched = lessons
      .map((lesson) => ({ id: lesson.lessonId, declared: lesson.durationMinutes, expected: commitmentMinutes(lesson) }))
      .filter(({ declared, expected }) => declared !== expected)
    expect(mismatched).toEqual([])
  })

  it('keeps every session a sensible length to sit down for', () => {
    for (const lesson of lessons) {
      const longest = Math.max(...estimateSessionMinutes(lesson))
      expect(longest, lesson.lessonId).toBeLessThanOrEqual(30)
    }
  })
})
