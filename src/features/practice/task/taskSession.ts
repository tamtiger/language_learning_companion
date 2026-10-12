import type { CapabilitySession } from '../../../domain/learning/flow'
import type { LessonEntry, LessonProgress } from '../../../domain/progress/progress'

export function initialSession(
  progress: LessonProgress | undefined,
  entry?: LessonEntry,
  now = Date.now()
): CapabilitySession {
  const completed: CapabilitySession = {
    phase: 'completed', baselineAttempted: true, rubricRated: true, transferCompleted: true
  }
  const reviewDue = Boolean(progress?.nextReviewAt && new Date(progress.nextReviewAt).getTime() <= now)
  // An in-progress repeat keeps its cycle unless the learner explicitly opened the due review.
  if (reviewDue && (progress?.status !== 'in-progress' || entry === 'review')) {
    return { ...completed, phase: 'review' }
  }
  if (progress?.status === 'completed') return completed
  switch (progress?.activePhase) {
    case 'input':
      return { phase: 'input', baselineAttempted: true, rubricRated: false, transferCompleted: false }
    case 'performance':
      return { phase: 'performance', baselineAttempted: true, rubricRated: false, transferCompleted: false }
    case 'retry':
      return { phase: 'retry', baselineAttempted: true, rubricRated: true, transferCompleted: false }
    case 'transfer':
      return { phase: 'transfer', baselineAttempted: true, rubricRated: true, transferCompleted: false }
    default:
      return { phase: 'baseline', baselineAttempted: false, rubricRated: false, transferCompleted: false }
  }
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  return String(minutes).padStart(2, '0') + ':' + String(totalSeconds % 60).padStart(2, '0')
}

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/u).length : 0
}


export function attemptId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `attempt-${Date.now()}`
}
