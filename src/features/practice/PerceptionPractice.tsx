import { useState } from 'react'
import type { LearningLoopV1 } from '../../content/schema'
import { ModelAudioPlayer } from './ModelAudioPlayer'
import { recordPerceptionMiss, type PerceptionPhase } from './learning_loop_diagnostics'
import { availableVoiceCount } from './model_audio'

export interface PerceptionResult {
  pretestCorrect: number
  pretestTotal: number
  trainingCompleted: number
  posttestCorrect: number
  posttestTotal: number
  diagnosticMissedItemIds: string[]
  optedOut: boolean
  availableVariantCount: number
  variabilityQualified: boolean
}

export function PerceptionPractice({ perception, onComplete }: {
  perception: LearningLoopV1['perception']
  onComplete: (result: PerceptionResult) => void
}) {
  const [phase, setPhase] = useState<PerceptionPhase>('pretest')
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [scores, setScores] = useState({ pretest: 0, posttest: 0 })
  const [missed, setMissed] = useState<string[]>([])
  const items = perception[phase]
  const item = items[index]
  const last = index === items.length - 1
  const answerItem = (value: string) => {
    if (answer) return
    setAnswer(value)
    if (value === item.correctAnswer && phase !== 'training') {
      setScores((current) => ({ ...current, [phase]: current[phase] + 1 }))
    }
    if (value !== item.correctAnswer) setMissed((current) => recordPerceptionMiss(current, phase, item.id))
  }
  const next = () => {
    if (!last) {
      setIndex(index + 1)
      setAnswer(null)
      return
    }
    if (phase === 'pretest') {
      setPhase('training'); setIndex(0); setAnswer(null); return
    }
    if (phase === 'training') {
      setPhase('posttest'); setIndex(0); setAnswer(null); return
    }
    const availableVariantCount = new Set([
      ...perception.pretest, ...perception.training, ...perception.posttest
    ].map((candidate) => availableVoiceCount(candidate.audio))).size === 0
      ? 0
      : Math.max(...[...perception.pretest, ...perception.training, ...perception.posttest].map((candidate) => availableVoiceCount(candidate.audio)))
    onComplete({
      pretestCorrect: scores.pretest,
      pretestTotal: perception.pretest.length,
      trainingCompleted: perception.training.length,
      posttestCorrect: scores.posttest,
      posttestTotal: perception.posttest.length,
      diagnosticMissedItemIds: [...new Set(missed)],
      optedOut: false,
      availableVariantCount,
      variabilityQualified: availableVariantCount >= 3
    })
  }

  return (
    <section aria-labelledby="perception-title" className="space-y-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Perception · {phase} · {index + 1}/{items.length}</p>
        <h3 id="perception-title" className="mt-2 text-xl font-black">Nghe trước khi nói</h3>
      </div>
      <ModelAudioPlayer source={item.audio} transcriptVisible={Boolean(answer)} />
      <fieldset className="space-y-2">
        <legend className="font-semibold">{item.question}</legend>
        {item.options.map((option) => (
          <button key={option} type="button" disabled={Boolean(answer)} onClick={() => answerItem(option)}
            className="mr-2 rounded-lg border border-zinc-700 px-3 py-2 disabled:opacity-70">
            {option}
          </button>
        ))}
      </fieldset>
      {answer && (
        <div className="rounded-lg bg-zinc-900 p-3 text-sm">
          <p>{answer === item.correctAnswer ? 'Đúng.' : `Đáp án: ${item.correctAnswer}`}</p>
          {phase === 'training' && <p className="mt-1 text-zinc-300">{item.feedback}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!answer} onClick={next} className="rounded-lg bg-purple-500 px-4 py-2 font-bold disabled:opacity-40">
          {last ? (phase === 'posttest' ? 'Hoàn thành perception' : 'Sang phần tiếp theo') : 'Câu tiếp'}
        </button>
        <button type="button" onClick={() => onComplete({
          pretestCorrect: scores.pretest, pretestTotal: perception.pretest.length,
          trainingCompleted: phase === 'pretest' ? 0 : index,
          posttestCorrect: scores.posttest, posttestTotal: perception.posttest.length,
          diagnosticMissedItemIds: [...new Set(missed)], optedOut: true,
          availableVariantCount: 0, variabilityQualified: false
        })} className="rounded-lg border border-zinc-700 px-4 py-2">
          Bỏ qua vì audio không phù hợp
        </button>
      </div>
    </section>
  )
}
