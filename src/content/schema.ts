import { z } from 'zod'
import { normalizeAnswer } from './answerNormalization'

const IdSchema = z.string().regex(/^[a-z0-9-_]+$/)
const NonEmptyString = z.string().trim().min(1)
const HttpsUrlSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}, {
  message: 'Expected an HTTPS URL'
})
const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, { message: 'Expected a valid YYYY-MM-DD date' })

/** Single source of truth for capability ids; the order is the display and Today-queue order. */
export const CAPABILITY_IDS = [
  'workplace-communication',
  'technical-reading',
  'international-meetings',
  'technical-explanation',
  'international-interview',
  'technology-learning'
] as const

export const CapabilityIdSchema = z.enum(CAPABILITY_IDS)

/** Competencies a behavioral story can be filed under (also what interview missions draw on). */
export const STORY_COMPETENCIES = [
  'ownership',
  'conflict',
  'failure',
  'leadership',
  'ambiguity',
  'influence',
  'mentoring',
  'delivery'
] as const

export const StoryCompetencySchema = z.enum(STORY_COMPETENCIES)

/** Declares that a lesson asks the learner to bring their own stories for these competencies. */
export const StoryBankRequirementSchema = z.object({
  competencies: z.array(StoryCompetencySchema).min(1).max(6),
  minStories: z.number().int().min(1).max(5)
}).strict().superRefine((requirement, context) => {
  if (new Set(requirement.competencies).size !== requirement.competencies.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['competencies'], message: 'Story bank competencies must be unique' })
  }
})

export const VocabularyItemSchema = z.object({
  word: NonEmptyString,
  ipa: NonEmptyString,
  definition: NonEmptyString,
  technicalMeaning: NonEmptyString,
  collocations: z.array(NonEmptyString).default([]),
  example: NonEmptyString,
  commonMistake: NonEmptyString
})

export const ExpressionItemSchema = z.object({
  phrase: NonEmptyString,
  meaning: NonEmptyString,
  tone: z.enum(['formal', 'neutral', 'informal']),
  example: NonEmptyString,
  alternatives: z.array(NonEmptyString).default([])
})

export const ExerciseSchema = z.object({
  id: IdSchema,
  type: z.enum(['choice', 'matching', 'fill', 'ordering']),
  question: NonEmptyString,
  options: z.array(NonEmptyString).optional(),
  matchingPairs: z.array(z.object({ key: NonEmptyString, value: NonEmptyString })).optional(),
  correctAnswer: z.array(NonEmptyString).min(1),
  acceptedAnswers: z.array(NonEmptyString).optional(),
  explanation: NonEmptyString.optional()
}).superRefine((exercise, context) => {
  if (exercise.acceptedAnswers) {
    if (exercise.type !== 'fill') {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['acceptedAnswers'], message: 'acceptedAnswers is only allowed on fill exercises' })
    }
    const normalized = [...exercise.correctAnswer, ...exercise.acceptedAnswers].map(normalizeAnswer)
    if (new Set(normalized).size !== normalized.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['acceptedAnswers'],
        message: 'acceptedAnswers must be unique and differ from correctAnswer after normalization'
      })
    }
  }
  const options = exercise.options ?? []
  if (new Set(options).size !== options.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Options must be unique' })
  }
  if (new Set(exercise.correctAnswer).size !== exercise.correctAnswer.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'Correct answers must be unique' })
  }

  if ((exercise.type === 'choice' || exercise.type === 'ordering') && (exercise.options?.length ?? 0) < 2) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'At least two options are required' })
  }
  if (exercise.type === 'choice' && exercise.correctAnswer.some((answer) => !options.includes(answer))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'Correct answers must be available options' })
  }
  if (exercise.type === 'ordering'
    && (exercise.correctAnswer.length !== options.length
      || exercise.correctAnswer.some((answer) => !options.includes(answer)))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'Correct answer must order every option exactly once' })
  }
  if (exercise.type === 'matching' && (exercise.matchingPairs?.length ?? 0) < 1) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['matchingPairs'], message: 'Matching pairs are required' })
  }
  if (exercise.type === 'matching' && exercise.matchingPairs) {
    const keys = exercise.matchingPairs.map((pair) => pair.key)
    if (new Set(keys).size !== keys.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['matchingPairs'], message: 'Matching keys must be unique' })
    }

    const reachableAnswers = exercise.matchingPairs.map((pair) => `${pair.key} - ${pair.value}`)
    if (exercise.correctAnswer.length !== reachableAnswers.length
      || exercise.correctAnswer.some((answer) => !reachableAnswers.includes(answer))) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'Correct answers must match every configured pair' })
    }
  }
})

