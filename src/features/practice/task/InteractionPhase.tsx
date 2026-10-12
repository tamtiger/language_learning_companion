import { advancePhase } from '../../../domain/learning/flow'
import { InteractionPractice } from '../interaction/InteractionPractice'
import { LearnerOutput } from './LearnerOutput'
import type { TaskContext } from './taskContext'

export function InteractionPhase({ ctx }: { ctx: TaskContext }) {
  const { task, setSession, learnerOutput, setProcessEvidence } = ctx
  if (!learnerOutput || task.mode !== 'spoken' || !task.learningLoop) return null
  return (
    <div className="space-y-6">
      <LearnerOutput snapshot={learnerOutput} />
      <InteractionPractice turns={task.learningLoop.interactionTurns} onComplete={(turnIds) => {
        setProcessEvidence((current) => current ? { ...current, interactionTurnIds: turnIds } : current)
        setSession((current) => advancePhase(current, 'OPEN_FEEDBACK'))
      }} />
    </div>
  )
}
