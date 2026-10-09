import type { CanonicalLesson, CanonicalPerformanceTaskV3 } from '@/content/schema'
import { collectSources } from './contentInventory'
import { findFuturePhaseLeaks } from './contentRules'

const VIETNAMESE_LETTERS = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/gi

export const MAX_CHUNK_WORDS = 8
export const MAX_SENTENCE_WORDS = 14
export const MAX_AVERAGE_RESPONSE_WORDS = 10
export const MAX_AVERAGE_SOURCE_WORDS = 14

export function wordCount(text: string): number {
  return text.replace(/___/g, ' ').trim().split(/\s+/u).filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}

export function sentencesOf(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/u).map((sentence) => sentence.trim()).filter(Boolean)
}

/** Share of letters that are Vietnamese-only letters; 0 for text without any. */
export function vietnameseShare(text: string): number {
  const letters = text.match(/\p{L}/gu)?.length ?? 0
  return letters === 0 ? 0 : (text.match(VIETNAMESE_LETTERS)?.length ?? 0) / letters
}

/** Prompts must not get more Vietnamese from baseline to review, and the review prompt is English only. */
export function findPromptViolations(prompts: { baseline: string; performance: string; retry: string; transfer: string; review: string }): string[] {
  const order = ['baseline', 'performance', 'retry', 'transfer', 'review'] as const
  const shares = order.map((phase) => vietnameseShare(prompts[phase]))
  const violations: string[] = []
  if (shares[0] === 0) violations.push('baseline prompt must be bilingual (it has no Vietnamese)')
  for (let index = 1; index < shares.length; index += 1) {
    if (shares[index] > shares[index - 1] + 1e-9) violations.push(`${order[index]} prompt has more Vietnamese than ${order[index - 1]}`)
  }
  if (shares[4] > 0) violations.push('review prompt must be English only')
  return violations
}

export function findChunkViolations(chunks: Array<{ id: string; text: string }>): string[] {
  return chunks.flatMap((chunk) => wordCount(chunk.text) > MAX_CHUNK_WORDS ? [`${chunk.id}: chunk has more than ${MAX_CHUNK_WORDS} words`] : [])
}

export function findSentenceViolations(text: string, label: string, maxAverage: number): string[] {
  const sentences = sentencesOf(text)
  if (sentences.length === 0) return [`${label}: no sentences`]
  const lengths = sentences.map(wordCount)
  const violations = sentences.flatMap((sentence, index) =>
    lengths[index] > MAX_SENTENCE_WORDS ? [`${label}: sentence over ${MAX_SENTENCE_WORDS} words: "${sentence.slice(0, 40)}…"`] : [])
  const average = lengths.reduce((total, length) => total + length, 0) / lengths.length
  if (average > maxAverage) violations.push(`${label}: average sentence length ${average.toFixed(1)} is over ${maxAverage}`)
  return violations
}

const LANGUAGE_DIMENSIONS = ['accuracy', 'range', 'register']

export function findRubricViolations(rubric: CanonicalPerformanceTaskV3['rubric']): string[] {
  const violations: string[] = []
  if (rubric.length < 3 || rubric.length > 5) violations.push('rubric must have 3 to 5 criteria')
  if (!rubric.some((item) => item.dimension === 'task')) violations.push('rubric needs a task criterion')
  if (!rubric.some((item) => item.dimension && LANGUAGE_DIMENSIONS.includes(item.dimension))) violations.push('rubric needs a language criterion')
  for (const item of rubric) {
    if (!item.anchors) violations.push(`${item.id}: missing anchors`)
    else if (item.anchors.met.trim() === item.anchors.notMet.trim()) violations.push(`${item.id}: anchors must differ`)
  }
  return violations
}

export function findPerceptionViolations(loop: NonNullable<Extract<CanonicalPerformanceTaskV3, { mode: 'spoken' }>['learningLoop']>): string[] {
  const items = [...loop.perception.pretest, ...loop.perception.training, ...loop.perception.posttest]
  return items.flatMap((item) => item.options.length === 3 ? [] : [`${item.id}: perception items need exactly 3 options`])
}

/** Every measurable A2 rule for one lesson; an empty list means the lesson is a valid A2 entry mission. */
export function findA2Violations(lesson: CanonicalLesson): string[] {
  const task = lesson.performanceTask
  const label = lesson.lessonId
  if (!task) return [`${label}: an A2 lesson needs a performance task`]
  const violations: string[] = []
  if (lesson.durationMinutes < 10 || lesson.durationMinutes > 15) violations.push('durationMinutes must be 10 to 15')

  if (task.mode === 'spoken') {
    const { targetSeconds, timeLimitSeconds } = task.outputContract
    if (targetSeconds < 20 || targetSeconds > 30 || timeLimitSeconds > 45) violations.push('spoken output must target 20 to 30 seconds within 45')
    if (!task.learningLoop) violations.push('spoken A2 missions need a learning loop')
    else {
      violations.push(...findPerceptionViolations(task.learningLoop), ...findChunkViolations(task.learningLoop.chunks))
      const leaks = findFuturePhaseLeaks(lesson)
      if (leaks.length > 0) violations.push(`learning loop leaks later-phase facts: ${leaks.join(', ')}`)
    }
  } else {
    const { minWords, maxWords, timeLimitSeconds } = task.outputContract
    if (minWords !== 40 || maxWords > 70 || timeLimitSeconds > 300) violations.push('written output must be 40 to at most 70 words within 300 seconds')
  }

  violations.push(...findPromptViolations({
    baseline: task.baselinePrompt, performance: task.performancePrompt, retry: task.retryPrompt, transfer: task.transferPrompt, review: task.reviewPrompt
  }))
  violations.push(...findSentenceViolations(task.modelResponse, 'modelResponse', MAX_AVERAGE_RESPONSE_WORDS))
  for (const source of collectSources(lesson)) {
    violations.push(...findSentenceViolations(source.content.replace(/^Synthetic training artifact — non-production\.\s*/u, ''), `source ${source.id}`, MAX_AVERAGE_SOURCE_WORDS))
  }
  violations.push(...findRubricViolations(task.rubric))

  const support = lesson.sections.find((section) => section.type === 'language-support')
  if (support?.type !== 'language-support') violations.push('missing language-support section')
  else {
    if (support.vocabulary.length < 4 || support.vocabulary.some((item) => item.collocations.length < 1)) violations.push('needs at least 4 vocabulary items, each with a collocation')
    if (support.expressions.length < 3) violations.push('needs at least 3 expressions')
  }
  const exercises = lesson.sections.flatMap((section) => section.type === 'auto-check' ? section.exercises : [])
  if (exercises.length < 4) violations.push('needs at least 4 auto-check exercises')
  if (!exercises.some((exercise) => exercise.type === 'fill' || exercise.type === 'ordering')) violations.push('needs a fill or ordering exercise')

  if (lesson.reviewPolicy.interleave !== true) violations.push('reviewPolicy.interleave must be on')
  if (lesson.reviewPolicy.intervalDays.length < 5) violations.push('reviewPolicy needs at least 5 intervals')
  return violations.map((violation) => (violation.startsWith(label) ? violation : `${label}: ${violation}`))
}
