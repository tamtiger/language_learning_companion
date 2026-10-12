import { languageOf } from '../../../shared/lang'
import { MODE_LABELS, PHASE_LABELS, PHASE_DESCRIPTIONS } from './taskConstants'
import { OutputContractPanel } from './OutputContractPanel'
import type { TaskContext } from './taskContext'

export function TaskHeader({ ctx }: { ctx: TaskContext }) {
  const { task, phase, taskTitleRef, firstAttempt, practiceContext } = ctx
  return (
    <>
    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
      <p id="task-phase-label" className="text-xs font-bold uppercase tracking-widest text-purple-300">
        {MODE_LABELS[task.mode]} · {PHASE_LABELS[phase]}
      </p>
      <h2 ref={taskTitleRef} tabIndex={-1} id="task-title" className="mt-2 text-2xl font-black">{task.title}<span className="sr-only"> — {PHASE_LABELS[phase]}</span></h2>
      <p lang={languageOf(practiceContext?.brief ?? task.scenario)} className="mt-3 text-zinc-300">{practiceContext?.brief ?? task.scenario}</p>
      <p className="mt-2 text-sm text-purple-100">{PHASE_DESCRIPTIONS[phase]}</p>
    </div>

    <OutputContractPanel key={firstAttempt ? 'first' : 'later'} task={task} firstView={firstAttempt} />
    </>
  )
}
