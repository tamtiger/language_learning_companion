import type { CapabilityId } from '../../content/schema'
import type { ProgressByLesson } from './progress'

export type PathwayLevel = 'A2' | 'B1' | 'B2' | 'C1'

export const CEFR_RANK: Record<PathwayLevel, number> = { A2: 0, B1: 1, B2: 2, C1: 3 }

export interface PathwayLesson {
  lessonId: string
  capabilityId?: CapabilityId
  cefrLevel: PathwayLevel
}

/** The lesson to take after this one: the nearest higher level of the same capability (then by id). */
export function nextLessonAfter<T extends PathwayLesson>(lesson: PathwayLesson, lessons: readonly T[]): T | null {
  if (!lesson.capabilityId) return null
  const higher = lessons
    .filter((candidate) => candidate.capabilityId === lesson.capabilityId
      && CEFR_RANK[candidate.cefrLevel] > CEFR_RANK[lesson.cefrLevel])
    .sort((left, right) => CEFR_RANK[left.cefrLevel] - CEFR_RANK[right.cefrLevel] || left.lessonId.localeCompare(right.lessonId))
  return higher[0] ?? null
}

/** True when an A2 entry lesson should not be suggested because the learner already works above it. */
export function isEntryLevelSkipped(
  lesson: PathwayLesson,
  lessons: readonly PathwayLesson[],
  progressByLesson: ProgressByLesson
): boolean {
  if (lesson.cefrLevel !== 'A2' || !lesson.capabilityId) return false
  return lessons.some((candidate) => candidate.capabilityId === lesson.capabilityId
    && CEFR_RANK[candidate.cefrLevel] > CEFR_RANK.A2
    && (progressByLesson[candidate.lessonId]?.status ?? 'not-started') !== 'not-started')
}
