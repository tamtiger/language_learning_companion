import { useState } from 'react'
import type { Exercise } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/useAppStore'
import { languageOf } from '../../shared/lang'
import { hasCompleteAnswer, isExerciseCorrect } from './exerciseGrading'
import { orderOptions, useShuffleSalt } from './optionOrder'

export function AutoCheck({ lessonId, exercises, onExerciseCorrect }: {
  lessonId: string
  exercises: Exercise[]
  onExerciseCorrect?: (exerciseId: string) => void
}) {
  const markExerciseCorrect = useAppStore((state) => state.markExerciseCorrect)
  const salt = useShuffleSalt()
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return <div className="space-y-5">{exercises.map((exercise) => {
    const selected = answers[exercise.id] ?? []
    const shuffleSeed = `${lessonId}:${exercise.id}:${salt}`
    const pairValues = [...new Set((exercise.matchingPairs ?? []).map((candidate) => candidate.value))]
    const matches = matchingAnswers[exercise.id] ?? {}
    const correct = isExerciseCorrect(exercise, selected, matches)
    const complete = hasCompleteAnswer(exercise, selected, matches)
    const updateAnswers = (next: string[]) => {
      setAnswers((current) => ({ ...current, [exercise.id]: next }))
      setChecked((current) => ({ ...current, [exercise.id]: false }))
    }
    const checkAnswer = () => {
      setChecked((current) => ({ ...current, [exercise.id]: true }))
      if (correct) {
        markExerciseCorrect(lessonId, exercise.id)
        onExerciseCorrect?.(exercise.id)
      }
    }

    return <fieldset key={exercise.id} className="rounded-xl border border-zinc-700 p-4">
      <legend lang={languageOf(exercise.question)} className="px-2 font-semibold">{exercise.question}</legend>

      {exercise.type === 'choice' && <div className="mt-3 space-y-2">{orderOptions(exercise.options ?? [], shuffleSeed).map((option) => {
        const multi = exercise.correctAnswer.length > 1
        return <label key={option} className="flex cursor-pointer gap-3 rounded-lg border border-zinc-800 p-3 hover:bg-zinc-800/60">
          <input
            type={multi ? 'checkbox' : 'radio'}
            name={exercise.id}
            checked={selected.includes(option)}
            onChange={() => updateAnswers(multi
              ? selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
              : [option])}
          />
          <span lang={languageOf(option)}>{option}</span>
        </label>
      })}</div>}

      {exercise.type === 'fill' && <div className="mt-3">
        <label className="block text-sm font-semibold" htmlFor={`${exercise.id}-answer`}>Câu trả lời</label>
        <input
          id={`${exercise.id}-answer`}
          type="text"
          list={exercise.options?.length ? `${exercise.id}-suggestions` : undefined}
          value={selected[0] ?? ''}
          onChange={(event) => updateAnswers([event.target.value])}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
        {exercise.options?.length ? <datalist id={`${exercise.id}-suggestions`}>
          {exercise.options.map((option) => <option key={option} value={option} />)}
        </datalist> : null}
      </div>}

      {exercise.type === 'matching' && <div className="mt-3 space-y-3">{(exercise.matchingPairs ?? []).map((pair) => (
        <label key={pair.key} className="grid gap-2 rounded-lg border border-zinc-800 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
          <span className="font-semibold">{pair.key}</span>
          <select
            aria-label={pair.key}
            value={matches[pair.key] ?? ''}
            onChange={(event) => {
              setMatchingAnswers((current) => ({
                ...current,
                [exercise.id]: { ...matches, [pair.key]: event.target.value }
              }))
              setChecked((current) => ({ ...current, [exercise.id]: false }))
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
          >
            <option value="">-- Chọn --</option>
            {orderOptions(pairValues, shuffleSeed, pairValues)
              .map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      ))}</div>}

      {exercise.type === 'ordering' && <div className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">{orderOptions(exercise.options ?? [], shuffleSeed, exercise.correctAnswer).filter((option) => !selected.includes(option)).map((option) => (
          <button
            key={option}
            type="button"
            aria-label={`Thêm ${option}`}
            onClick={() => updateAnswers([...selected, option])}
            className="rounded-lg border border-zinc-700 px-3 py-2 hover:bg-zinc-800/60"
          >{option}</button>
        ))}</div>
        <ol aria-label="Thứ tự đã chọn" className="list-decimal space-y-1 pl-6">
          {selected.map((option) => <li key={option}>{option}</li>)}
        </ol>
        {selected.length > 0 && <button
          type="button"
          onClick={() => updateAnswers([])}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm"
        >Làm lại thứ tự</button>}
      </div>}

      <button type="button" disabled={!complete} onClick={checkAnswer} className="mt-3 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-40">Kiểm tra</button>
      {checked[exercise.id] && <p role="status" className={`mt-3 text-sm ${correct ? 'text-green-400' : 'text-amber-300'}`}>{correct ? 'Đúng.' : 'Chưa đúng. Hãy thử lại trước khi tiếp tục.'} {exercise.explanation}</p>}
    </fieldset>
  })}</div>
}