const LegacyBaseShape = {
  lessonId: IdSchema,
  title: NonEmptyString,
  cefrLevel: z.enum(['B1', 'B2', 'C1']),
  durationMinutes: z.number().int().min(5).max(30),
  learningObjectives: z.array(NonEmptyString).min(1),
  vocabulary: z.array(VocabularyItemSchema),
  expressions: z.array(ExpressionItemSchema),
  reading: z.object({ title: NonEmptyString, sourceType: NonEmptyString, content: NonEmptyString }),
  exercises: z.array(ExerciseSchema)
}

export const LegacyPerformanceTaskSchema = z.object({
  id: IdSchema,
  mode: z.literal('spoken'),
  title: NonEmptyString,
  scenario: NonEmptyString,
  prompt: NonEmptyString,
  modelResponse: NonEmptyString,
  retryPrompt: NonEmptyString,
  transferPrompt: NonEmptyString,
  preparationSeconds: z.number().int().min(0).max(300),
  performanceSeconds: z.number().int().min(30).max(300),
  requirements: z.array(NonEmptyString).min(1).max(6),
  feedbackPriorities: z.array(NonEmptyString).min(1).max(4),
  rubric: z.array(z.object({
    id: IdSchema,
    criterion: NonEmptyString,
    successDescription: NonEmptyString
  })).min(3).max(6)
}).superRefine((task, context) => {
  const ids = task.rubric.map((item) => item.id)
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['rubric'], message: 'Rubric ids must be unique' })
  }
})

export const LessonV1Schema = z.object({ schemaVersion: z.literal('v1'), ...LegacyBaseShape })
export const LessonV2Schema = z.object({
  schemaVersion: z.literal('v2'),
  ...LegacyBaseShape,
  performanceTask: LegacyPerformanceTaskSchema
})

export const BriefSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('brief'),
  title: NonEmptyString,
  body: NonEmptyString
})

export const LanguageSupportSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('language-support'),
  title: NonEmptyString,
  vocabulary: z.array(VocabularyItemSchema).default([]),
  expressions: z.array(ExpressionItemSchema).default([])
})

export const AuthoritativeSourceSchema = z.object({
  sourceId: IdSchema,
  kind: z.enum(['standard', 'official-doc', 'dictionary', 'corpus', 'peer-reviewed']),
  title: NonEmptyString,
  publisher: NonEmptyString,
  canonicalUrl: HttpsUrlSchema,
  versionOrPublishedAt: NonEmptyString,
  accessedAt: IsoDateSchema,
  exactLocation: NonEmptyString,
  licenseIdOrRightsUrl: HttpsUrlSchema,
  reuseMode: z.enum(['reference-only', 'quoted', 'adapted', 'redistributed']),
  requiredAttribution: NonEmptyString.optional()
}).strict()

export const SourceProvenanceSchema = z.object({
  origin: z.enum(['original', 'adapted', 'synthetic']),
  sourceIds: z.array(IdSchema).min(1).max(10),
  adaptationNote: NonEmptyString.optional()
}).strict().superRefine((provenance, context) => {
  if (new Set(provenance.sourceIds).size !== provenance.sourceIds.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sourceIds'],
      message: 'Source provenance references must be unique'
    })
  }
  if ((provenance.origin === 'synthetic' || provenance.origin === 'adapted')
    && !provenance.adaptationNote) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['adaptationNote'],
      message: `${provenance.origin} source provenance requires an adaptation note`
    })
  }
})

