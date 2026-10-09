import { describe, expect, it } from 'vitest'
import { createEmptyLessonProgress, type ProgressByLesson } from '@/domain/progress/progress'
import { CEFR_RANK, isEntryLevelSkipped, nextLessonAfter, type PathwayLesson } from '@/domain/progress/pathway'

const lesson = (lessonId: string, cefrLevel: PathwayLesson['cefrLevel'], capabilityId: PathwayLesson['capabilityId'] = 'technical-reading'): PathwayLesson =>
  ({ lessonId, cefrLevel, capabilityId })

describe('learning pathway', () => {
  it('ranks levels from A2 up', () => {
    expect(CEFR_RANK.A2).toBeLessThan(CEFR_RANK.B1)
    expect(CEFR_RANK.B1).toBeLessThan(CEFR_RANK.B2)
    expect(CEFR_RANK.B2).toBeLessThan(CEFR_RANK.C1)
  })

  describe('nextLessonAfter', () => {
    const lessons: PathwayLesson[] = [
      lesson('read-a2', 'A2'),
      lesson('read-b1-b', 'B1'),
      lesson('read-b1-a', 'B1'),
      lesson('read-b2', 'B2'),
      lesson('meet-b1', 'B1', 'international-meetings'),
      { lessonId: 'legacy', cefrLevel: 'B1' }
    ]

    it('points from A2 to the nearest higher level of the same capability, by id among equals', () => {
      expect(nextLessonAfter(lessons[0], lessons)?.lessonId).toBe('read-b1-a')
      expect(nextLessonAfter(lessons[2], lessons)?.lessonId).toBe('read-b2')
    })

    it('has no next lesson at the top of a capability or without a capability', () => {
      expect(nextLessonAfter(lessons[3], lessons)).toBeNull()
      expect(nextLessonAfter(lessons[4], lessons)).toBeNull()
      expect(nextLessonAfter(lessons[5], lessons)).toBeNull()
    })

    it('skips levels that do not exist', () => {
      expect(nextLessonAfter(lesson('x-a2', 'A2'), [lesson('x-a2', 'A2'), lesson('x-b2', 'B2')])?.lessonId).toBe('x-b2')
    })
  })

  describe('isEntryLevelSkipped', () => {
    const items = [lesson('read-a2', 'A2'), lesson('read-b1', 'B1'), lesson('meet-a2', 'A2', 'international-meetings'), lesson('meet-b1', 'B1', 'international-meetings')]
    const progress = (patch: Record<string, ProgressByLesson[string]>): ProgressByLesson => patch

    it('is false for a new learner and for levels above A2', () => {
      expect(isEntryLevelSkipped(items[0], items, {})).toBe(false)
      expect(isEntryLevelSkipped(items[1], items, progress({ 'read-a2': { ...createEmptyLessonProgress(), status: 'completed' } }))).toBe(false)
    })

    it('is true once a higher lesson of the same capability was started or completed', () => {
      const started = progress({ 'read-b1': { ...createEmptyLessonProgress(), status: 'in-progress' } })
      const done = progress({ 'read-b1': { ...createEmptyLessonProgress(), status: 'completed' } })
      expect(isEntryLevelSkipped(items[0], items, started)).toBe(true)
      expect(isEntryLevelSkipped(items[0], items, done)).toBe(true)
    })

    it('ignores progress in other capabilities and untouched higher lessons', () => {
      const other = progress({ 'meet-b1': { ...createEmptyLessonProgress(), status: 'completed' } })
      expect(isEntryLevelSkipped(items[0], items, other)).toBe(false)
      expect(isEntryLevelSkipped(items[0], items, progress({ 'read-b1': createEmptyLessonProgress() }))).toBe(false)
    })
  })
})
