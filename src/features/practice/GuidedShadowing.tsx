import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LearningLoopV1 } from '../../content/schema'
import { languageOf } from '../../shared/lang'
import { ModelAudioPlayer } from './ModelAudioPlayer'

const STEP_LABEL: Record<LearningLoopV1['shadowingSteps'][number], string> = {
  listen: 'Nghe để hiểu ý',
  'chunk-shadow': 'Shadow từng chunk',
  'full-shadow': 'Shadow cả câu',
  'delayed-imitation': 'Đợi 3 giây rồi nói lại',
  variation: 'Thay dữ kiện và tự nói'
}

export function GuidedShadowing({ chunks, steps, initialIndex, onIndexChange, onComplete }: {
  chunks: LearningLoopV1['chunks']
  steps: LearningLoopV1['shadowingSteps']
  /** Step to resume at; ignored when out of range. */
  initialIndex?: number
  onIndexChange?: (index: number) => void
  onComplete: (stepIds: string[]) => void
}) {
  const [index, setIndexState] = useState(initialIndex !== undefined && initialIndex < steps.length ? initialIndex : 0)
  const setIndex = (next: number) => {
    setIndexState(next)
    onIndexChange?.(next)
  }
  const step = steps[index]
  const chunkIndex = index % chunks.length
  const chunk = chunks[chunkIndex]
  const last = index === steps.length - 1
  const transcriptVisible = step === 'chunk-shadow' || step === 'full-shadow'
  const chunkVisible = transcriptVisible || step === 'variation'
  return (
    <section aria-labelledby="shadowing-title" className="space-y-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Luyện theo cụm câu</p>
          <h3 id="shadowing-title" className="mt-2 text-xl font-black">{STEP_LABEL[step]}</h3>
        </div>
        <p aria-live="polite" className="flex flex-wrap gap-2 text-xs font-semibold text-zinc-300">
          <span className="rounded-md bg-zinc-800 px-2 py-1">Chunk {chunkIndex + 1}/{chunks.length}</span>
          <span className="rounded-md bg-zinc-800 px-2 py-1">Bước {index + 1}/{steps.length}</span>
        </p>
      </div>
      <ModelAudioPlayer source={chunk.modelAudio} transcriptVisible={transcriptVisible} />
      {chunkVisible && <p lang={languageOf(chunk.text)} className="leading-7"><strong>{chunk.function}:</strong> {chunk.text}</p>}
      {chunkVisible && chunk.stressPattern && <p className="text-sm text-purple-200">Stress: {chunk.stressPattern}</p>}
      {step === 'delayed-imitation' && <p className="text-sm text-zinc-300">Phát mẫu, chờ ba giây, sau đó nói mà không nhìn transcript.</p>}
      {step === 'variation' && <p className="text-sm text-zinc-300">Thay các slot: {chunk.slots.join(', ')}.</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 font-bold disabled:opacity-30" aria-label="Quay lại bước trước">
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />Quay lại
        </button>
        <button type="button" onClick={() => last ? onComplete([...steps]) : setIndex(index + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-bold text-zinc-950">
          {last ? <Check aria-hidden="true" className="h-4 w-4" /> : null}
          {last ? 'Hoàn thành Sentence chunks' : 'Hoàn thành bước này'}
          {!last ? <ChevronRight aria-hidden="true" className="h-4 w-4" /> : null}
        </button>
      </div>
    </section>
  )
}