export const SourceSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('source'),
  title: NonEmptyString,
  format: z.enum(['prose', 'dialogue', 'meeting-notes', 'technical-doc', 'code-snippet']),
  content: NonEmptyString,
  provenance: SourceProvenanceSchema.optional()
})

export const PracticeContextSchema = z.object({
  title: NonEmptyString,
  brief: NonEmptyString,
  artifacts: z.array(SourceSectionSchema).min(1).max(4)
}).superRefine((practiceContext, context) => {
  const artifactIds = practiceContext.artifacts.map((artifact) => artifact.id)
  if (new Set(artifactIds).size !== artifactIds.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['artifacts'],
      message: 'Artifact ids must be unique within a practice context'
    })
  }
})

const BundledAudioSourceSchema = z.object({
  kind: z.literal('bundled'),
  src: z.string().regex(/^\/audio\/(?!.*\.\.)[a-zA-Z0-9/_-]+\.(?:mp3|ogg|wav)$/),
  transcript: NonEmptyString,
  speakerId: IdSchema,
  provenance: NonEmptyString
}).strict()

const SpeechSynthesisAudioSourceSchema = z.object({
  kind: z.literal('speech-synthesis'),
  text: NonEmptyString,
  locale: z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/),
  voiceHints: z.array(NonEmptyString).min(1).max(5)
}).strict()

export const ModelAudioSourceSchema = z.discriminatedUnion('kind', [
  BundledAudioSourceSchema,
  SpeechSynthesisAudioSourceSchema
])

const PerceptionItemSchema = z.object({
  id: IdSchema,
  audio: ModelAudioSourceSchema,
  question: NonEmptyString,
  options: z.array(NonEmptyString).min(2).max(5),
  correctAnswer: NonEmptyString,
  feedback: NonEmptyString.optional()
}).strict().superRefine((item, context) => {
  if (!item.options.includes(item.correctAnswer)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'correctAnswer must be one of options' })
  }
})

const PronunciationCueSchema = z.object({
  id: IdSchema,
  ipa: NonEmptyString.optional(),
  articulatoryCue: NonEmptyString,
  meaningRisk: NonEmptyString,
  triggerItemIds: z.array(IdSchema).min(1)
}).strict()

const FunctionalChunkSchema = z.object({
  id: IdSchema,
  function: NonEmptyString,
  text: NonEmptyString,
  meaning: NonEmptyString,
  slots: z.array(NonEmptyString).min(1).max(4),
  stressPattern: NonEmptyString.optional(),
  modelAudio: ModelAudioSourceSchema
}).strict()

const InteractionTurnSchema = z.object({
  id: IdSchema,
  kind: z.enum(['follow-up', 'clarification', 'misunderstanding', 'interruption', 'repair', 'recap']),
  prompt: NonEmptyString,
  expectedFunction: NonEmptyString,
  audio: ModelAudioSourceSchema.optional()
}).strict()

const SHADOWING_STEPS = ['listen', 'chunk-shadow', 'full-shadow', 'delayed-imitation', 'variation'] as const

