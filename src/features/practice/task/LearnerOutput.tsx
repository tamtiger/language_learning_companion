import { languageOf } from '../../../shared/lang'
import type { SessionAttemptSnapshot } from './taskTypes'

export function LearnerOutput({ snapshot }: { snapshot: SessionAttemptSnapshot }) {
  return (
    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Output của bạn · chỉ trong phiên này</p>
      {snapshot.kind === 'written' ? (
        <p lang={languageOf(snapshot.text)} className="mt-3 whitespace-pre-wrap leading-7 text-zinc-200">{snapshot.text}</p>
      ) : snapshot.audioUrl ? (
        <audio className="mt-4 w-full" controls src={snapshot.audioUrl} aria-label="Output nói của bạn" />
      ) : (
        <p className="mt-3 text-zinc-300">Lượt nói timer-only: {snapshot.durationSeconds} giây.</p>
      )}
    </div>
  )
}
