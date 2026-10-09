import { useEffect, useRef, useState } from 'react'
import type { LearningLoopV1 } from '../../content/schema'
import { ModelAudioPlayer } from './ModelAudioPlayer'
import { SpokenResponse, type SpokenAttemptSnapshot } from './SpokenResponse'

const TURN_KIND_LABELS: Record<LearningLoopV1['interactionTurns'][number]['kind'], string> = {
  'follow-up': 'Hỏi tiếp',
  clarification: 'Làm rõ',
  misunderstanding: 'Hiểu nhầm',
  interruption: 'Bị ngắt lời',
  repair: 'Sửa lại',
  recap: 'Tóm tắt lại'
}

export function InteractionPractice({ turns, onComplete }: {
  turns: LearningLoopV1['interactionTurns']
  onComplete: (turnIds: string[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [snapshot, setSnapshot] = useState<SpokenAttemptSnapshot | null>(null)
  const ownedSnapshot = useRef<SpokenAttemptSnapshot | null>(null)
  const promptHeading = useRef<HTMLHeadingElement>(null)
  const previousIndex = useRef(index)
  const turn = turns[index]

  useEffect(() => {
    if (previousIndex.current !== index) promptHeading.current?.focus()
    previousIndex.current = index
  }, [index])

  useEffect(() => () => {
    const currentSnapshot = ownedSnapshot.current
    ownedSnapshot.current = null
    currentSnapshot?.release?.()
  }, [])

  const handleReady = (nextSnapshot: SpokenAttemptSnapshot | null) => {
    ownedSnapshot.current = nextSnapshot
    setSnapshot(nextSnapshot)
  }

  const finish = () => {
    const completedSnapshot = ownedSnapshot.current
    ownedSnapshot.current = null
    completedSnapshot?.release?.()
    setSnapshot(null)
    if (index === turns.length - 1) onComplete(turns.map((item) => item.id))
    else {
      setIndex(index + 1)
    }
  }
  return (
    <section className="space-y-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Tương tác · {TURN_KIND_LABELS[turn.kind]}</p>
      <h3 ref={promptHeading} tabIndex={-1} className="text-xl font-black">{turn.prompt}</h3>
      {turn.audio && <ModelAudioPlayer source={turn.audio} transcriptVisible />}
      <p className="text-sm text-zinc-300">Mục tiêu: {turn.expectedFunction}</p>
      <SpokenResponse key={turn.id} onReady={handleReady} />
      <button type="button" disabled={!snapshot} onClick={finish} className="rounded-lg bg-cyan-400 px-4 py-2 font-bold text-zinc-950 disabled:opacity-40">
        {index === turns.length - 1 ? 'Hoàn thành interaction' : 'Lượt tiếp theo'}
      </button>
    </section>
  )
}