export const LearningLoopV1Schema = z.object({
  version: z.literal('v1'),
  perception: z.object({
    pretest: z.array(PerceptionItemSchema).min(4).max(8),
    training: z.array(PerceptionItemSchema).min(6).max(12),
    posttest: z.array(PerceptionItemSchema).min(4).max(8)
  }).strict(),
  pronunciationCues: z.array(PronunciationCueSchema).min(1).max(2),
  chunks: z.array(FunctionalChunkSchema).min(4).max(6),
  shadowingSteps: z.array(z.enum(SHADOWING_STEPS)).length(SHADOWING_STEPS.length),
  listenBackChecklist: z.array(NonEmptyString).min(2).max(4),
  interactionTurns: z.array(InteractionTurnSchema).min(1).max(3)
}).strict().superRefine((loop, context) => {
  const ids = [
    ...loop.perception.pretest.map((item) => item.id),
    ...loop.perception.training.map((item) => item.id),
    ...loop.perception.posttest.map((item) => item.id),
    ...loop.pronunciationCues.map((item) => item.id),
    ...loop.chunks.map((item) => item.id),
    ...loop.interactionTurns.map((item) => item.id)
  ]
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: [], message: 'Learning loop ids must be globally unique' })
  }
  loop.perception.training.forEach((item, index) => {
    if (!item.feedback) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['perception', 'training', index, 'feedback'], message: 'Training feedback is required' })
    }
  })
  if (new Set(loop.shadowingSteps).size !== SHADOWING_STEPS.length
    || SHADOWING_STEPS.some((step) => !loop.shadowingSteps.includes(step))) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['shadowingSteps'], message: 'All shadowing steps are required exactly once' })
  }
  const perceptionIds = new Set([
    ...loop.perception.pretest.map((item) => item.id),
    ...loop.perception.training.map((item) => item.id),
    ...loop.perception.posttest.map((item) => item.id)
  ])
  loop.pronunciationCues.forEach((cue, index) => {
    if (cue.triggerItemIds.some((id) => !perceptionIds.has(id))) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['pronunciationCues', index, 'triggerItemIds'], message: 'Cue triggers must reference perception items' })
    }
  })
})

const ReadingExtractionItemSchema = z.object({
  id: IdSchema,
  question: NonEmptyString,
  options: z.array(NonEmptyString).min(2).max(5),
  correctAnswer: NonEmptyString,
  feedback: NonEmptyString
}).strict().superRefine((item, context) => {
  if (!item.options.includes(item.correctAnswer)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctAnswer'], message: 'correctAnswer must be one of options' })
  }
})

export const ReadingLadderV1Schema = z.object({
  version: z.literal('v1'),
  trainingSource: SourceSectionSchema,
  extractionItems: z.array(ReadingExtractionItemSchema).min(3).max(6),
  applicationPrompt: NonEmptyString,
  applicationChecklist: z.array(NonEmptyString).min(2).max(5)
}).strict().superRefine((ladder, context) => {
  const ids = ladder.extractionItems.map((item) => item.id)
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['extractionItems'], message: 'Extraction item ids must be unique' })
  }
})

export const AutoCheckSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('auto-check'),
  title: NonEmptyString,
  exercises: z.array(ExerciseSchema).min(1)
})

/** Review of words the same lesson already teaches in its language-support section. */
export const VocabularyReviewSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('vocabulary-review'),
  title: NonEmptyString,
  wordRefs: z.array(NonEmptyString).min(3).max(15),
  exercises: z.array(ExerciseSchema).min(3)
})

const ListeningSpeakerSchema = z.object({
  id: IdSchema,
  label: NonEmptyString,
  locale: z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/),
  voiceHints: z.array(NonEmptyString).min(1).max(5)
}).strict()

const ListeningTurnSchema = z.object({
  speakerId: IdSchema,
  text: NonEmptyString
}).strict()

/** A multi-speaker conversation played turn by turn with a transcript that stays hidden at first. */
export const ListeningSourceSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('listening-source'),
  title: NonEmptyString,
  durationSeconds: z.number().int().min(30).max(600),
  speakers: z.array(ListeningSpeakerSchema).min(2).max(4),
  turns: z.array(ListeningTurnSchema).min(4).max(60),
  gist: z.array(ExerciseSchema).min(1).max(3),
  detail: z.array(ExerciseSchema).min(2).max(8),
  /** Prompts for notes taken while listening; the notes themselves are never stored. */
  listeningNotes: z.object({
    prompt: NonEmptyString,
    fields: z.array(NonEmptyString).min(1).max(5)
  }).strict().optional(),
  provenance: SourceProvenanceSchema.optional()
}).strict()

export const LONG_READING_FORMATS = ['rfc', 'api-reference', 'changelog', 'log', 'issue', 'tutorial', 'prose'] as const
export const LONG_READING_MIN_WORDS = 300
export const LONG_READING_MAX_WORDS = 2000

const LongReadingPartSchema = z.object({
  id: IdSchema,
  heading: NonEmptyString,
  content: NonEmptyString
}).strict()

