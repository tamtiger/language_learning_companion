import { useState } from 'react'
import type { LearningLoopV1 } from '../../content/schema'
import { ModelAudioPlayer } from './ModelAudioPlayer'

const STEP_LABEL: Record<LearningLoopV1['shadowingSteps'][number], string> = {
  listen: 'Nghe để hiểu ý',
  'chunk-shadow': 'Shadow từng chunk',
  'full-shadow': 'Shadow cả câu',
  'delayed-imitation': 'Đợi 3 giây rồi nói lại',
  variation: 'Thay dữ kiện và tự nói'
}

export function GuidedShadowing({ chunks, steps, onComplete }: {
  chunks: LearningLoopV1['chunks']
  steps: LearningLoopV1['shadowingSteps']
  onComplete: (stepIds: string[]) => void
}) {
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const chunk = chunks[index % chunks.length]
  const last = index === steps.length - 1
  const transcriptVisible = step === 'chunk-shadow' || step === 'full-shadow'
  const chunkVisible = transcriptVisible || step === 'variation'
  return (
    <section aria-labelledby="shadowing-title" className="space-y-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-purple-300">Guided shadowing · {index + 1}/{steps.length}</p>
        <h3 id="shadowing-title" className="mt-2 text-xl font-black">{STEP_LABEL[step]}</h3>
      </div>
      <ModelAudioPlayer source={chunk.modelAudio} transcriptVisible={transcriptVisible} />
      {chunkVisible && <p className="leading-7"><strong>{chunk.function}:</strong> {chunk.text}</p>}
      {chunkVisible && chunk.stressPattern && <p className="text-sm text-purple-200">Stress: {chunk.stressPattern}</p>}
      {step === 'delayed-imitation' && <p className="text-sm text-zinc-300">Phát mẫu, chờ ba giây, sau đó nói mà không nhìn transcript.</p>}
      {step === 'variation' && <p className="text-sm text-zinc-300">Thay các slot: {chunk.slots.join(', ')}.</p>}
      <button type="button" onClick={() => last ? onComplete([...steps]) : setIndex(index + 1)} className="rounded-lg bg-purple-500 px-4 py-2 font-bold">
        {last ? 'Hoàn thành guided practice' : 'Hoàn thành bước này'}
      </button>
    </section>
  )
}
