import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from './catalog'
import { normalizeAnswer } from './answer_normalization'
import type { CanonicalLesson, ModelAudioSource } from './schema'

/** Single place to tune the answer-design gate; change a value only together with a written reason. */
export const ASSESSMENT_THRESHOLDS = {
  minOptions: 3,
  maxOptions: 4,
  /** Share of items whose correct option is the longest one; random choice among 3-4 options is about 30%. */
  maxLongestCorrectShareCorpus: 0.45,
  maxLongestCorrectShareLesson: 0.6,
  /** A lesson needs at least this many items before its per-lesson share is judged. */
  minItemsForLessonShare: 5,
  maxLongestToShortestRatio: 2.5
} as const

type ItemKind = 'perception' | 'ladder' | 'choice'

interface AssessmentItem {
  lessonId: string
  id: string
  kind: ItemKind
  options: string[]
  correct: string
  /** Text the learner hears or reads; used for the keyword-parity rule. */
  reference: string
}

interface OrderingExercise {
  lessonId: string
  id: string
  options: string[]
  correctAnswer: string[]
}

interface Violation {
  rule: string
  where: string
  detail: string
}

function audioText(audio: ModelAudioSource): string {
  return audio.kind === 'speech-synthesis' ? audio.text : audio.transcript
}

function words(value: string): string {
  return ` ${value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `
}

function appearsIn(option: string, reference: string): boolean {
  const needle = words(option)
  return needle.trim().length > 0 && words(reference).includes(needle)
}

export function findItemViolations(items: AssessmentItem[]): Violation[] {
  const violations: Violation[] = []
  for (const item of items) {
    const where = `${item.lessonId}/${item.id}`
    const { minOptions, maxOptions, maxLongestToShortestRatio } = ASSESSMENT_THRESHOLDS
    if (item.options.length < minOptions || item.options.length > maxOptions) {
      violations.push({ rule: 'option-count', where, detail: `${item.options.length} options (need ${minOptions}-${maxOptions})` })
    }
    const normalized = item.options.map(normalizeAnswer)
    if (new Set(normalized).size !== normalized.length) {
      violations.push({ rule: 'duplicate-options', where, detail: 'two options are identical after normalization' })
    }
    const lengths = item.options.map((option) => option.length)
    if (Math.max(...lengths) / Math.max(1, Math.min(...lengths)) > maxLongestToShortestRatio) {
      violations.push({ rule: 'length-ratio', where, detail: `longest/shortest option exceeds ${maxLongestToShortestRatio}` })
    }
    const distractors = item.options.filter((option) => option !== item.correct)
    if (appearsIn(item.correct, item.reference) && !distractors.some((option) => appearsIn(option, item.reference))) {
      violations.push({ rule: 'keyword-parity', where, detail: 'only the correct option repeats words from the audio or source' })
    }
  }
  return violations
}

function longestIsCorrect(item: AssessmentItem): boolean {
  const longest = Math.max(...item.options.map((option) => option.length))
  return item.options.filter((option) => option.length === longest).length === 1
    && item.correct.length === longest
}

export function findLongestAnswerViolations(items: AssessmentItem[]): Violation[] {
  const violations: Violation[] = []
  const share = (list: AssessmentItem[]) => list.filter(longestIsCorrect).length / Math.max(1, list.length)
  const corpus = share(items)
  if (corpus > ASSESSMENT_THRESHOLDS.maxLongestCorrectShareCorpus) {
    violations.push({
      rule: 'longest-corpus',
      where: 'corpus',
      detail: `correct option is the longest in ${(corpus * 100).toFixed(0)}% of ${items.length} items`
    })
  }
  const byLesson = new Map<string, AssessmentItem[]>()
  for (const item of items) byLesson.set(item.lessonId, [...(byLesson.get(item.lessonId) ?? []), item])
  for (const [lessonId, list] of byLesson) {
    if (list.length < ASSESSMENT_THRESHOLDS.minItemsForLessonShare) continue
    const lessonShare = share(list)
    if (lessonShare > ASSESSMENT_THRESHOLDS.maxLongestCorrectShareLesson) {
      violations.push({
        rule: 'longest-lesson',
        where: lessonId,
        detail: `correct option is the longest in ${(lessonShare * 100).toFixed(0)}% of ${list.length} items`
      })
    }
  }
  return violations
}

export function findOrderingViolations(exercises: OrderingExercise[]): Violation[] {
  return exercises
    .filter((exercise) => exercise.options.length === exercise.correctAnswer.length
      && exercise.options.every((option, index) => option === exercise.correctAnswer[index]))
    .map((exercise) => ({
      rule: 'ordering-authored-order',
      where: `${exercise.lessonId}/${exercise.id}`,
      detail: 'options are authored in the correct order'
    }))
}

