import { describe, expect, it } from 'vitest'
import { ExerciseSchema, LessonV3Schema } from '@/content/schema'
import { validWrittenMission } from '../helpers/lessonFixtures'

describe('LessonV3Schema', () => {
  it('accepts a complete written capability mission', () => {
    expect(LessonV3Schema.parse(validWrittenMission)).toEqual(validWrittenMission)
  })

  it('preserves a valid source registry and provenance across every source surface', () => {
    const mission = structuredClone(validWrittenMission) as any
    mission.sourceRegistry = [{
      sourceId: 'official-standard',
      kind: 'standard',
      title: 'Official standard',
      publisher: 'Standards body',
      canonicalUrl: 'https://example.org/standard.pdf',
      versionOrPublishedAt: '2026 edition',
      accessedAt: '2026-08-27',
      exactLocation: 'Section 4, page 12',
      licenseIdOrRightsUrl: 'https://example.org/rights',
      reuseMode: 'reference-only',
      requiredAttribution: 'Standards body (2026). Official standard.'
    }]
    const provenance = {
      origin: 'synthetic',
      sourceIds: ['official-standard'],
      adaptationNote: 'The scenario and metrics are fictional training data.'
    }
    mission.sections[1].provenance = provenance
    mission.performanceTask.practiceContexts = {
      baseline: {
        title: 'Baseline evidence', brief: 'Use only this evidence.',
        artifacts: [{
          id: 'baseline-source', type: 'source', title: 'Baseline notes',
          format: 'meeting-notes', content: 'A synthetic status note.', provenance
        }]
      },
      transfer: {
        title: 'Transfer evidence', brief: 'Use a new evidence packet.',
        artifacts: [{
          id: 'transfer-source', type: 'source', title: 'Transfer notes',
          format: 'meeting-notes', content: 'A different synthetic note.', provenance
        }]
      },
      review: {
        title: 'Review evidence', brief: 'Return to a fresh packet.',
        artifacts: [{
          id: 'review-source', type: 'source', title: 'Review notes',
          format: 'meeting-notes', content: 'A delayed synthetic note.', provenance
        }]
      }
    }
    mission.performanceTask.readingLadder = {
      version: 'v1',
      trainingSource: {
        id: 'ladder-source', type: 'source', title: 'Training source',
        format: 'technical-doc', content: 'A synthetic reference example.', provenance
      },
      extractionItems: [
        { id: 'rule', question: 'What is the rule?', options: ['A', 'B'], correctAnswer: 'A', feedback: 'A is stated.' },
        { id: 'signal', question: 'What is the signal?', options: ['C', 'D'], correctAnswer: 'C', feedback: 'C is stated.' },
        { id: 'limit', question: 'What is the limit?', options: ['E', 'F'], correctAnswer: 'E', feedback: 'E is stated.' }
      ],
      applicationPrompt: 'Apply the rule to a new case.',
      applicationChecklist: ['I named the rule.', 'I separated fact from inference.']
    }

    const parsed = LessonV3Schema.parse(mission) as any
    expect(parsed.sourceRegistry).toEqual(mission.sourceRegistry)
    expect(parsed.sections[1].provenance).toEqual(provenance)
    expect(parsed.performanceTask.practiceContexts.baseline.artifacts[0].provenance).toEqual(provenance)
    expect(parsed.performanceTask.readingLadder.trainingSource.provenance).toEqual(provenance)
  })

  it.each([
    ['duplicate registry id', (mission: any) => mission.sourceRegistry.push(structuredClone(mission.sourceRegistry[0]))],
    ['missing source reference', (mission: any) => { mission.sections[1].provenance.sourceIds = ['missing-source'] }],
    ['duplicate source reference', (mission: any) => { mission.sections[1].provenance.sourceIds = ['official-standard', 'official-standard'] }],
    ['insecure canonical URL', (mission: any) => { mission.sourceRegistry[0].canonicalUrl = 'http://example.org/standard.pdf' }],
    ['malformed canonical URL', (mission: any) => { mission.sourceRegistry[0].canonicalUrl = 'not-a-url' }],
    ['malformed rights URL', (mission: any) => { mission.sourceRegistry[0].licenseIdOrRightsUrl = 'not-a-url' }],
    ['invalid access date', (mission: any) => { mission.sourceRegistry[0].accessedAt = '2026-02-30' }],
    ['missing synthetic note', (mission: any) => { delete mission.sections[1].provenance.adaptationNote }]
  ])('rejects a provenance contract with %s', (_caseName, mutate) => {
    const mission = structuredClone(validWrittenMission) as any
    mission.sourceRegistry = [{
      sourceId: 'official-standard', kind: 'standard', title: 'Official standard',
      publisher: 'Standards body', canonicalUrl: 'https://example.org/standard.pdf',
      versionOrPublishedAt: '2026 edition', accessedAt: '2026-08-27',
      exactLocation: 'Section 4, page 12',
      licenseIdOrRightsUrl: 'https://example.org/rights', reuseMode: 'reference-only'
    }]
    mission.sections[1].provenance = {
      origin: 'synthetic', sourceIds: ['official-standard'],
      adaptationNote: 'The scenario and metrics are fictional training data.'
    }
    mutate(mission)

    expect(LessonV3Schema.safeParse(mission).success).toBe(false)
  })

  it.each([
    ['lesson section', (mission: any) => mission.sections[1]],
    ['practice artifact', (mission: any) => mission.performanceTask.practiceContexts.baseline.artifacts[0]],
    ['reading ladder', (mission: any) => mission.performanceTask.readingLadder.trainingSource]
  ])('rejects an unresolved reference in a %s', (_surface, selectSource) => {
    const mission = structuredClone(validWrittenMission) as any
    mission.sourceRegistry = [{
      sourceId: 'official-standard', kind: 'standard', title: 'Official standard',
      publisher: 'Standards body', canonicalUrl: 'https://example.org/standard.pdf',
      versionOrPublishedAt: '2026 edition', accessedAt: '2026-08-27',
      exactLocation: 'Section 4, page 12',
      licenseIdOrRightsUrl: 'https://example.org/rights', reuseMode: 'reference-only'
    }]
    const provenance = {
      origin: 'synthetic', sourceIds: ['official-standard'],
      adaptationNote: 'The scenario is fictional training data.'
    }
    mission.sections[1].provenance = structuredClone(provenance)
    mission.performanceTask.practiceContexts = {
      baseline: {
        title: 'Baseline', brief: 'Use this packet.', artifacts: [{
          id: 'baseline-source', type: 'source', title: 'Baseline source',
          format: 'meeting-notes', content: 'Baseline facts.', provenance: structuredClone(provenance)
        }]
      },
      transfer: {
        title: 'Transfer', brief: 'Use this packet.', artifacts: [{
          id: 'transfer-source', type: 'source', title: 'Transfer source',
          format: 'meeting-notes', content: 'Transfer facts.'
        }]
      },
      review: {
        title: 'Review', brief: 'Use this packet.', artifacts: [{
          id: 'review-source', type: 'source', title: 'Review source',
          format: 'meeting-notes', content: 'Review facts.'
        }]
      }
    }
    mission.performanceTask.readingLadder = {
      version: 'v1',
      trainingSource: {
        id: 'ladder-source', type: 'source', title: 'Training source',
        format: 'technical-doc', content: 'Training facts.', provenance: structuredClone(provenance)
      },
      extractionItems: [
        { id: 'first', question: 'First?', options: ['A', 'B'], correctAnswer: 'A', feedback: 'A.' },
        { id: 'second', question: 'Second?', options: ['C', 'D'], correctAnswer: 'C', feedback: 'C.' },
        { id: 'third', question: 'Third?', options: ['E', 'F'], correctAnswer: 'E', feedback: 'E.' }
      ],
      applicationPrompt: 'Apply the facts.',
      applicationChecklist: ['Name the fact.', 'Name the action.']
    }
    selectSource(mission).provenance.sourceIds = ['missing-source']

    expect(LessonV3Schema.safeParse(mission).success).toBe(false)
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

  it('rejects spoken targets that exceed the task time limit', () => {
    const spoken = structuredClone(validWrittenMission) as any
    spoken.performanceTask.mode = 'spoken'
    spoken.performanceTask.outputContract = {
      timeLimitSeconds: 120,
      requiredElements: ['intent'],
      targetSeconds: 121
    }

    expect(LessonV3Schema.safeParse(spoken).success).toBe(false)
  })

  it('rejects duplicate exercise ids within one auto-check section', () => {
    const duplicateWithinSection = structuredClone(validWrittenMission)
    const firstAutoCheck = duplicateWithinSection.sections.find((section) => section.type === 'auto-check')
    if (!firstAutoCheck || firstAutoCheck.type !== 'auto-check') throw new Error('Auto-check fixture missing')
    firstAutoCheck.exercises.push(structuredClone(firstAutoCheck.exercises[0]))

    expect(LessonV3Schema.safeParse(duplicateWithinSection).success).toBe(false)
  })

  it('rejects duplicate exercise ids across auto-check sections', () => {
    const duplicateAcrossSections = structuredClone(validWrittenMission)
    duplicateAcrossSections.sections.push({
      id: 'second-check',
      type: 'auto-check',
      title: 'Check the next action',
      exercises: [{
        id: 'impact',
        type: 'choice',
        question: 'What happens next?',
        options: ['Check the release diff', 'Ignore the incident'],
        correctAnswer: ['Check the release diff']
      }]
    })

    expect(LessonV3Schema.safeParse(duplicateAcrossSections).success).toBe(false)
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
      interactionTurns: [{ id: 'turn-1', kind: 'interruption' as const, prompt: 'What is the priority?', expectedFunction: 'answer briefly' }]
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

  it('accepts a complete ReadingLadderV1 only on written tasks', () => {
    const readingLadder = {
      version: 'v1',
      trainingSource: {
        id: 'ladder-source', type: 'source', title: 'Retry documentation', format: 'technical-doc',
        content: 'Retries require maxAttempts above one and an error result from the handler.'
      },
      extractionItems: [
        { id: 'rule', question: 'What enables retries?', options: ['maxAttempts above one', 'TTL zero'], correctAnswer: 'maxAttempts above one', feedback: 'The condition is explicit.' },
        { id: 'signal', question: 'What must the handler return?', options: ['An error', 'A success'], correctAnswer: 'An error', feedback: 'The return value schedules retries.' },
        { id: 'limit', question: 'What disables retries?', options: ['maxAttempts one', 'Three attempts'], correctAnswer: 'maxAttempts one', feedback: 'One attempt means no retry.' }
      ],
      applicationPrompt: 'Explain the rule and propose one safe check in English.',
      applicationChecklist: ['I separated fact from hypothesis.', 'I named an expected signal.']
    }
    const writtenWithLadder = structuredClone(validWrittenMission) as any
    writtenWithLadder.performanceTask.readingLadder = readingLadder
    expect(LessonV3Schema.safeParse(writtenWithLadder).success).toBe(true)

    const duplicate = structuredClone(writtenWithLadder)
    duplicate.performanceTask.readingLadder.extractionItems[1].id = 'rule'
    expect(LessonV3Schema.safeParse(duplicate).success).toBe(false)

    const spokenWithLadder = structuredClone(writtenWithLadder)
    spokenWithLadder.performanceTask.mode = 'spoken'
    spokenWithLadder.performanceTask.outputContract = {
      timeLimitSeconds: 120, requiredElements: ['intent'], targetSeconds: 45
    }
    expect(LessonV3Schema.safeParse(spokenWithLadder).success).toBe(false)
  })
})

describe('ExerciseSchema', () => {
  it('rejects duplicate options, correct answers and matching keys', () => {
    expect(ExerciseSchema.safeParse({
      id: 'duplicate-options',
      type: 'choice',
      question: 'Choose one.',
      options: ['same', 'same'],
      correctAnswer: ['same']
    }).success).toBe(false)

    expect(ExerciseSchema.safeParse({
      id: 'duplicate-answers',
      type: 'choice',
      question: 'Choose all that apply.',
      options: ['first', 'second'],
      correctAnswer: ['first', 'first']
    }).success).toBe(false)

    expect(ExerciseSchema.safeParse({
      id: 'duplicate-keys',
      type: 'matching',
      question: 'Match each key.',
      matchingPairs: [
        { key: 'status', value: 'open' },
        { key: 'status', value: 'closed' }
      ],
      correctAnswer: ['status - open', 'status - closed']
    }).success).toBe(false)
  })

  it('rejects answers that the choice, matching and ordering controls cannot produce', () => {
    expect(ExerciseSchema.safeParse({
      id: 'unreachable-choice',
      type: 'choice',
      question: 'Choose one.',
      options: ['reachable', 'also reachable'],
      correctAnswer: ['not rendered']
    }).success).toBe(false)

    expect(ExerciseSchema.safeParse({
      id: 'unreachable-match',
      type: 'matching',
      question: 'Match each key.',
      matchingPairs: [
        { key: 'first', value: 'one' },
        { key: 'second', value: 'two' }
      ],
      correctAnswer: ['first - two', 'second - one']
    }).success).toBe(false)

    expect(ExerciseSchema.safeParse({
      id: 'unreachable-order',
      type: 'ordering',
      question: 'Build the exact order.',
      options: ['first', 'second', 'third'],
      correctAnswer: ['first', 'missing', 'third']
    }).success).toBe(false)
  })

  it('accepts reachable contracts for every rendered exercise type', () => {
    const exercises = [
      {
        id: 'choice', type: 'choice', question: 'Choose both.',
        options: ['one', 'two', 'three'], correctAnswer: ['one', 'three']
      },
      {
        id: 'fill', type: 'fill', question: 'Fill the blank.',
        options: ['database'], correctAnswer: ['database']
      },
      {
        id: 'matching', type: 'matching', question: 'Match each key.',
        matchingPairs: [
          { key: 'first', value: 'shared' },
          { key: 'second', value: 'shared' },
          { key: 'third', value: 'different' }
        ],
        correctAnswer: ['first - shared', 'second - shared', 'third - different']
      },
      {
        id: 'ordering', type: 'ordering', question: 'Build the order.',
        options: ['third', 'first', 'second'], correctAnswer: ['first', 'second', 'third']
      }
    ]

    for (const exercise of exercises) {
      expect(ExerciseSchema.safeParse(exercise).success, exercise.id).toBe(true)
    }
  })
})
