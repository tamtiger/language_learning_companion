import { z } from 'zod'
import {
  createEmptyLessonProgress,
  type LessonProgress,
  type ProgressByLesson
} from '../../domain/progress/progress'

const RubricStateSchema = z.enum(['met', 'not-met', 'not-rated'])
const AttemptEvidenceSchema = z.object({
  attemptId: z.string().min(1),
  lessonId: z.string().min(1),
  taskId: z.string().min(1),
  capabilityId: z.enum([
    'workplace-communication', 'technical-reading', 'international-meetings',
    'technical-explanation', 'international-interview', 'technology-learning'
  ]),
  phase: z.enum(['baseline', 'performance', 'retry', 'transfer', 'review']),
  attemptedAt: z.string().datetime(),
  durationSeconds: z.number().int().nonnegative(),
  rubric: z.record(RubricStateSchema),
  focusCriterionId: z.string().min(1).optional(),
  independence: z.object({
    usedVietnamese: z.boolean(),
    usedTranslation: z.boolean(),
    usedModelAnswer: z.boolean(),
    hintCount: z.number().int().nonnegative(),
    preparationSeconds: z.number().int().nonnegative()
  }).strict(),
  completed: z.boolean()
}).strict()

export const LessonProgressSchema = z.object({
  status: z.enum(['not-started', 'in-progress', 'completed']),
  currentSectionId: z.string().nullable(),
  completedSectionIds: z.array(z.string()),
  attemptCount: z.number().int().nonnegative(),
  recentAttempts: z.array(AttemptEvidenceSchema).max(50),
  transferCompleted: z.boolean(),
  reviewStage: z.number().int().nonnegative(),
  nextReviewAt: z.string().datetime().nullable(),
  lastActivityAt: z.string().datetime().nullable(),
  legacyImport: z.object({
    completed: z.boolean().optional(),
    incorrectExerciseIds: z.array(z.string()).optional(),
    performanceSummary: z.object({
      attemptCount: z.number().int().nonnegative(),
      lastAttemptAt: z.string().datetime().nullable(),
      latestRubric: z.record(z.boolean()),
      transferCompleted: z.boolean()
    }).strict().optional()
  }).strict().optional()
}).strict()

export const ProgressEnvelopeSchema = z.object({
  storageVersion: z.literal(2),
  lessonProgress: z.record(LessonProgressSchema),
  settings: z.object({ theme: z.enum(['dark', 'light']).default('dark') }).strict()
}).strict()

export const ProgressBackupSchema = ProgressEnvelopeSchema.extend({
  exportedAt: z.string().datetime()
}).strict()

export type ProgressEnvelope = z.infer<typeof ProgressEnvelopeSchema>
export type ProgressBackup = z.infer<typeof ProgressBackupSchema>
export type BackupParseResult = { success: true; data: ProgressBackup } | { success: false; error: string }

interface LegacyPerformanceProgress {
  attemptCount: number
  lastAttemptAt: string | null
  latestRubric: Record<string, boolean>
  transferCompleted: boolean
}

interface LegacyState {
  completedLessons?: Record<string, boolean>
  incorrectAnswersLog?: Record<string, string[]>
  performanceProgress?: Record<string, LegacyPerformanceProgress>
  theme?: 'dark' | 'light'
}

function asLegacyState(input: unknown): LegacyState {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
    ? input as LegacyState
    : {}
}

export function migrateLegacyState(input: unknown): ProgressEnvelope {
  const legacy = asLegacyState(input)
  const lessonIds = new Set([
    ...Object.keys(legacy.completedLessons ?? {}),
    ...Object.keys(legacy.incorrectAnswersLog ?? {}),
    ...Object.keys(legacy.performanceProgress ?? {})
  ])
  const lessonProgress: ProgressByLesson = {}

  lessonIds.forEach((lessonId) => {
    const completed = legacy.completedLessons?.[lessonId] === true
    const incorrectExerciseIds = legacy.incorrectAnswersLog?.[lessonId]
    const performanceSummary = legacy.performanceProgress?.[lessonId]
    const base: LessonProgress = createEmptyLessonProgress()
    lessonProgress[lessonId] = {
      ...base,
      status: completed ? 'completed' : performanceSummary ? 'in-progress' : 'not-started',
      attemptCount: performanceSummary?.attemptCount ?? 0,
      transferCompleted: performanceSummary?.transferCompleted ?? false,
      lastActivityAt: performanceSummary?.lastAttemptAt ?? null,
      legacyImport: {
        ...(completed ? { completed: true } : {}),
        ...(incorrectExerciseIds ? { incorrectExerciseIds } : {}),
        ...(performanceSummary ? { performanceSummary } : {})
      }
    }
  })

  return ProgressEnvelopeSchema.parse({
    storageVersion: 2,
    lessonProgress,
    settings: { theme: legacy.theme ?? 'dark' }
  })
}

export function createBackup(envelope: ProgressEnvelope, exportedAt = new Date().toISOString()): ProgressBackup {
  return ProgressBackupSchema.parse({ ...envelope, exportedAt })
}

export function serializeBackup(backup: ProgressBackup): string {
  return JSON.stringify(ProgressBackupSchema.parse(backup), null, 2)
}

export function parseBackup(input: unknown): BackupParseResult {
  try {
    const candidate: unknown = typeof input === 'string' ? JSON.parse(input) : input
    const result = ProgressBackupSchema.safeParse(candidate)
    if (!result.success) {
      return {
        success: false,
        error: result.error.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n')
      }
    }
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
