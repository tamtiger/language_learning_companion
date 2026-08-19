import { describe, expect, it } from 'vitest'
import { advancePhase, canCompleteCapabilityMission, type CapabilitySession } from './flow'

describe('capability learning flow', () => {
  it('keeps model feedback locked until a baseline attempt exists', () => {
    const session: CapabilitySession = {
      phase: 'baseline',
      baselineAttempted: false,
      rubricRated: false,
      transferCompleted: false
    }

    expect(() => advancePhase(session, 'OPEN_FEEDBACK')).toThrow(/baseline/i)
    expect(advancePhase(session, 'SUBMIT_BASELINE')).toMatchObject({
      phase: 'input',
      baselineAttempted: true
    })
  })

  it('requires a rated transfer attempt before capability completion', () => {
    expect(canCompleteCapabilityMission({
      phase: 'transfer',
      baselineAttempted: true,
      rubricRated: true,
      transferCompleted: false
    })).toBe(false)

    expect(canCompleteCapabilityMission({
      phase: 'completed',
      baselineAttempted: true,
      rubricRated: true,
      transferCompleted: true
    })).toBe(true)
  })

  it('returns a delayed review to the completed state after submission', () => {
    const reviewing: CapabilitySession = {
      phase: 'review',
      baselineAttempted: true,
      rubricRated: true,
      transferCompleted: true
    }

    expect(advancePhase(reviewing, 'SUBMIT_REVIEW').phase).toBe('completed')
  })
})
