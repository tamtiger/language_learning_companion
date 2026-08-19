import { z } from 'zod'

const RubricStateSchema = z.enum(['met', 'not-met', 'not-rated'])

const AttemptEvidenceSchema = z.object({
  attemptId: z.string().min(1),
  lessonId: z.string().min(1),
  taskId: z.string().min(1),
  capabilityId: z.enum([
    'workplace-communication',
    'technical-reading',
    'international-meetings',
    'technical-explanation',
    'international-interview',
    'technology-learning'
  ]),
  phase: z.enum(['baseline', 'performance', 'retry', 'transfer', 'review']),
  attemptedAt: z.string().datetime(),
  durationSeconds: z.number().int().positive(),
  wordCount: z.number().int().nonnegative().nullable(),
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
  activePhase: z.enum(['input', 'performance', 'retry', 'transfer']).nullable(),
  completedExerciseIds: z.array(z.string()),
  attemptCount: z.number().int().nonnegative(),
  recentAttempts: z.array(AttemptEvidenceSchema).max(50),
  transferCompleted: z.boolean(),
  reviewStage: z.number().int().nonnegative(),
  nextReviewAt: z.string().datetime().nullable(),
  lastActivityAt: z.string().datetime().nullable()
}).strict()

export const ProgressEnvelopeSchema = z.object({
  storageVersion: z.literal(3),
  lessonProgress: z.record(LessonProgressSchema),
  settings: z.object({ theme: z.enum(['dark', 'light']) }).strict()
}).strict()

export const ProgressBackupSchema = ProgressEnvelopeSchema.extend({
  exportedAt: z.string().datetime()
}).strict()

export type ProgressEnvelope = z.infer<typeof ProgressEnvelopeSchema>
export type ProgressBackup = z.infer<typeof ProgressBackupSchema>
export type BackupParseResult =
  | { success: true; data: ProgressBackup }
  | { success: false; error: string }

export function createBackup(
  envelope: ProgressEnvelope,
  exportedAt = new Date().toISOString()
): ProgressBackup {
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
        error: result.error.errors
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n')
      }
    }
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
