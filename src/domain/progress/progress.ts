import type { CapabilityId } from '../../content/schema'

export type RubricState = 'met' | 'not-met' | 'not-rated'
export type AttemptPhase = 'baseline' | 'performance' | 'retry' | 'transfer' | 'review'

export interface IndependenceEvidence {
  usedVietnamese: boolean
  usedTranslation: boolean
  usedModelAnswer: boolean
  hintCount: number
  preparationSeconds: number
}

export interface AttemptEvidence {
  attemptId: string
  lessonId: string
  taskId: string
  capabilityId: CapabilityId
  phase: AttemptPhase
  attemptedAt: string
  durationSeconds: number
  rubric: Record<string, RubricState>
  independence: IndependenceEvidence
  completed: boolean
}

export interface LegacyImportSummary {
  completed?: boolean
  incorrectExerciseIds?: string[]
  performanceSummary?: {
    attemptCount: number
    lastAttemptAt: string | null
    latestRubric: Record<string, boolean>
    transferCompleted: boolean
  }
}

export interface LessonProgress {
  status: 'not-started' | 'in-progress' | 'completed'
  currentSectionId: string | null
  completedSectionIds: string[]
  attemptCount: number
  recentAttempts: AttemptEvidence[]
  transferCompleted: boolean
  reviewStage: number
  nextReviewAt: string | null
  lastActivityAt: string | null
  legacyImport?: LegacyImportSummary
}

export type ProgressByLesson = Record<string, LessonProgress>

export function createEmptyLessonProgress(): LessonProgress {
  return {
    status: 'not-started',
    currentSectionId: null,
    completedSectionIds: [],
    attemptCount: 0,
    recentAttempts: [],
    transferCompleted: false,
    reviewStage: 0,
    nextReviewAt: null,
    lastActivityAt: null
  }
}

export function appendAttempt(progress: LessonProgress, attempt: AttemptEvidence): LessonProgress {
  const recentAttempts = [...progress.recentAttempts, attempt].slice(-50)
  return {
    ...progress,
    status: progress.status === 'completed' ? 'completed' : 'in-progress',
    attemptCount: progress.attemptCount + 1,
    recentAttempts,
    transferCompleted: progress.transferCompleted || attempt.phase === 'transfer',
    lastActivityAt: attempt.attemptedAt
  }
}

function addDays(now: Date, days: number): string {
  return new Date(now.getTime() + days * 86_400_000).toISOString()
}

export function scheduleTransferReview(
  progress: LessonProgress,
  intervalDays: number[],
  now: Date
): LessonProgress {
  return {
    ...progress,
    transferCompleted: true,
    reviewStage: 0,
    nextReviewAt: addDays(now, intervalDays[0] ?? 1),
    lastActivityAt: now.toISOString()
  }
}

export function applyReviewResult(
  progress: LessonProgress,
  passed: boolean,
  intervalDays: number[],
  now: Date
): LessonProgress {
  if (!passed) {
    return { ...progress, nextReviewAt: addDays(now, 1), lastActivityAt: now.toISOString() }
  }

  const nextStage = progress.reviewStage + 1
  return {
    ...progress,
    reviewStage: nextStage,
    nextReviewAt: nextStage >= intervalDays.length ? null : addDays(now, intervalDays[nextStage]),
    lastActivityAt: now.toISOString()
  }
}

export interface CatalogProgressItem {
  lessonId: string
  capabilityId?: CapabilityId
  hasPerformanceTask: boolean
}

export interface TodayQueueItem extends CatalogProgressItem {
  kind: 'review' | 'resume' | 'baseline' | 'new'
  dueAt?: string
}

const CAPABILITY_ORDER: CapabilityId[] = [
  'workplace-communication',
  'technical-reading',
  'international-meetings',
  'technical-explanation',
  'international-interview',
  'technology-learning'
]

export function buildTodayQueue(
  catalog: CatalogProgressItem[],
  progressByLesson: ProgressByLesson,
  now: Date
): TodayQueueItem[] {
  const nowValue = now.getTime()
  const items = catalog.filter((lesson) => {
    const progress = progressByLesson[lesson.lessonId]
    const reviewIsDue = Boolean(
      progress?.nextReviewAt && new Date(progress.nextReviewAt).getTime() <= nowValue
    )
    return progress?.status !== 'completed' || reviewIsDue
  }).map((lesson): TodayQueueItem => {
    const progress = progressByLesson[lesson.lessonId]
    if (progress?.nextReviewAt && new Date(progress.nextReviewAt).getTime() <= nowValue) {
      return { ...lesson, kind: 'review', dueAt: progress.nextReviewAt }
    }
    if (progress?.status === 'in-progress') return { ...lesson, kind: 'resume' }
    if (lesson.hasPerformanceTask && !progress?.attemptCount) return { ...lesson, kind: 'baseline' }
    return { ...lesson, kind: 'new' }
  })

  const rank = { review: 0, resume: 1, baseline: 2, new: 3 } as const
  return items.sort((left, right) => {
    const rankDifference = rank[left.kind] - rank[right.kind]
    if (rankDifference !== 0) return rankDifference
    if (left.kind === 'review' && right.kind === 'review') {
      const dueDifference = String(left.dueAt).localeCompare(String(right.dueAt))
      if (dueDifference !== 0) return dueDifference
    }
    const leftCapability = left.capabilityId ? CAPABILITY_ORDER.indexOf(left.capabilityId) : 999
    const rightCapability = right.capabilityId ? CAPABILITY_ORDER.indexOf(right.capabilityId) : 999
    return leftCapability - rightCapability || left.lessonId.localeCompare(right.lessonId)
  })
}
