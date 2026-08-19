import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { Exercise, LessonSection } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/use_app_store'

function exerciseOptions(exercise: Exercise): string[] {
  return exercise.options ?? exercise.matchingPairs?.map((pair) => `${pair.key} - ${pair.value}`) ?? []
}

function AutoCheck({ lessonId, exercises }: { lessonId: string; exercises: Exercise[] }) {
  const logIncorrectAnswer = useAppStore((state) => state.logIncorrectAnswer)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  return <div className="space-y-5">{exercises.map((exercise) => {
    const selected = answers[exercise.id] ?? []
    const multi = exercise.correctAnswer.length > 1
    const correct = selected.length === exercise.correctAnswer.length && selected.every((answer) => exercise.correctAnswer.includes(answer))
    return <fieldset key={exercise.id} className="rounded-xl border border-zinc-700 p-4"><legend className="px-2 font-semibold">{exercise.question}</legend><div className="mt-3 space-y-2">{exerciseOptions(exercise).map((option) => <label key={option} className="flex cursor-pointer gap-3 rounded-lg border border-zinc-800 p-3 hover:bg-zinc-800/60"><input type={multi ? 'checkbox' : 'radio'} name={exercise.id} checked={selected.includes(option)} onChange={() => setAnswers((current) => ({ ...current, [exercise.id]: multi ? selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option] : [option] }))} /> <span>{option}</span></label>)}</div><button type="button" disabled={selected.length === 0} onClick={() => { setChecked((current) => ({ ...current, [exercise.id]: true })); if (!correct) logIncorrectAnswer(lessonId, exercise.id) }} className="mt-3 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-950 disabled:opacity-40">Kiểm tra</button>{checked[exercise.id] && <p role="status" className={`mt-3 text-sm ${correct ? 'text-green-400' : 'text-amber-300'}`}>{correct ? 'Đúng.' : `Chưa đúng. Đáp án: ${exercise.correctAnswer.join(', ')}`} {exercise.explanation}</p>}</fieldset>
  })}</div>
}

export function SectionRenderer({ lessonId, section }: { lessonId: string; section: LessonSection }) {
  if (section.type === 'brief') return <section><h2 className="text-2xl font-bold">{section.title}</h2><p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-300">{section.body}</p></section>
  if (section.type === 'source') return <section><p className="text-xs font-bold uppercase tracking-wider text-purple-400">{section.format}</p><h2 className="mt-2 text-2xl font-bold">{section.title}</h2><div className="mt-4 whitespace-pre-line rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 leading-7 text-zinc-300">{section.content}</div></section>
  if (section.type === 'auto-check') return <section><h2 className="text-2xl font-bold">{section.title}</h2><div className="mt-4"><AutoCheck lessonId={lessonId} exercises={section.exercises} /></div></section>
  return <section><h2 className="text-2xl font-bold">{section.title}</h2>{section.vocabulary.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{section.vocabulary.map((item) => <article key={item.word} className="rounded-xl border border-zinc-800 p-4"><div className="flex items-center justify-between"><h3 className="font-bold">{item.word} <span className="font-normal text-purple-300">{item.ipa}</span></h3><button type="button" aria-label={`Phát âm ${item.word}`} onClick={() => { if ('speechSynthesis' in window) { const utterance = new SpeechSynthesisUtterance(item.word); utterance.lang = 'en-US'; window.speechSynthesis.speak(utterance) } }} className="rounded-lg p-2 hover:bg-zinc-800"><Volume2 aria-hidden="true" className="h-4 w-4" /></button></div><p className="mt-2 text-sm text-zinc-400">{item.technicalMeaning}</p><p className="mt-2 text-sm">{item.example}</p></article>)}</div>}{section.expressions.length > 0 && <div className="mt-5 space-y-3">{section.expressions.map((item) => <article key={item.phrase} className="rounded-xl border border-zinc-800 p-4"><h3 className="font-bold">{item.phrase}</h3><p className="mt-1 text-sm text-zinc-400">{item.meaning}</p><p className="mt-2 text-sm">{item.example}</p></article>)}</div>}</section>
}
