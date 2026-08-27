import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { Exercise, LessonSection } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/use_app_store'

function isExerciseCorrect(exercise: Exercise, answers: string[], matches: Record<string, string>): boolean {
  if (exercise.type === 'fill') {
    return answers.length === 1 && exercise.correctAnswer.includes(answers[0].trim())
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

function hasCompleteAnswer(exercise: Exercise, answers: string[], matches: Record<string, string>): boolean {
  if (exercise.type === 'matching') {
    return (exercise.matchingPairs ?? []).every((pair) => Boolean(matches[pair.key]))
  }
  if (exercise.type === 'ordering') return answers.length === (exercise.options?.length ?? 0)
  if (exercise.type === 'fill') return Boolean(answers[0]?.trim())
  return answers.length > 0
}

function AutoCheck({ lessonId, exercises, onExerciseCorrect }: {
  lessonId: string
  exercises: Exercise[]
  onExerciseCorrect?: (exerciseId: string) => void
}) {
  const markExerciseCorrect = useAppStore((state) => state.markExerciseCorrect)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return <div className="space-y-5">{exercises.map((exercise) => {
    const selected = answers[exercise.id] ?? []
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
      <legend className="px-2 font-semibold">{exercise.question}</legend>

      {exercise.type === 'choice' && <div className="mt-3 space-y-2">{(exercise.options ?? []).map((option) => {
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
          <span>{option}</span>
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
            {[...new Set((exercise.matchingPairs ?? []).map((candidate) => candidate.value))]
              .map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      ))}</div>}

      {exercise.type === 'ordering' && <div className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-2">{(exercise.options ?? []).filter((option) => !selected.includes(option)).map((option) => (
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

export function SectionRenderer({ lessonId, section, onExerciseCorrect }: {
  lessonId: string
  section: LessonSection
  onExerciseCorrect?: (exerciseId: string) => void
}) {
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => () => {
    if (activeUtterance.current && 'speechSynthesis' in window) {
      activeUtterance.current = null
      window.speechSynthesis.cancel()
    }
  }, [section])

  const speakWord = (word: string) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return
    if (activeUtterance.current) window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'en-US'
    activeUtterance.current = utterance
    const release = () => {
      if (activeUtterance.current === utterance) activeUtterance.current = null
    }
    utterance.onend = release
    utterance.onerror = release
    window.speechSynthesis.speak(utterance)
  }

  if (section.type === 'brief') return <section><h2 className="text-2xl font-bold">{section.title}</h2><p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-300">{section.body}</p></section>
  if (section.type === 'source') return <section><p className="text-xs font-bold uppercase tracking-wider text-purple-400">{section.format}</p><h2 className="mt-2 text-2xl font-bold">{section.title}</h2><div className="mt-4 whitespace-pre-line rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 leading-7 text-zinc-300">{section.content}</div></section>
  if (section.type === 'auto-check') return <section><h2 className="text-2xl font-bold">{section.title}</h2><div className="mt-4"><AutoCheck lessonId={lessonId} exercises={section.exercises} onExerciseCorrect={onExerciseCorrect} /></div></section>
  return <section><h2 className="text-2xl font-bold">{section.title}</h2>{section.vocabulary.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{section.vocabulary.map((item) => <article key={item.word} className="rounded-xl border border-zinc-800 p-4"><div className="flex items-center justify-between"><h3 className="font-bold">{item.word} <span className="font-normal text-purple-300">{item.ipa}</span></h3><button type="button" aria-label={`Phát âm ${item.word}`} onClick={() => speakWord(item.word)} className="rounded-lg p-2 hover:bg-zinc-800"><Volume2 aria-hidden="true" className="h-4 w-4" /></button></div><p className="mt-2 text-sm text-zinc-400">{item.technicalMeaning}</p><p className="mt-2 text-sm">{item.example}</p></article>)}</div>}{section.expressions.length > 0 && <div className="mt-5 space-y-3">{section.expressions.map((item) => <article key={item.phrase} className="rounded-xl border border-zinc-800 p-4"><h3 className="font-bold">{item.phrase}</h3><p className="mt-1 text-sm text-zinc-400">{item.meaning}</p><p className="mt-2 text-sm">{item.example}</p></article>)}</div>}</section>
}
