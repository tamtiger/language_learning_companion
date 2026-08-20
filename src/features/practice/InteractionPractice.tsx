import { useState } from 'react'
import type { LearningLoopV1 } from '../../content/schema'
import { ModelAudioPlayer } from './ModelAudioPlayer'
import { SpokenResponse, type SpokenAttemptSnapshot } from './SpokenResponse'

export function InteractionPractice({ turns, onComplete }: {
  turns: LearningLoopV1['interactionTurns']
  onComplete: (turnIds: string[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [snapshot, setSnapshot] = useState<SpokenAttemptSnapshot | null>(null)
  const turn = turns[index]
  const finish = () => {
    snapshot?.release?.()
    if (index === turns.length - 1) onComplete(turns.map((item) => item.id))
    else {
      setIndex(index + 1)
      setSnapshot(null)
    }
  }
  return (
    <section className="space-y-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Interaction · {turn.kind}</p>
      <h3 className="text-xl font-black">{turn.prompt}</h3>
      {turn.audio && <ModelAudioPlayer source={turn.audio} transcriptVisible />}
      <p className="text-sm text-zinc-300">Mục tiêu: {turn.expectedFunction}</p>
      <SpokenResponse key={turn.id} onReady={setSnapshot} />
      <button type="button" disabled={!snapshot} onClick={finish} className="rounded-lg bg-cyan-400 px-4 py-2 font-bold text-zinc-950 disabled:opacity-40">
        {index === turns.length - 1 ? 'Hoàn thành interaction' : 'Lượt tiếp theo'}
      </button>
    </section>
  )
}