function collect(lessons: CanonicalLesson[]): { items: AssessmentItem[]; orderings: OrderingExercise[] } {
  const items: AssessmentItem[] = []
  const orderings: OrderingExercise[] = []
  for (const lesson of lessons) {
    const task = lesson.performanceTask
    if (task && 'learningLoop' in task && task.learningLoop) {
      const { pretest, training, posttest } = task.learningLoop.perception
      for (const item of [...pretest, ...training, ...posttest]) {
        items.push({
          lessonId: lesson.lessonId, id: item.id, kind: 'perception', options: item.options,
          correct: item.correctAnswer, reference: audioText(item.audio)
        })
      }
    }
    if (task && 'readingLadder' in task && task.readingLadder) {
      const source = task.readingLadder.trainingSource.content
      for (const item of task.readingLadder.extractionItems) {
        items.push({
          lessonId: lesson.lessonId, id: item.id, kind: 'ladder', options: item.options,
          correct: item.correctAnswer, reference: source
        })
      }
    }
    for (const section of lesson.sections) {
      if (section.type !== 'auto-check') continue
      for (const exercise of section.exercises) {
        if (exercise.type === 'choice' && exercise.correctAnswer.length === 1) {
          items.push({
            lessonId: lesson.lessonId, id: exercise.id, kind: 'choice', options: exercise.options ?? [],
            correct: exercise.correctAnswer[0], reference: ''
          })
        }
        if (exercise.type === 'ordering') {
          orderings.push({
            lessonId: lesson.lessonId, id: exercise.id, options: exercise.options ?? [], correctAnswer: exercise.correctAnswer
          })
        }
      }
    }
  }
  return { items, orderings }
}

const item = (overrides: Partial<AssessmentItem>): AssessmentItem => ({
  lessonId: 'lesson', id: 'item', kind: 'perception',
  options: ['workers are down', 'queue backlog', 'cache eviction'], correct: 'queue backlog',
  reference: 'The queue backlog is growing because workers are down.', ...overrides
})

describe('assessment gate catches design flaws', () => {
  it('accepts a well-formed item', () => {
    expect(findItemViolations([item({})])).toEqual([])
  })

  it('rejects too few or too many options', () => {
    expect(findItemViolations([item({ options: ['queue backlog', 'cache'], correct: 'queue backlog' })]).map((v) => v.rule))
      .toContain('option-count')
    expect(findItemViolations([item({ options: ['a1', 'b2', 'c3', 'd4', 'e5'], correct: 'a1', reference: '' })]).map((v) => v.rule))
      .toContain('option-count')
  })

  it('rejects options that are identical after normalization', () => {
    const rules = findItemViolations([item({ options: ['Queue backlog.', 'queue  backlog', 'cache eviction'], correct: 'cache eviction' })]).map((v) => v.rule)
    expect(rules).toContain('duplicate-options')
  })

  it('rejects a large length gap between options', () => {
    const rules = findItemViolations([item({
      options: ['no', 'a very long distractor that nobody would pick', 'queue backlog'], correct: 'queue backlog'
    })]).map((v) => v.rule)
    expect(rules).toContain('length-ratio')
  })

  it('rejects a correct option that is the only one repeating words from the reference', () => {
    const rules = findItemViolations([item({
      options: ['workers restart', 'queue backlog', 'disk is full'], correct: 'queue backlog'
    })]).map((v) => v.rule)
    expect(rules).toContain('keyword-parity')
  })

  it('accepts keyword parity when a distractor also repeats reference words', () => {
    expect(findItemViolations([item({
      options: ['workers are down', 'queue backlog', 'disk is full'], correct: 'queue backlog'
    })])).toEqual([])
  })

  it('flags a corpus and a lesson where the correct option is mostly the longest', () => {
    const longCorrect = (index: number) => item({
      id: `i${index}`, options: ['short', 'brief one', 'the clearly longest option'], correct: 'the clearly longest option', reference: ''
    })
    const rules = findLongestAnswerViolations(Array.from({ length: 6 }, (_, index) => longCorrect(index))).map((v) => v.rule)
    expect(rules).toEqual(expect.arrayContaining(['longest-corpus', 'longest-lesson']))
  })

  it('does not judge the per-lesson share of tiny lessons', () => {
    const rules = findLongestAnswerViolations([item({ options: ['a', 'bb', 'ccc'], correct: 'ccc', reference: '' })]).map((v) => v.rule)
    expect(rules).not.toContain('longest-lesson')
  })

  it('rejects an ordering exercise authored in its correct order', () => {
    expect(findOrderingViolations([{ lessonId: 'l', id: 'o', options: ['a', 'b'], correctAnswer: ['a', 'b'] }])).toHaveLength(1)
    expect(findOrderingViolations([{ lessonId: 'l', id: 'o', options: ['b', 'a'], correctAnswer: ['a', 'b'] }])).toHaveLength(0)
  })
})

describe('bundled content passes the assessment gate', () => {
  const { items, orderings } = collect(getBundledCatalog().lessons)

  it('collects perception, ladder and choice items', () => {
    const kinds = new Set(items.map((entry) => entry.kind))
    expect([...kinds].sort()).toEqual(['choice', 'ladder', 'perception'])
  })

  it('has well-formed options for every item', () => {
    const violations = findItemViolations(items)
    expect(violations.map((v) => `${v.rule} ${v.where}: ${v.detail}`)).toEqual([])
  })

  it('does not let the longest option give the answer away', () => {
    expect(findLongestAnswerViolations(items).map((v) => `${v.rule} ${v.where}: ${v.detail}`)).toEqual([])
  })

  it('authors ordering exercises out of order', () => {
    expect(findOrderingViolations(orderings).map((v) => `${v.rule} ${v.where}: ${v.detail}`)).toEqual([])
  })
})
