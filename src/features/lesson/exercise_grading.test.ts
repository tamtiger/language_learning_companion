import { describe, expect, it } from 'vitest'
import { getBundledCatalog } from '../../content/catalog'
import { ExerciseSchema, type Exercise } from '../../content/schema'
import { hasCompleteAnswer, isExerciseCorrect, normalizeAnswer } from './exercise_grading'

function fill(correctAnswer: string[], acceptedAnswers?: string[]): Exercise {
  return ExerciseSchema.parse({
    id: 'fill-1', type: 'fill', question: 'Điền: ___', correctAnswer, ...(acceptedAnswers ? { acceptedAnswers } : {})
  })
}

const grade = (exercise: Exercise, answer: string) => isExerciseCorrect(exercise, [answer], {})

describe('normalizeAnswer', () => {
  it('normalizes case, spacing, trailing punctuation, quotes and Unicode form', () => {
    expect(normalizeAnswer('  Data   Base. ')).toBe('data base')
    expect(normalizeAnswer('It’s')).toBe("it's")
    expect(normalizeAnswer('“Quoted”')).toBe('"quoted"')
    expect(normalizeAnswer('café')).toBe(normalizeAnswer('café'))
    expect(normalizeAnswer('Done!?')).toBe('done')
  })

  it('keeps IPA stress marks distinct from the ASCII apostrophe', () => {
    expect(normalizeAnswer('ˈ')).not.toBe(normalizeAnswer("'"))
    expect(normalizeAnswer('ˈ')).not.toBe(normalizeAnswer('ˌ'))
  })
})

describe('fill grading', () => {
  it('accepts formatting differences of the correct answer', () => {
    const exercise = fill(["It's a retry"])
    for (const answer of ["it's a retry", "It’s a retry.", "  IT'S   A RETRY  ", "It's a retry!"]) {
      expect(grade(exercise, answer)).toBe(true)
    }
  })

  it('rejects wrong answers and empty answers', () => {
    const exercise = fill(['database'])
    expect(grade(exercise, 'databases')).toBe(false)
    expect(grade(exercise, 'data base')).toBe(false)
    expect(isExerciseCorrect(exercise, [], {})).toBe(false)
    expect(isExerciseCorrect(exercise, ['database', 'extra'], {})).toBe(false)
  })

  it('accepts acceptedAnswers in addition to correctAnswer', () => {
    const exercise = fill(['ˈ'], ["'"])
    expect(grade(exercise, 'ˈ')).toBe(true)
    expect(grade(exercise, "'")).toBe(true)
    expect(grade(exercise, '’')).toBe(true)
    expect(grade(exercise, 'ˌ')).toBe(false)
  })

  it('does not accept the ASCII apostrophe for an IPA-only answer without acceptedAnswers', () => {
    expect(grade(fill(['ˈ']), "'")).toBe(false)
  })

  it('reports completeness from the trimmed first answer', () => {
    const exercise = fill(['x'])
    expect(hasCompleteAnswer(exercise, ['  '], {})).toBe(false)
    expect(hasCompleteAnswer(exercise, ['x'], {})).toBe(true)
  })
})

describe('other exercise types keep their behavior', () => {
  it('grades choice, ordering and matching exactly', () => {
    const choice = ExerciseSchema.parse({ id: 'c', type: 'choice', question: 'q', options: ['a', 'b'], correctAnswer: ['a'] })
    expect(isExerciseCorrect(choice, ['a'], {})).toBe(true)
    expect(isExerciseCorrect(choice, ['b'], {})).toBe(false)

    const ordering = ExerciseSchema.parse({ id: 'o', type: 'ordering', question: 'q', options: ['b', 'a'], correctAnswer: ['a', 'b'] })
    expect(isExerciseCorrect(ordering, ['a', 'b'], {})).toBe(true)
    expect(isExerciseCorrect(ordering, ['b', 'a'], {})).toBe(false)

    const matching = ExerciseSchema.parse({
      id: 'm', type: 'matching', question: 'q', matchingPairs: [{ key: 'k', value: 'v' }], correctAnswer: ['k - v']
    })
    expect(isExerciseCorrect(matching, [], { k: 'v' })).toBe(true)
    expect(isExerciseCorrect(matching, [], { k: 'x' })).toBe(false)
  })
})

describe('acceptedAnswers schema', () => {
  it('is only allowed on fill exercises', () => {
    expect(() => ExerciseSchema.parse({
      id: 'c', type: 'choice', question: 'q', options: ['a', 'b'], correctAnswer: ['a'], acceptedAnswers: ['b']
    })).toThrow(/acceptedAnswers/)
  })

  it('rejects duplicates and entries equal to a correct answer after normalization', () => {
    expect(() => fill(['database'], ['Database.'])).toThrow(/acceptedAnswers/)
    expect(() => fill(['database'], ['db', 'DB'])).toThrow(/acceptedAnswers/)
  })
})

describe('bundled content', () => {
  it('has no fill exercise that only accepts non-ASCII symbols', () => {
    const offenders: string[] = []
    for (const lesson of getBundledCatalog().lessons) {
      for (const section of lesson.sections) {
        if (section.type !== 'auto-check') continue
        for (const exercise of section.exercises) {
          if (exercise.type !== 'fill') continue
          const answers = [...exercise.correctAnswer, ...(exercise.acceptedAnswers ?? [])]
          // eslint-disable-next-line no-control-regex
          if (!answers.some((answer) => /^[\x00-\x7f]+$/.test(answer))) offenders.push(`${lesson.lessonId}/${exercise.id}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
