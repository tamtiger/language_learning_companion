import { describe, expect, it } from 'vitest'
import {
  advancePhase,
  canCompleteCapabilityMission,
  type CapabilityEvent,
  type CapabilitySession
} from './flow'

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

    expect(canCompleteCapabilityMission({
      phase: 'transfer',
      baselineAttempted: true,
      rubricRated: true,
      transferCompleted: true
    })).toBe(false)

    expect(canCompleteCapabilityMission({
      phase: 'completed',
      baselineAttempted: true,
      rubricRated: false,
      transferCompleted: true
    })).toBe(false)
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

  it('rejects events that do not belong to the current phase', () => {
    const baseline: CapabilitySession = {
      phase: 'baseline',
      baselineAttempted: false,
      rubricRated: false,
      transferCompleted: false
    }

    expect(() => advancePhase(baseline, 'START_TRANSFER')).toThrow(/baseline.*start_transfer/i)
    const input = advancePhase(baseline, 'SUBMIT_BASELINE')
    expect(() => advancePhase(input, 'SUBMIT_TRANSFER')).toThrow(/input.*submit_transfer/i)
  })

  it('models spoken interaction as an explicit legal transition', () => {
    const performance: CapabilitySession = {
      phase: 'performance',
      baselineAttempted: true,
      rubricRated: false,
      transferCompleted: false
    }

    const interaction = advancePhase(performance, 'OPEN_INTERACTION')
    expect(interaction.phase).toBe('interaction')
    expect(advancePhase(interaction, 'OPEN_FEEDBACK').phase).toBe('self-feedback')
  })

  it('rejects every post-baseline transition when baseline evidence is missing', () => {
    const transitions: Array<[CapabilitySession['phase'], CapabilityEvent]> = [
      ['input', 'COMPLETE_AUTO_CHECK'],
      ['performance', 'SUBMIT_PERFORMANCE'],
      ['performance', 'OPEN_INTERACTION'],
      ['interaction', 'OPEN_FEEDBACK'],
      ['self-feedback', 'SUBMIT_RUBRIC'],
      ['retry', 'START_TRANSFER'],
      ['transfer', 'SUBMIT_TRANSFER'],
      ['review', 'SUBMIT_REVIEW']
    ]

    for (const [phase, event] of transitions) {
      const session: CapabilitySession = {
        phase,
        baselineAttempted: false,
        rubricRated: phase === 'retry' || phase === 'transfer' || phase === 'review',
        transferCompleted: phase === 'review'
      }

      expect(() => advancePhase(session, event), `${phase}:${event}`).toThrow(/baseline/i)
    }
  })

  it('rejects transfer and review transitions when durable prerequisites are missing', () => {
    expect(() => advancePhase({
      phase: 'retry',
      baselineAttempted: true,
      rubricRated: false,
      transferCompleted: false
    }, 'START_TRANSFER')).toThrow(/rubric/i)

    expect(() => advancePhase({
      phase: 'review',
      baselineAttempted: true,
      rubricRated: true,
      transferCompleted: false
    }, 'SUBMIT_REVIEW')).toThrow(/transfer/i)
  })
})