/** A long document split into headed parts, read by skimming first and then scanning for answers. */
export const LongReadingSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('long-reading'),
  title: NonEmptyString,
  format: z.enum(LONG_READING_FORMATS),
  parts: z.array(LongReadingPartSchema).min(3).max(20),
  skim: z.array(ExerciseSchema).min(1).max(3),
  scan: z.array(z.object({ locatePartId: IdSchema, exercise: ExerciseSchema }).strict()).min(2).max(10),
  provenance: SourceProvenanceSchema.optional()
}).strict()

export const LessonSectionSchema = z.discriminatedUnion('type', [
  BriefSectionSchema,
  LanguageSupportSectionSchema,
  SourceSectionSchema,
  AutoCheckSectionSchema,
  VocabularyReviewSectionSchema,
  ListeningSourceSectionSchema,
  LongReadingSectionSchema
])

function countWords(text: string): number {
  return text.trim().split(/\s+/u).filter(Boolean).length
}

/** What a rubric criterion measures: the task itself or one aspect of the language used. */
export const RUBRIC_DIMENSIONS = ['task', 'accuracy', 'range', 'register'] as const
const LANGUAGE_DIMENSIONS: ReadonlyArray<(typeof RUBRIC_DIMENSIONS)[number]> = ['accuracy', 'range', 'register']

export const RubricItemSchema = z.object({
  id: IdSchema,
  label: NonEmptyString,
  description: NonEmptyString,
  dimension: z.enum(RUBRIC_DIMENSIONS).optional(),
  /** Short descriptions of what meeting and missing the criterion look like, to calibrate self-rating. */
  anchors: z.object({ met: NonEmptyString, notMet: NonEmptyString }).strict().optional()
})

const PerformanceBaseShape = {
  id: IdSchema,
  title: NonEmptyString,
  scenario: NonEmptyString,
  baselinePrompt: NonEmptyString,
  performancePrompt: NonEmptyString,
  modelResponse: NonEmptyString,
  retryPrompt: NonEmptyString,
  transferPrompt: NonEmptyString,
  reviewPrompt: NonEmptyString,
  practiceContexts: z.object({
    baseline: PracticeContextSchema,
    retry: PracticeContextSchema.optional(),
    transfer: PracticeContextSchema,
    review: PracticeContextSchema
  }).optional(),
  independenceContract: z.object({
    noVietnamese: z.boolean(),
    noTranslation: z.boolean(),
    noModelAnswer: z.boolean(),
    maxHints: z.number().int().min(0).max(10),
    preparationSeconds: z.number().int().min(0).max(600)
  }),
  feedbackPriorities: z.array(NonEmptyString).min(1).max(4),
  rubric: z.array(RubricItemSchema).min(3).max(6)
}

const SpokenPerformanceTaskSchema = z.object({
  ...PerformanceBaseShape,
  mode: z.literal('spoken'),
  learningLoop: LearningLoopV1Schema.optional(),
  outputContract: z.object({
    timeLimitSeconds: z.number().int().min(30).max(1800),
    requiredElements: z.array(NonEmptyString).min(1).max(8),
    targetSeconds: z.number().int().min(30).max(600)
  }).strict().refine((contract) => contract.targetSeconds <= contract.timeLimitSeconds, {
    message: 'targetSeconds must be less than or equal to timeLimitSeconds',
    path: ['targetSeconds']
  })
}).strict()

const WrittenPerformanceTaskSchema = z.object({
  ...PerformanceBaseShape,
  mode: z.literal('written'),
  readingLadder: ReadingLadderV1Schema.optional(),
  outputContract: z.object({
    timeLimitSeconds: z.number().int().min(30).max(1800),
    requiredElements: z.array(NonEmptyString).min(1).max(8),
    minWords: z.number().int().min(10).max(1000),
    maxWords: z.number().int().min(10).max(1500)
  }).strict().refine((contract) => contract.minWords <= contract.maxWords, {
    message: 'minWords must be less than or equal to maxWords',
    path: ['maxWords']
  })
}).strict()

