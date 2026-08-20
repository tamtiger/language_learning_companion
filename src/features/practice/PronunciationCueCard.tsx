import type { LearningLoopV1 } from '../../content/schema'
import { getRelevantPronunciationCues } from './learning_loop_diagnostics'

export function PronunciationCueCard({ cues, missedItemIds, onComplete }: {
  cues: LearningLoopV1['pronunciationCues']
  missedItemIds: string[]
  onComplete: () => void
}) {
  const relevant = getRelevantPronunciationCues(cues, missedItemIds)
  return (
    <section className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
      <h3 className="text-xl font-black">Cue phát âm đúng lúc</h3>
      <p className="text-sm text-zinc-300">Đây là hỗ trợ tự kiểm theo lỗi nghe diagnostic, không phải chấm phát âm đúng/sai.</p>
      {relevant.map((cue) => (
        <article key={cue.id} className="rounded-xl bg-zinc-950/60 p-4">
          <p className="font-bold">{cue.ipa ?? 'Speech cue'}</p>
          <p className="mt-2">{cue.articulatoryCue}</p>
          <p className="mt-2 text-sm text-amber-200">Rủi ro hiểu sai: {cue.meaningRisk}</p>
        </article>
      ))}
      <button type="button" onClick={onComplete} className="rounded-lg bg-amber-400 px-4 py-2 font-bold text-zinc-950">Đã hiểu cue</button>
    </section>
  )
}
