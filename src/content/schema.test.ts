import { describe, expect, it } from 'vitest'
import { LessonV3Schema, type LessonV3 } from './schema'

export const validWrittenMission: LessonV3 = {
  schemaVersion: 'v3',
  lessonId: 'workplace-issue-update-b1',
  title: 'Write an actionable issue update',
  summary: 'Communicate impact and next action.',
  cefrLevel: 'B1',
  durationMinutes: 12,
  learningObjectives: ['Write a concise issue update without translation.'],
  capabilities: ['workplace-communication'],
  workflowTags: ['issue-update'],
  sections: [
    { id: 'brief', type: 'brief', title: 'Mission', body: 'Update an international team.' },
    {
      id: 'source',
      type: 'source',
      title: 'Issue context',
      format: 'technical-doc',
      content: 'Checkout requests return HTTP 503 after the latest deployment.'
    },
    {
      id: 'check',
      type: 'auto-check',
      title: 'Check the impact',
      exercises: [{
        id: 'impact',
        type: 'choice',
        question: 'What is the user impact?',
        options: ['Checkout is unavailable', 'The dashboard is slow'],
        correctAnswer: ['Checkout is unavailable'],
        explanation: 'The source names checkout requests.'
      }]
    }
  ],
  performanceTask: {
    id: 'issue-update-task',
    mode: 'written',
    title: 'Write the update',
    scenario: 'Your distributed team needs an async incident update.',
    baselinePrompt: 'Write the update before opening any support.',
    performancePrompt: 'Write context, impact, next step and one request.',
    modelResponse: 'Checkout is unavailable after the latest deployment. I am checking the release diff and need the platform team to confirm the rollback owner.',
    retryPrompt: 'Rewrite it with one concrete impact and request.',
    transferPrompt: 'Write a new update after rollback restored checkout but delayed orders remain.',
    reviewPrompt: 'Write an update for a similar API incident without looking at your earlier response.',
    outputContract: {
      timeLimitSeconds: 480,
      requiredElements: ['context', 'impact', 'next step', 'request'],
      minWords: 80,
      maxWords: 120
    },
    independenceContract: {
      noVietnamese: true,
      noTranslation: true,
      noModelAnswer: true,
      maxHints: 1,
      preparationSeconds: 60
    },
    feedbackPriorities: ['Actionability', 'Specificity'],
    rubric: [
      { id: 'context', label: 'Context', description: 'Names the concrete incident.' },
      { id: 'impact', label: 'Impact', description: 'Explains the user or team impact.' },
      { id: 'action', label: 'Action', description: 'States a next step and request.' }
    ]
  },
  reviewPolicy: { intervalDays: [1, 3, 7] }
}

describe('LessonV3Schema', () => {
  it('accepts a complete written capability mission', () => {
    expect(LessonV3Schema.parse(validWrittenMission)).toEqual(validWrittenMission)
  })

  it('rejects mode-specific output constraints and duplicate ids', () => {
    const invalid = structuredClone(validWrittenMission) as Record<string, unknown>
    const task = invalid.performanceTask as Record<string, unknown>
    task.outputContract = {
      timeLimitSeconds: 60,
      requiredElements: ['one result'],
      targetSeconds: 60
    }
    invalid.sections = [validWrittenMission.sections[0], validWrittenMission.sections[0]]

    const result = LessonV3Schema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