export const PerformanceTaskV3Schema = z.discriminatedUnion('mode', [
  SpokenPerformanceTaskSchema,
  WrittenPerformanceTaskSchema
])

export const ReviewPolicySchema = z.object({
  intervalDays: z.array(z.number().int().positive().max(180)).min(1).max(8),
  /** Opt in to alternating this lesson's due reviews with other capabilities in the Today queue. */
  interleave: z.boolean().optional()
}).superRefine((policy, context) => {
  policy.intervalDays.forEach((day, index) => {
    if (index > 0 && day <= policy.intervalDays[index - 1]) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['intervalDays', index],
        message: 'Review intervals must be strictly increasing'
      })
    }
  })
})

export const LessonV3Schema = z.object({
  schemaVersion: z.literal('v3'),
  lessonId: IdSchema,
  title: NonEmptyString,
  summary: NonEmptyString,
  cefrLevel: z.enum(['A2', 'B1', 'B2', 'C1']),
  durationMinutes: z.number().int().min(5).max(30),
  learningObjectives: z.array(NonEmptyString).min(1),
  capabilities: z.array(CapabilityIdSchema).length(1),
  workflowTags: z.array(IdSchema).min(1),
  /** Bump when the lesson changes in a way learners who already started it should be told about. */
  contentRevision: z.number().int().positive().default(1),
  storyBank: StoryBankRequirementSchema.optional(),
  sourceRegistry: z.array(AuthoritativeSourceSchema).min(1).max(20).optional(),
  sections: z.array(LessonSectionSchema).min(2),
  performanceTask: PerformanceTaskV3Schema,
  reviewPolicy: ReviewPolicySchema
}).superRefine((lesson, context) => {
  const registryIds = new Set<string>()
  lesson.sourceRegistry?.forEach((source, index) => {
    if (registryIds.has(source.sourceId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sourceRegistry', index, 'sourceId'],
        message: 'Source registry ids must be unique'
      })
    }
    registryIds.add(source.sourceId)
  })

  const referencedSources: Array<{ source: { provenance?: z.infer<typeof SourceProvenanceSchema> }; path: Array<string | number> }> = []
  lesson.sections.forEach((section, index) => {
    if (section.type === 'source' || section.type === 'listening-source' || section.type === 'long-reading') {
      referencedSources.push({ source: section, path: ['sections', index] })
    }
  })
  if (lesson.performanceTask.practiceContexts) {
    const contexts = lesson.performanceTask.practiceContexts
    const entries = [
      ['baseline', contexts.baseline],
      ['retry', contexts.retry],
      ['transfer', contexts.transfer],
      ['review', contexts.review]
    ] as const
    entries.forEach(([phase, practiceContext]) => {
      practiceContext?.artifacts.forEach((source, index) => {
        referencedSources.push({
          source,
          path: ['performanceTask', 'practiceContexts', phase, 'artifacts', index]
        })
      })
    })
  }
  if (lesson.performanceTask.mode === 'written' && lesson.performanceTask.readingLadder) {
    referencedSources.push({
      source: lesson.performanceTask.readingLadder.trainingSource,
      path: ['performanceTask', 'readingLadder', 'trainingSource']
    })
  }
  referencedSources.forEach(({ source, path }) => {
    source.provenance?.sourceIds.forEach((sourceId, index) => {
      if (!registryIds.has(sourceId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path, 'provenance', 'sourceIds', index],
          message: `Unknown sourceRegistry reference: ${sourceId}`
        })
      }
    })
  })

  const sectionIds = new Set<string>()
  const exerciseIds = new Set<string>()
  lesson.sections.forEach((section, index) => {
    if (sectionIds.has(section.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['sections', index, 'id'], message: 'Section ids must be unique' })
    }
    sectionIds.add(section.id)
    const groups: Array<{ key: string; exercises: z.infer<typeof ExerciseSchema>[] }> = section.type === 'auto-check' || section.type === 'vocabulary-review'
      ? [{ key: 'exercises', exercises: section.exercises }]
      : section.type === 'listening-source'
        ? [{ key: 'gist', exercises: section.gist }, { key: 'detail', exercises: section.detail }]
        : section.type === 'long-reading'
          ? [{ key: 'skim', exercises: section.skim }, { key: 'scan', exercises: section.scan.map((item) => item.exercise) }]
          : []
    groups.forEach(({ key, exercises }) => {
      exercises.forEach((exercise, exerciseIndex) => {
        if (exerciseIds.has(exercise.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sections', index, key, exerciseIndex, 'id'],
            message: 'Exercise ids must be unique across the lesson'
          })
        }
        exerciseIds.add(exercise.id)
      })
    })

    if (section.type === 'vocabulary-review') {
      const taught = new Set(lesson.sections.flatMap((candidate) =>
        candidate.type === 'language-support' ? candidate.vocabulary.map((item) => item.word.trim().toLowerCase()) : []
      ))
      section.wordRefs.forEach((word, wordIndex) => {
        if (!taught.has(word.trim().toLowerCase())) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sections', index, 'wordRefs', wordIndex],
            message: `Review word "${word}" is not taught in this lesson's language-support section`
          })
        }
      })
    }
    if (section.type === 'listening-source') {
      const speakerIds = new Set(section.speakers.map((speaker) => speaker.id))
      if (speakerIds.size !== section.speakers.length) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['sections', index, 'speakers'], message: 'Speaker ids must be unique' })
      }
      section.turns.forEach((turn, turnIndex) => {
        if (!speakerIds.has(turn.speakerId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sections', index, 'turns', turnIndex, 'speakerId'],
            message: `Unknown speaker: ${turn.speakerId}`
          })
        }
      })
      if (new Set(section.turns.map((turn) => turn.speakerId)).size < 2) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['sections', index, 'turns'], message: 'At least two speakers must take part in the conversation' })
      }
    }
    if (section.type === 'long-reading') {
      const partIds = new Set(section.parts.map((part) => part.id))
      if (partIds.size !== section.parts.length) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['sections', index, 'parts'], message: 'Part ids must be unique' })
      }
      section.scan.forEach((item, scanIndex) => {
        if (!partIds.has(item.locatePartId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sections', index, 'scan', scanIndex, 'locatePartId'],
            message: `locatePartId must name a part of the reading: ${item.locatePartId}`
          })
        }
      })
      const totalWords = section.parts.reduce((total, part) => total + countWords(part.content), 0)
      if (totalWords < LONG_READING_MIN_WORDS || totalWords > LONG_READING_MAX_WORDS) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sections', index, 'parts'],
          message: `A long reading needs ${LONG_READING_MIN_WORDS} to ${LONG_READING_MAX_WORDS} words in total, found ${totalWords}`
        })
      }
    }
  })
  if (!lesson.sections.some((section) => section.type === 'source' || section.type === 'listening-source' || section.type === 'long-reading')) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sections'], message: 'At least one source section is required' })
  }
  const rubricIds = lesson.performanceTask.rubric.map((item) => item.id)
  if (new Set(rubricIds).size !== rubricIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['performanceTask', 'rubric'], message: 'Rubric ids must be unique' })
  }
  if (lesson.cefrLevel === 'A2') {
    const rubric = lesson.performanceTask.rubric
    if (!rubric.some((item) => item.dimension && LANGUAGE_DIMENSIONS.includes(item.dimension))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['performanceTask', 'rubric'],
        message: 'A2 lessons need at least one language criterion (accuracy, range or register)'
      })
    }
    rubric.forEach((item, index) => {
      if (!item.anchors) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['performanceTask', 'rubric', index, 'anchors'],
          message: 'A2 rubric criteria need anchors describing met and not-met'
        })
      }
    })
  }
})

