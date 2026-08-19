export type CapabilityPhase =
  | 'baseline'
  | 'input'
  | 'auto-check'
  | 'performance'
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
  | 'OPEN_INPUT'
  | 'COMPLETE_AUTO_CHECK'
  | 'SUBMIT_PERFORMANCE'
  | 'OPEN_FEEDBACK'
  | 'SUBMIT_RUBRIC'
  | 'START_RETRY'
  | 'START_TRANSFER'
  | 'SUBMIT_TRANSFER'
  | 'START_REVIEW'
  | 'SUBMIT_REVIEW'

export function advancePhase(session: CapabilitySession, event: CapabilityEvent): CapabilitySession {
  if (event === 'OPEN_FEEDBACK' && !session.baselineAttempted) {
    throw new Error('Complete a baseline attempt before opening feedback')
  }

  switch (event) {
    case 'SUBMIT_BASELINE':
      return { ...session, phase: 'input', baselineAttempted: true }
    case 'OPEN_INPUT':
      return { ...session, phase: 'input' }
    case 'COMPLETE_AUTO_CHECK':
      return { ...session, phase: 'performance' }
    case 'SUBMIT_PERFORMANCE':
    case 'OPEN_FEEDBACK':
      return { ...session, phase: 'self-feedback' }
    case 'SUBMIT_RUBRIC':
      return { ...session, phase: 'retry', rubricRated: true }
    case 'START_RETRY':
      return { ...session, phase: 'retry' }
    case 'START_TRANSFER':
      return { ...session, phase: 'transfer' }
    case 'SUBMIT_TRANSFER': {
      if (!session.rubricRated) throw new Error('Rate the rubric before completing transfer')
      return { ...session, phase: 'completed', transferCompleted: true }
    }
    case 'START_REVIEW':
      return { ...session, phase: 'review' }
    case 'SUBMIT_REVIEW':
      return { ...session, phase: 'completed' }
  }
}

export function canCompleteCapabilityMission(session: CapabilitySession): boolean {
  return session.baselineAttempted && session.rubricRated && session.transferCompleted
}
