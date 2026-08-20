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

  it('keeps complete phase-specific practice contexts and rejects duplicate artifact ids', () => {
    const contexts = {
      baseline: {
        title: 'Checkout incident brief',
        brief: 'You are the communications lead preparing a handoff update.',
        artifacts: [
          { id: 'alert', type: 'source', title: 'Monitor alert', format: 'code-snippet', content: '22:08 checkout 503 rate=31%' },
          { id: 'handoff', type: 'source', title: 'Handoff note', format: 'meeting-notes', content: 'Platform handoff starts in 25 minutes.' }
        ]
      },
      transfer: {
        title: 'Upload incident brief',
        brief: 'Write a new update from a different evidence set.',
        artifacts: [
          { id: 'upload-alert', type: 'source', title: 'Monitor alert', format: 'code-snippet', content: '09:14 upload failure rate=18%' }
        ]
      },
      review: {
        title: 'Email queue brief',
        brief: 'Return later and write from fresh evidence.',
        artifacts: [
          { id: 'queue-alert', type: 'source', title: 'Queue alert', format: 'code-snippet', content: 'queue_depth=4800 oldest_age=17m' }
        ]
      }
    }
    const mission = {
      ...validWrittenMission,
      performanceTask: { ...validWrittenMission.performanceTask, practiceContexts: contexts }
    }

    const parsed = LessonV3Schema.parse(mission) as unknown as {
      performanceTask: { practiceContexts?: typeof contexts }
    }
    expect(parsed.performanceTask.practiceContexts).toEqual(contexts)

    const duplicate = structuredClone(mission)
    duplicate.performanceTask.practiceContexts.baseline.artifacts[1].id = 'alert'
    expect(LessonV3Schema.safeParse(duplicate).success).toBe(false)
  })

  it('accepts a complete spoken LearningLoopV1 and rejects unsafe audio or written loops', () => {
    const audio = (text: string) => ({
      kind: 'speech-synthesis' as const,
      text,
      locale: 'en-US',
      voiceHints: ['English US']
    })
    const item = (id: string, feedback?: string) => ({
      id,
      audio: audio(`Audio ${id}`),
      question: 'Which message did you hear?',
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option A',
      ...(feedback ? { feedback } : {})
    })
    const learningLoop = {
      version: 'v1' as const,
      perception: {
        pretest: Array.from({ length: 4 }, (_, index) => item(`pre-${index + 1}`)),
        training: Array.from({ length: 6 }, (_, index) => item(`train-${index + 1}`, 'Listen for the final sound.')),
        posttest: Array.from({ length: 4 }, (_, index) => item(`post-${index + 1}`))
      },
      pronunciationCues: [{
        id: 'final-s', ipa: '/s/', articulatoryCue: 'Release the final sound.',
        meaningRisk: 'test and tests refer to different counts.', triggerItemIds: ['train-1']
      }],
      chunks: Array.from({ length: 4 }, (_, index) => ({
        id: `chunk-${index + 1}`, function: 'clarify', text: `Chunk ${index + 1} ___`,
        meaning: 'Clarify one point.', slots: ['detail'], modelAudio: audio(`Chunk ${index + 1}`)
      })),
      shadowingSteps: ['listen', 'chunk-shadow', 'full-shadow', 'delayed-imitation', 'variation'] as const,
      listenBackChecklist: ['The intent is clear.', 'Critical words are audible.'],
      interactionTurns: [{ id: 'turn-1', kind: 'clarification' as const, prompt: 'Could you clarify?', expectedFunction: 'clarify' }]
    }
    const spoken = {
      ...validWrittenMission,
      performanceTask: {
        ...validWrittenMission.performanceTask,
        mode: 'spoken',
        outputContract: { timeLimitSeconds: 120, requiredElements: ['intent'], targetSeconds: 45 },
        learningLoop
      }
    }

    expect(LessonV3Schema.safeParse(spoken).success).toBe(true)

    const unsafe = structuredClone(spoken) as any
    unsafe.performanceTask.learningLoop.chunks[0].modelAudio = {
      kind: 'bundled', src: 'https://example.com/model.mp3', transcript: 'Model', speakerId: 'speaker', provenance: 'unknown'
    }
    expect(LessonV3Schema.safeParse(unsafe).success).toBe(false)

    const writtenWithLoop = structuredClone(validWrittenMission) as any
    writtenWithLoop.performanceTask.learningLoop = learningLoop
    expect(LessonV3Schema.safeParse(writtenWithLoop).success).toBe(false)
  })
})