export const RawLessonSchema = z.union([
  LessonV1Schema,
  LessonV2Schema,
  LessonV3Schema
])

export type CapabilityId = z.infer<typeof CapabilityIdSchema>
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>
export type ExpressionItem = z.infer<typeof ExpressionItemSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type AuthoritativeSource = z.infer<typeof AuthoritativeSourceSchema>
export type SourceProvenance = z.infer<typeof SourceProvenanceSchema>
export type SourceSection = z.infer<typeof SourceSectionSchema>
export type VocabularyReviewSection = z.infer<typeof VocabularyReviewSectionSchema>
export type ListeningSourceSection = z.infer<typeof ListeningSourceSectionSchema>
export type LongReadingSection = z.infer<typeof LongReadingSectionSchema>
export type LessonSection = z.infer<typeof LessonSectionSchema>
export type PracticeContext = z.infer<typeof PracticeContextSchema>
export type ModelAudioSource = z.infer<typeof ModelAudioSourceSchema>
export type LearningLoopV1 = z.infer<typeof LearningLoopV1Schema>
export type ReadingLadderV1 = z.infer<typeof ReadingLadderV1Schema>
export type PerformanceTaskV3 = z.infer<typeof PerformanceTaskV3Schema>
export type LessonV1 = z.infer<typeof LessonV1Schema>
export type LessonV2 = z.infer<typeof LessonV2Schema>
export type LessonV3 = z.infer<typeof LessonV3Schema>
export type RawLesson = z.infer<typeof RawLessonSchema>

