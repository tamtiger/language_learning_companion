import type { CanonicalLesson, CanonicalPerformanceTaskV3 } from '../../../content/schema'
import type { LessonEntry } from '../../../domain/progress/progress'
import { PilotJourney } from './PilotJourney'
import { TaskHeader } from './TaskHeader'
import { CompletedView } from './CompletedView'
import { InputPhase } from './InputPhase'
import { InteractionPhase } from './InteractionPhase'
import { FeedbackPhase } from './FeedbackPhase'
import { AttemptPhase } from './AttemptPhase'
import { useTaskState } from './useTaskState'
import { useTaskActions } from './useTaskActions'
import type { TaskContext } from './taskContext'

export function CapabilityTask({ lesson, task, entry }: {
  lesson: CanonicalLesson
  task: CanonicalPerformanceTaskV3
  entry?: LessonEntry
}) {
  const state = useTaskState({ lesson, task, entry })
  const actions = useTaskActions(state)
  const ctx: TaskContext = { ...state, ...actions }
  const { phase, isPilot, learnerOutput } = ctx

  if (phase === 'completed') return <CompletedView ctx={ctx} />

  return (
    <section aria-labelledby="task-title" className="space-y-6">
      {isPilot && <PilotJourney phase={phase} />}
      <TaskHeader ctx={ctx} />
      {phase === 'input' ? <InputPhase ctx={ctx} />
        : phase === 'interaction' && task.mode === 'spoken' && task.learningLoop && learnerOutput ? <InteractionPhase ctx={ctx} />
          : phase === 'self-feedback' && learnerOutput ? <FeedbackPhase ctx={ctx} />
            : <AttemptPhase ctx={ctx} />}
    </section>
  )
}
