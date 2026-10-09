import { normalizeAnswer } from '../../content/answer_normalization'
import type { Exercise } from '../../content/schema'

export { normalizeAnswer }

export function isExerciseCorrect(exercise: Exercise, answers: string[], matches: Record<string, string>): boolean {
  if (exercise.type === 'fill') {
    if (answers.length !== 1) return false
    const accepted = new Set([...exercise.correctAnswer, ...(exercise.acceptedAnswers ?? [])].map(normalizeAnswer))
    return accepted.has(normalizeAnswer(answers[0]))
  }
  if (exercise.type === 'matching') {
    return (exercise.matchingPairs ?? []).every((pair) =>
      exercise.correctAnswer.includes(`${pair.key} - ${matches[pair.key] ?? ''}`)
    )
  }
  if (exercise.type === 'ordering') {
    return answers.length === exercise.correctAnswer.length
      && answers.every((answer, index) => answer === exercise.correctAnswer[index])
  }
  return answers.length === exercise.correctAnswer.length
    && answers.every((answer) => exercise.correctAnswer.includes(answer))
}

export function hasCompleteAnswer(exercise: Exercise, answers: string[], matches: Record<string, string>): boolean {
  if (exercise.type === 'matching') {
    return (exercise.matchingPairs ?? []).every((pair) => Boolean(matches[pair.key]))
  }
  if (exercise.type === 'ordering') return answers.length === (exercise.options?.length ?? 0)
  if (exercise.type === 'fill') return Boolean(answers[0]?.trim())
  return answers.length > 0
}
