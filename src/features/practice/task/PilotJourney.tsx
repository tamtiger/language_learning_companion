import { Ear, Mic2, RefreshCw } from 'lucide-react'
import type { CapabilityPhase } from '../../../domain/learning/flow'

export function PilotJourney({ phase }: { phase: CapabilityPhase }) {
  const activeIndex = phase === 'baseline' || phase === 'input'
    ? 0
    : phase === 'performance' || phase === 'interaction' || phase === 'self-feedback'
      ? 1
      : 2
  const stages = [
    { label: 'Understand', detail: 'Nghe và nhận biết', icon: Ear },
    { label: 'Retrieve', detail: 'Tự nói và tương tác', icon: Mic2 },
    { label: 'Repair', detail: 'Sửa, transfer, review', icon: RefreshCw }
  ]
  return (
    <div role="group" aria-label="Tiến trình pilot" className="grid grid-cols-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
      {stages.map(({ label, detail, icon: Icon }, index) => (
        <div key={label} className={`min-w-0 border-r border-zinc-800 px-2 py-3 text-center last:border-r-0 sm:px-4 ${index === activeIndex ? 'bg-cyan-500/10 text-cyan-100' : index < activeIndex ? 'text-green-300' : 'text-zinc-400'}`}>
          <Icon aria-hidden="true" className="mx-auto h-4 w-4" />
          <span aria-current={index === activeIndex ? 'step' : undefined} className="mt-1 block truncate text-xs font-bold sm:text-sm">{label}</span>
          <span className="mt-0.5 hidden text-xs sm:block">{detail}</span>
        </div>
      ))}
    </div>
  )
}
