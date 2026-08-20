import type { CapabilityId } from '../../content/schema'

export type RubricState = 'met' | 'not-met' | 'not-rated'
export type AttemptPhase = 'baseline' | 'performance' | 'retry' | 'transfer' | 'review'
export type DurableCapabilityPhase = 'input' | 'performance' | 'retry' | 'transfer'

export interface IndependenceEvidence {
  usedVietnamese: boolean
  usedTranslation: boolean
  usedModelAnswer: boolean
  hintCount: number
  preparationSeconds: number
}

export interface AttemptProcessEvidence {
  perceptionPretestCorrect: number
  perceptionPretestTotal: number
  perceptionPosttestCorrect: number
  perceptionPosttestTotal: number
  perceptionTrainingCompleted: number
  availableVariantCount: number
  variabilityQualified: boolean
  shadowingStepIds: string[]
  listenedBack: boolean
  cueToSpeechStartMs: number | null
  interactionTurnIds: string[]
  optedOut: boolean
}

export interface AttemptEvidence {
  attemptId: string
  lessonId: string
  taskId: string
  capabilityId: CapabilityId
  phase: AttemptPhase
  attemptedAt: string
  durationSeconds: number
  wordCount: number | null
  rubric: Record<string, RubricState>
  focusCriterionId?: string
  independence: IndependenceEvidence
  process?: AttemptProcessEvidence | null
  completed: boolean
}

export function isRubricFullyMet(attempt: AttemptEvidence): boolean {
  const ratings = Object.values(attempt.rubric)
  return ratings.length > 0 && ratings.every((rating) => rating === 'met')
}

export function isIndependentAttempt(attempt: AttemptEvidence, maxHints = 0): boolean {
  const evidence = attempt.independence
  return !evidence.usedVietnamese
    && !evidence.usedTranslation
    && !evidence.usedModelAnswer
    && evidence.hintCount <= maxHints
}

export type TransferReason =
  | 'incomplete'
  | 'rubric-not-rated'
  | 'rubric-gap'
  | 'used-vietnamese'
  | 'used-translation'
  | 'used-model-answer'
  | 'too-many-hints'
  | 'too-short'
  | 'too-long'
  | 'overtime'

export interface EvidenceContract {
  maxHints: number
  timeLimitSeconds: number
  targetSeconds?: number
  minWords?: number
  maxWords?: number
}

export interface TransferAssessment {
  qualifies: boolean
  reasons: TransferReason[]
}

export function assessTransfer(
  attempt: AttemptEvidence,
  contract: EvidenceContract
): TransferAssessment {
  const reasons: TransferReason[] = []
  if (attempt.phase !== 'transfer' || !attempt.completed) reasons.push('incomplete')
  const ratings = Object.values(attempt.rubric)
  if (ratings.length === 0 || ratings.some((rating) => rating === 'not-rated')) {
    reasons.push('rubric-not-rated')
  } else if (ratings.some((rating) => rating === 'not-met')) {
    reasons.push('rubric-gap')
  }
  if (attempt.independence.usedVietnamese) reasons.push('used-vietnamese')
  if (attempt.independence.usedTranslation) reasons.push('used-translation')
  if (attempt.independence.usedModelAnswer) reasons.push('used-model-answer')
  if (attempt.independence.hintCount > contract.maxHints) reasons.push('too-many-hints')
  if (attempt.durationSeconds > contract.timeLimitSeconds) reasons.push('overtime')
  if (contract.targetSeconds !== undefined && attempt.durationSeconds < contract.targetSeconds) {
    reasons.push('too-short')
  }
  if (contract.minWords !== undefined && (attempt.wordCount ?? 0) < contract.minWords) {
    reasons.push('too-short')
  }
  if (contract.maxWords !== undefined && (attempt.wordCount ?? 0) > contract.maxWords) {
    reasons.push('too-long')
  }
  return { qualifies: reasons.length === 0, reasons }
}

export function isQualifyingTransfer(attempt: AttemptEvidence, maxHints = 0): boolean {
  return attempt.phase === 'transfer'
    && attempt.completed
    && isRubricFullyMet(attempt)
    && isIndependentAttempt(attempt, maxHints)
}

export interface LessonProgress {
  status: 'not-started' | 'in-progress' | 'completed'
  currentSectionId: string | null
  completedSectionIds: string[]
  activePhase: DurableCapabilityPhase | null
  completedExerciseIds: string[]
  attemptCount: number
  recentAttempts: AttemptEvidence[]
  transferCompleted: boolean
  reviewStage: number
  nextReviewAt: string | null
  lastActivityAt: string | null
}

export type ProgressByLesson = Record<string, LessonProgress>

export function createEmptyLessonProgress(): LessonProgress {
  return {
    status: 'not-started',
    currentSectionId: null,
    completedSectionIds: [],
    activePhase: null,
    completedExerciseIds: [],
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
