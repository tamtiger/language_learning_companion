import type { CapabilityId } from './schema'

export const NEW_CAPABILITY_MISSIONS: ReadonlyArray<{
  lessonId: string
  capabilityId: CapabilityId
}> = [
  { lessonId: 'workplace-clarification-request-b1', capabilityId: 'workplace-communication' },
  { lessonId: 'technical-log-diagnosis-b1', capabilityId: 'technical-reading' },
  { lessonId: 'meeting-disagree-and-recap-b2', capabilityId: 'international-meetings' },
  { lessonId: 'architecture-walkthrough-b2', capabilityId: 'technical-explanation' },
  { lessonId: 'behavioral-interview-ownership-b2', capabilityId: 'international-interview' },
  { lessonId: 'technology-troubleshooting-from-docs-b2', capabilityId: 'technology-learning' }
]