type CanonicalUnannotatedSourceSection = Omit<SourceSection, 'provenance'> & {
  provenance?: undefined
  resolvedSources?: undefined
}

type CanonicalAnnotatedSourceSection = Omit<SourceSection, 'provenance'> & {
  provenance: SourceProvenance
  resolvedSources: [AuthoritativeSource, ...AuthoritativeSource[]]
}

export type CanonicalSourceSection = CanonicalUnannotatedSourceSection | CanonicalAnnotatedSourceSection

type WithResolvedSources<T extends { provenance?: SourceProvenance }> = Omit<T, 'provenance'> & {
  provenance?: SourceProvenance
  resolvedSources?: [AuthoritativeSource, ...AuthoritativeSource[]]
}
export type CanonicalListeningSourceSection = WithResolvedSources<ListeningSourceSection>
export type CanonicalLongReadingSection = WithResolvedSources<LongReadingSection>

export type CanonicalLessonSection =
  | Exclude<LessonSection, SourceSection | ListeningSourceSection | LongReadingSection>
  | CanonicalSourceSection
  | CanonicalListeningSourceSection
  | CanonicalLongReadingSection
export type CanonicalPracticeContext = Omit<PracticeContext, 'artifacts'> & {
  artifacts: CanonicalSourceSection[]
}
export interface CanonicalPracticeContexts {
  baseline: CanonicalPracticeContext
  retry?: CanonicalPracticeContext
  transfer: CanonicalPracticeContext
  review: CanonicalPracticeContext
}
export type CanonicalReadingLadderV1 = Omit<ReadingLadderV1, 'trainingSource'> & {
  trainingSource: CanonicalSourceSection
}

type SpokenPerformanceTaskV3 = Extract<PerformanceTaskV3, { mode: 'spoken' }>
type WrittenPerformanceTaskV3 = Extract<PerformanceTaskV3, { mode: 'written' }>

export type CanonicalPerformanceTaskV3 =
  | (Omit<SpokenPerformanceTaskV3, 'practiceContexts'> & {
      practiceContexts?: CanonicalPracticeContexts
    })
  | (Omit<WrittenPerformanceTaskV3, 'practiceContexts' | 'readingLadder'> & {
      practiceContexts?: CanonicalPracticeContexts
      readingLadder?: CanonicalReadingLadderV1
    })

export interface CanonicalLesson {
  sourceSchemaVersion: 'v1' | 'v2' | 'v3'
  contentRevision: number
  storyBank?: z.infer<typeof StoryBankRequirementSchema>
  lessonId: string
  title: string
  summary: string
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1'
  durationMinutes: number
  learningObjectives: string[]
  capabilities: CapabilityId[]
  workflowTags: string[]
  sections: CanonicalLessonSection[]
  performanceTask?: CanonicalPerformanceTaskV3
  reviewPolicy: z.infer<typeof ReviewPolicySchema>
  completionMode: 'legacy-quiz' | 'performance' | 'capability-loop'
}
