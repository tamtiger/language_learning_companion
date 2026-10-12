import type { CanonicalLesson } from '../../content/schema'
import type { LessonProgress } from '../progress/progress'
import type { CapabilityPhase } from './flow'

export const SESSION_COUNT = 3
export type SessionIndex = 1 | 2 | 3

const SESSION_LABELS: Record<SessionIndex, string> = {
  1: 'Thử sức và học',
  2: 'Luyện và sửa',
  3: 'Vận dụng mới'
}

const MIN_COMMITMENT_MINUTES = 5
const MAX_COMMITMENT_MINUTES = 30

export function sessionLabel(index: SessionIndex): string {
  return SESSION_LABELS[index]
}

/** The session a phase belongs to; review and a finished mission sit outside the three sessions. */
export function sessionOf(phase: CapabilityPhase): SessionIndex | null {
  switch (phase) {
    case 'baseline':
    case 'input':
    case 'auto-check':
      return 1
    case 'performance':
    case 'interaction':
    case 'self-feedback':
    case 'retry':
      return 2
    case 'transfer':
      return 3
    default:
      return null
  }
}

/** Where a learner who left the mission lands again, derived from the saved checkpoint. */
export function currentSession(progress: LessonProgress | undefined): SessionIndex | null {
  if (progress?.status === 'completed') return null
  switch (progress?.activePhase) {
    case 'performance':
    case 'retry':
      return 2
    case 'transfer':
      return 3
    default:
      return 1
  }
}

const wordCount = (text: string): number => text.trim().split(/\s+/u).filter(Boolean).length
const secondsToReadWords = (words: number): number => (words / 120) * 60

function inputSeconds(lesson: CanonicalLesson): number {
  return lesson.sections.reduce((total, section) => {
    switch (section.type) {
      case 'source': return total + secondsToReadWords(wordCount(section.content))
      case 'language-support': return total + section.vocabulary.length * 20 + section.expressions.length * 15
      case 'auto-check': return total + section.exercises.length * 40
      case 'vocabulary-review': return total + section.exercises.length * 30
      case 'brief': return total + 30
      case 'listening-source': return total + section.durationSeconds + (section.gist.length + section.detail.length) * 40
      case 'long-reading':
        return total
          + secondsToReadWords(section.parts.reduce((words, part) => words + wordCount(part.content), 0))
          + (section.skim.length + section.scan.length) * 40
      default: return total
    }
  }, 0)
}

function attemptSeconds(task: NonNullable<CanonicalLesson['performanceTask']>): number {
  const preparation = task.independenceContract.preparationSeconds
  return task.mode === 'spoken'
    ? preparation + task.outputContract.targetSeconds
    : preparation + ((task.outputContract.minWords + task.outputContract.maxWords) / 2) * 4
}

function learningLoopSeconds(task: NonNullable<CanonicalLesson['performanceTask']>): number {
  if (task.mode !== 'spoken' || !task.learningLoop) return 0
  const loop = task.learningLoop
  const items = loop.perception.pretest.length + loop.perception.training.length + loop.perception.posttest.length
  return items * 15 + loop.chunks.length * 20 + 150 + loop.interactionTurns.length * 40 + 60
}

/** Estimated minutes for each of the three sessions, from the lesson's own content. */
export function estimateSessionMinutes(lesson: CanonicalLesson): [number, number, number] {
  const task = lesson.performanceTask
  if (!task) return [lesson.durationMinutes, 0, 0]
  const attempt = attemptSeconds(task)
  const first = attempt + 30 + inputSeconds(lesson)
  const second = attempt + 90 + learningLoopSeconds(task) + attempt * 0.8
  const third = attempt + 60
  return [first / 60, second / 60, third / 60]
}

/** What a learner commits to in one sitting: the longest session, rounded up and kept inside the schema range. */
export function commitmentMinutes(lesson: CanonicalLesson): number {
  const longest = Math.max(...estimateSessionMinutes(lesson))
  return Math.min(MAX_COMMITMENT_MINUTES, Math.max(MIN_COMMITMENT_MINUTES, Math.ceil(longest)))
}
