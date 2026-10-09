import type { CapabilityId } from '../../content/schema'

export type RubricState = 'met' | 'not-met' | 'not-rated'
/** Why a lesson is opened: a due review, or continuing the cycle in progress. */
export type LessonEntry = 'review' | 'continue'
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
  listenBackChecklistCompleted: boolean
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
  /** Outcome recorded when a transfer or review was saved; never recomputed from current content. */
  assessment?: AttemptAssessment
  /** Digest of the evidence contract the assessment was made against. */
  contentRevision?: string
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
  | 'lesson-mismatch'
  | 'task-mismatch'
  | 'capability-mismatch'
  | 'rubric-mismatch'
  | 'rubric-not-rated'
  | 'rubric-gap'
  | 'used-vietnamese'
  | 'used-translation'
  | 'used-model-answer'
  | 'too-many-hints'
  | 'preparation-overtime'
  | 'too-short'
  | 'too-long'
  | 'overtime'
  | 'listen-back-missing'
  | 'interaction-incomplete'

export interface EvidenceContract {
  expectedLessonId: string
  expectedTaskId: string
  expectedCapabilityId: CapabilityId | null
  forbidVietnamese: boolean
  forbidTranslation: boolean
  forbidModelAnswer: boolean
  maxHints: number
  maxPreparationSeconds: number
  requiredRubricIds: string[]
  timeLimitSeconds: number
  targetSeconds?: number
  minWords?: number
  maxWords?: number
  requireListenBack?: boolean
  requiredInteractionTurnIds?: string[]
}

export interface TransferAssessment {
  qualifies: boolean
  reasons: TransferReason[]
}

export type AttemptAssessment = TransferAssessment

function assessAttempt(
  attempt: AttemptEvidence,
  contract: EvidenceContract,
  expectedPhase: 'transfer' | 'review'
): TransferAssessment {
  const reasons: TransferReason[] = []
  if (attempt.phase !== expectedPhase || !attempt.completed) reasons.push('incomplete')
  if (attempt.lessonId !== contract.expectedLessonId) reasons.push('lesson-mismatch')
  if (attempt.taskId !== contract.expectedTaskId) reasons.push('task-mismatch')
  if (attempt.capabilityId !== contract.expectedCapabilityId) reasons.push('capability-mismatch')
  const actualRubricIds = Object.keys(attempt.rubric).sort()
  const requiredRubricIds = [...contract.requiredRubricIds].sort()
  if (actualRubricIds.length !== requiredRubricIds.length
    || actualRubricIds.some((id, index) => id !== requiredRubricIds[index])) {
    reasons.push('rubric-mismatch')
  }
  const ratings = Object.values(attempt.rubric)
  if (ratings.length === 0 || ratings.some((rating) => rating === 'not-rated')) {
    reasons.push('rubric-not-rated')
  } else if (ratings.some((rating) => rating === 'not-met')) {
    reasons.push('rubric-gap')
  }
  if (contract.forbidVietnamese && attempt.independence.usedVietnamese) reasons.push('used-vietnamese')
  if (contract.forbidTranslation && attempt.independence.usedTranslation) reasons.push('used-translation')
  if (contract.forbidModelAnswer && attempt.independence.usedModelAnswer) reasons.push('used-model-answer')
  if (attempt.independence.hintCount > contract.maxHints) reasons.push('too-many-hints')
  if (attempt.independence.preparationSeconds > contract.maxPreparationSeconds) {
    reasons.push('preparation-overtime')
  }
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
  if (contract.requireListenBack && (!attempt.process?.listenedBack || !attempt.process.listenBackChecklistCompleted)) {
    reasons.push('listen-back-missing')
  }
  if (contract.requiredInteractionTurnIds?.some((id) => !attempt.process?.interactionTurnIds.includes(id))) {
    reasons.push('interaction-incomplete')
  }
  return { qualifies: reasons.length === 0, reasons }
}

export function assessTransfer(attempt: AttemptEvidence, contract: EvidenceContract): TransferAssessment {
  return assessAttempt(attempt, contract, 'transfer')
}

export function assessReview(attempt: AttemptEvidence, contract: EvidenceContract): TransferAssessment {
  return assessAttempt(attempt, contract, 'review')
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
  activeProcessEvidence: AttemptProcessEvidence | null
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
    activeProcessEvidence: null,
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
    lastActivityAt: attempt.attemptedAt
  }
}

/** ISO instant of 00:00 local time, `days` calendar days after the local day of `from`. */
export function addLocalDays(from: Date, days: number): string {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days).toISOString()
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
    nextReviewAt: addLocalDays(now, intervalDays[0] ?? 1),
    lastActivityAt: now.toISOString()
  }
}

/**
 * Applies the outcome of a saved transfer attempt; `progress` already contains the attempt.
 * Only a qualifying transfer completes the mission and starts the review schedule.
 */
export function applyTransferOutcome(
  progress: LessonProgress,
  assessment: TransferAssessment,
  intervalDays: number[],
  now: Date
): LessonProgress {
  if (!assessment.qualifies) {
    return { ...progress, status: 'in-progress', activePhase: 'transfer', transferCompleted: false }
  }
  return {
    ...scheduleTransferReview(progress, intervalDays, now),
    status: 'completed',
    activePhase: null
  }
}

export function applyReviewResult(
  progress: LessonProgress,
  passed: boolean,
  intervalDays: number[],
  now: Date
): LessonProgress {
  if (!passed) {
    return { ...progress, nextReviewAt: addLocalDays(now, 1), lastActivityAt: now.toISOString() }
  }

  const nextStage = progress.reviewStage + 1
  return {
    ...progress,
    reviewStage: nextStage,
    nextReviewAt: nextStage >= intervalDays.length ? null : addLocalDays(now, intervalDays[nextStage]),
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
  const items = catalog.flatMap((lesson): TodayQueueItem[] => {
    const progress = progressByLesson[lesson.lessonId]
    const dueAt = progress?.nextReviewAt && new Date(progress.nextReviewAt).getTime() <= nowValue
      ? progress.nextReviewAt
      : undefined
    // A due review stays visible next to an in-progress repeat of the same lesson.
    const review: TodayQueueItem[] = dueAt ? [{ ...lesson, kind: 'review', dueAt }] : []
    if (progress?.status === 'in-progress') return [...review, { ...lesson, kind: 'resume' }]
    if (review.length > 0) return review
    if (progress?.status === 'completed') return []
    if (lesson.hasPerformanceTask && !progress?.attemptCount) return [{ ...lesson, kind: 'baseline' }]
    return [{ ...lesson, kind: 'new' }]
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
