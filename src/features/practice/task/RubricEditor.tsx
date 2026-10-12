import { useId } from 'react'
import type { CanonicalPerformanceTaskV3 } from '../../../content/schema'
import type { RubricState } from '../../../domain/progress/progress'
import { languageOf } from '../../../shared/lang'

export function RubricEditor({ task, answers, setAnswers }: {
  task: CanonicalPerformanceTaskV3
  answers: Record<string, RubricState>
  setAnswers: (answers: Record<string, RubricState>) => void
}) {
  const groupId = useId()
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold">Self-rubric</legend>
      {task.rubric.map((item) => (
        <div key={item.id} role="group" aria-labelledby={`${groupId}-${item.id}`} className="rounded-xl border border-zinc-700 p-4">
          <p id={`${groupId}-${item.id}`} className="font-semibold">{item.label}</p>
          <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
          {item.anchors && (
            <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-green-500/10 p-2">
                <dt className="font-semibold text-green-300">Đạt trông như</dt>
                <dd lang={languageOf(item.anchors.met)} className="mt-1 text-zinc-300">{item.anchors.met}</dd>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2">
                <dt className="font-semibold text-amber-200">Chưa đạt trông như</dt>
                <dd lang={languageOf(item.anchors.notMet)} className="mt-1 text-zinc-300">{item.anchors.notMet}</dd>
              </div>
            </dl>
          )}
          <div className="mt-3 flex gap-2">
            {(['met', 'not-met'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={answers[item.id] === value}
                onClick={() => setAnswers({ ...answers, [item.id]: value })}
                className={`rounded-lg border px-3 py-2 text-sm font-bold ${answers[item.id] === value
                  ? value === 'met'
                    ? 'border-green-400 bg-green-500/20 text-green-300'
                    : 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-zinc-700'}`}
              >
                {value === 'met' ? 'Đạt' : 'Chưa đạt'}
              </button>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  )
}
