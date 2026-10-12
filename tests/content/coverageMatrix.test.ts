import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { CAPABILITY_IDS, type CanonicalLesson, type CapabilityId } from '@/content/schema'

const MIN_VOCABULARY_ITEMS = 8
const MAX_VOCABULARY_ITEMS = 15
const MIN_MISSIONS_PER_CAPABILITY = 6
const MIN_DIVERSE_SHARE = 0.3
const MIN_ERROR_CORRECTIONS = 6

const missions = (): CanonicalLesson[] => getBundledCatalog().lessons.filter((lesson) => lesson.capabilities.length > 0)

const languageSupport = (lesson: CanonicalLesson) =>
  lesson.sections.find((section) => section.type === 'language-support')

/** Words plus their collocations: what the learner is asked to remember from one mission. */
function vocabularyItems(lesson: CanonicalLesson): number {
  const section = languageSupport(lesson)
  if (section?.type !== 'language-support') return 0
  return section.vocabulary.reduce((total, entry) => total + 1 + (entry.collocations?.length ?? 0), 0)
}

function autoCheckExercises(lesson: CanonicalLesson) {
  return lesson.sections.flatMap((section) => (section.type === 'auto-check' ? section.exercises : []))
}

const isErrorCorrection = (exercise: { type: string; question: string }) =>
  exercise.type === 'fill' && /^Sửa lỗi:/u.test(exercise.question)

describe('vocabulary per mission', () => {
  it('teaches between 8 and 15 domain words or collocations in every mission', () => {
    const outside = missions()
      .map((lesson) => ({ id: lesson.lessonId, count: vocabularyItems(lesson) }))
      .filter(({ count }) => count < MIN_VOCABULARY_ITEMS || count > MAX_VOCABULARY_ITEMS)
    expect(outside).toEqual([])
  })

  it('reviews the taught words in a vocabulary-review section with matching and fill practice', () => {
    for (const lesson of missions()) {
      const review = lesson.sections.find((section) => section.type === 'vocabulary-review')
      expect(review, lesson.lessonId).toBeDefined()
      if (review?.type !== 'vocabulary-review') continue
      const taught = languageSupport(lesson)
      const words = taught?.type === 'language-support' ? taught.vocabulary.map((entry) => entry.word.toLowerCase()) : []
      expect(review.wordRefs.length, lesson.lessonId).toBeGreaterThanOrEqual(3)
      expect(review.wordRefs.every((word) => words.includes(word.toLowerCase())), lesson.lessonId).toBe(true)
      const types = new Set(review.exercises.map((exercise) => exercise.type))
      expect(types.has('matching'), lesson.lessonId).toBe(true)
      expect(types.has('fill'), lesson.lessonId).toBe(true)
    }
  })
})

describe('coverage matrix', () => {
  const byCapability = (capability: CapabilityId) => missions().filter((lesson) => lesson.capabilities[0] === capability)
  const intermediate = (capability: CapabilityId) =>
    byCapability(capability).filter((lesson) => lesson.cefrLevel === 'B1' || lesson.cefrLevel === 'B2')

  it.each(CAPABILITY_IDS)('%s has at least six B1 or B2 missions with both levels', (capability) => {
    const lessons = intermediate(capability)
    expect(lessons.length).toBeGreaterThanOrEqual(MIN_MISSIONS_PER_CAPABILITY)
    expect(lessons.some((lesson) => lesson.cefrLevel === 'B1')).toBe(true)
    expect(lessons.some((lesson) => lesson.cefrLevel === 'B2')).toBe(true)
  })

  it('fills the cells that were empty: workplace speaking, reading B2, explanation B1 and writing, interview B1, learning B1', () => {
    const mode = (lesson: CanonicalLesson) => lesson.performanceTask?.mode
    const cell = (capability: CapabilityId, level: string, wanted?: string) =>
      byCapability(capability).some((lesson) => lesson.cefrLevel === level && (!wanted || mode(lesson) === wanted))
    expect(cell('workplace-communication', 'B1', 'spoken')).toBe(true)
    expect(cell('workplace-communication', 'B2', 'spoken')).toBe(true)
    expect(cell('technical-reading', 'B2')).toBe(true)
    expect(cell('technical-explanation', 'B1', 'spoken')).toBe(true)
    expect(cell('technical-explanation', 'B1', 'written')).toBe(true)
    expect(byCapability('technical-explanation').some((lesson) => mode(lesson) === 'written')).toBe(true)
    expect(cell('international-interview', 'B1', 'spoken')).toBe(true)
    expect(byCapability('technology-learning').filter((lesson) => lesson.cefrLevel === 'B1').length).toBeGreaterThanOrEqual(3)
    expect(cell('technology-learning', 'B1', 'spoken')).toBe(true)
  })
})

describe('auto-check variety', () => {
  it('keeps at least 30% of every mission\'s exercises beyond multiple choice', () => {
    const low = missions()
      .map((lesson) => {
        const exercises = autoCheckExercises(lesson)
        const diverse = exercises.filter((exercise) => exercise.type !== 'choice').length
        return { id: lesson.lessonId, share: exercises.length === 0 ? 0 : diverse / exercises.length }
      })
      .filter(({ share }) => share < MIN_DIVERSE_SHARE)
    expect(low).toEqual([])
  })

  it('includes error-correction practice across the library', () => {
    const corrections = missions().flatMap((lesson) => autoCheckExercises(lesson).filter(isErrorCorrection))
    expect(corrections.length).toBeGreaterThanOrEqual(MIN_ERROR_CORRECTIONS)
  })
})
