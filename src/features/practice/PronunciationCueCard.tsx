import type { LearningLoopV1 } from '../../content/schema'
import { Check } from 'lucide-react'
import { getRelevantPronunciationCues } from './learning_loop_diagnostics'

export function PronunciationCueCard({ cues, missedItemIds, onComplete }: {
  cues: LearningLoopV1['pronunciationCues']
  missedItemIds: string[]
  onComplete: () => void
}) {
  const relevant = getRelevantPronunciationCues(cues, missedItemIds)
  return (
    <section aria-labelledby="pronunciation-title" className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
      <h3 id="pronunciation-title" className="text-xl font-black">Luyện phát âm theo lỗi nghe</h3>
      <p className="text-sm text-zinc-300">Tập trung vào điểm vừa gây nhầm lẫn. Đây là hỗ trợ tự kiểm, không phải chấm phát âm đúng/sai.</p>
      {relevant.map((cue) => (
        <article key={cue.id} className="rounded-xl bg-zinc-950/60 p-4">
          <p className="font-bold">{cue.ipa ?? 'Speech cue'}</p>
          <p className="mt-2">{cue.articulatoryCue}</p>
          <p className="mt-2 text-sm text-amber-200">Rủi ro hiểu sai: {cue.meaningRisk}</p>
        </article>
      ))}
      <button type="button" onClick={onComplete} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 font-bold text-zinc-950">
        <Check aria-hidden="true" className="h-4 w-4" />Hoàn tất luyện phát âm
      </button>
    </section>
  )
}
