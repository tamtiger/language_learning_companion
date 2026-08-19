import { z } from 'zod'

const IdSchema = z.string().regex(/^[a-z0-9-_]+$/)
const NonEmptyString = z.string().trim().min(1)

export const CapabilityIdSchema = z.enum([
  'workplace-communication',
  'technical-reading',
  'international-meetings',
  'technical-explanation',
  'international-interview',
  'technology-learning'
])

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
  explanation: NonEmptyString.optional()
}).superRefine((exercise, context) => {
  if ((exercise.type === 'choice' || exercise.type === 'ordering') && (exercise.options?.length ?? 0) < 2) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'At least two options are required' })
  }
  if (exercise.type === 'matching' && (exercise.matchingPairs?.length ?? 0) < 1) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['matchingPairs'], message: 'Matching pairs are required' })
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

export const SourceSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('source'),
  title: NonEmptyString,
  format: z.enum(['prose', 'dialogue', 'meeting-notes', 'technical-doc', 'code-snippet']),
  content: NonEmptyString
})

export const AutoCheckSectionSchema = z.object({
  id: IdSchema,
  type: z.literal('auto-check'),
  title: NonEmptyString,
  exercises: z.array(ExerciseSchema).min(1)
})

export const LessonSectionSchema = z.discriminatedUnion('type', [
  BriefSectionSchema,
  LanguageSupportSectionSchema,
  SourceSectionSchema,
  AutoCheckSectionSchema
])

export const RubricItemSchema = z.object({
  id: IdSchema,
  label: NonEmptyString,
  description: NonEmptyString
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
  independenceContract: z.object({
    noVietnamese: z.boolean(),
    noTranslation: z.boolean(),
    noModelAnswer: z.boolean(),
    maxHints: z.number().int().min(0).max(10),
    preparationSeconds: z.number().int().min(0).max(600)
  }),
  feedbackPriorities: z.array(NonEmptyString).min(1).max(4),
  rubric: z.array(RubricItemSchema).min(3).max(5)
}

const SpokenPerformanceTaskSchema = z.object({
  ...PerformanceBaseShape,
  mode: z.literal('spoken'),
  outputContract: z.object({
    timeLimitSeconds: z.number().int().min(30).max(1800),
    requiredElements: z.array(NonEmptyString).min(1).max(8),
    targetSeconds: z.number().int().min(30).max(600)
  }).strict()
})

const WrittenPerformanceTaskSchema = z.object({
  ...PerformanceBaseShape,
  mode: z.literal('written'),
  outputContract: z.object({
    timeLimitSeconds: z.number().int().min(30).max(1800),
    requiredElements: z.array(NonEmptyString).min(1).max(8),
    minWords: z.number().int().min(10).max(1000),
    maxWords: z.number().int().min(10).max(1500)
  }).strict().refine((contract) => contract.minWords <= contract.maxWords, {
    message: 'minWords must be less than or equal to maxWords',
    path: ['maxWords']
  })
})

export const PerformanceTaskV3Schema = z.discriminatedUnion('mode', [
  SpokenPerformanceTaskSchema,
  WrittenPerformanceTaskSchema
])

export const ReviewPolicySchema = z.object({
  intervalDays: z.array(z.number().int().positive()).min(1).max(8)
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
  cefrLevel: z.enum(['B1', 'B2', 'C1']),
  durationMinutes: z.number().int().min(5).max(30),
  learningObjectives: z.array(NonEmptyString).min(1),
  capabilities: z.array(CapabilityIdSchema).length(1),
  workflowTags: z.array(IdSchema).min(1),
  sections: z.array(LessonSectionSchema).min(2),
  performanceTask: PerformanceTaskV3Schema,
  reviewPolicy: ReviewPolicySchema
}).superRefine((lesson, context) => {
  const sectionIds = new Set<string>()
  lesson.sections.forEach((section, index) => {
    if (sectionIds.has(section.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['sections', index, 'id'], message: 'Section ids must be unique' })
    }
    sectionIds.add(section.id)
  })
  if (!lesson.sections.some((section) => section.type === 'source')) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['sections'], message: 'At least one source section is required' })
  }
  const rubricIds = lesson.performanceTask.rubric.map((item) => item.id)
  if (new Set(rubricIds).size !== rubricIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['performanceTask', 'rubric'], message: 'Rubric ids must be unique' })
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
export type LessonSection = z.infer<typeof LessonSectionSchema>
export type PerformanceTaskV3 = z.infer<typeof PerformanceTaskV3Schema>
export type LessonV1 = z.infer<typeof LessonV1Schema>
export type LessonV2 = z.infer<typeof LessonV2Schema>
export type LessonV3 = z.infer<typeof LessonV3Schema>
export type RawLesson = z.infer<typeof RawLessonSchema>

export interface CanonicalLesson {
  sourceSchemaVersion: 'v1' | 'v2' | 'v3'
  lessonId: string
  title: string
  summary: string
  cefrLevel: 'B1' | 'B2' | 'C1'
  durationMinutes: number
  learningObjectives: string[]
  capabilities: CapabilityId[]
  workflowTags: string[]
  sections: LessonSection[]
  performanceTask?: PerformanceTaskV3
  reviewPolicy: z.infer<typeof ReviewPolicySchema>
  completionMode: 'legacy-quiz' | 'performance' | 'capability-loop'
}
