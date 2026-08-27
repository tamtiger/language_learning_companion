export type CapabilityPhase =
  | 'baseline'
  | 'input'
  | 'auto-check'
  | 'performance'
  | 'interaction'
  | 'self-feedback'
  | 'retry'
  | 'transfer'
  | 'completed'
  | 'review'

export interface CapabilitySession {
  phase: CapabilityPhase
  baselineAttempted: boolean
  rubricRated: boolean
  transferCompleted: boolean
}

export type CapabilityEvent =
  | 'SUBMIT_BASELINE'
  | 'COMPLETE_AUTO_CHECK'
  | 'SUBMIT_PERFORMANCE'
  | 'OPEN_INTERACTION'
  | 'OPEN_FEEDBACK'
  | 'SUBMIT_RUBRIC'
  | 'START_TRANSFER'
  | 'SUBMIT_TRANSFER'
  | 'SUBMIT_REVIEW'

function assertSessionPrerequisites(session: CapabilitySession): void {
  if (session.phase !== 'baseline' && !session.baselineAttempted) {
    throw new Error('Complete a baseline attempt before continuing')
  }
  if (['retry', 'transfer', 'completed', 'review'].includes(session.phase) && !session.rubricRated) {
    throw new Error('Rate the rubric before continuing')
  }
  if (['completed', 'review'].includes(session.phase) && !session.transferCompleted) {
    throw new Error('Complete transfer before continuing')
  }
}

export function advancePhase(session: CapabilitySession, event: CapabilityEvent): CapabilitySession {
  const allowedPhases: Record<CapabilityEvent, CapabilityPhase[]> = {
    SUBMIT_BASELINE: ['baseline'],
    COMPLETE_AUTO_CHECK: ['input'],
    SUBMIT_PERFORMANCE: ['performance'],
    OPEN_INTERACTION: ['performance'],
    OPEN_FEEDBACK: ['performance', 'interaction'],
    SUBMIT_RUBRIC: ['self-feedback'],
    START_TRANSFER: ['retry'],
    SUBMIT_TRANSFER: ['transfer'],
    SUBMIT_REVIEW: ['review']
  }
  assertSessionPrerequisites(session)
  if (!allowedPhases[event].includes(session.phase)) {
    throw new Error(`Phase ${session.phase} cannot handle ${event}`)
  }

  switch (event) {
    case 'SUBMIT_BASELINE':
      return { ...session, phase: 'input', baselineAttempted: true }
    case 'COMPLETE_AUTO_CHECK':
      return { ...session, phase: 'performance' }
    case 'OPEN_INTERACTION':
      return { ...session, phase: 'interaction' }
    case 'SUBMIT_PERFORMANCE':
    case 'OPEN_FEEDBACK':
      return { ...session, phase: 'self-feedback' }
    case 'SUBMIT_RUBRIC':
      return { ...session, phase: 'retry', rubricRated: true }
    case 'START_TRANSFER':
      return { ...session, phase: 'transfer' }
    case 'SUBMIT_TRANSFER': {
      if (!session.rubricRated) throw new Error('Rate the rubric before completing transfer')
      return { ...session, phase: 'completed', transferCompleted: true }
    }
    case 'SUBMIT_REVIEW':
      return { ...session, phase: 'completed' }
  }
}

export function canCompleteCapabilityMission(session: CapabilitySession): boolean {
  return session.phase === 'completed'
    && session.baselineAttempted
    && session.rubricRated
    && session.transferCompleted
}
