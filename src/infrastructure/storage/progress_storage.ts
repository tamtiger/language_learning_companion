import { z } from 'zod'

const RubricStateSchema = z.enum(['met', 'not-met', 'not-rated'])

const AttemptProcessEvidenceV4Schema = z.object({
  perceptionPretestCorrect: z.number().int().nonnegative(),
  perceptionPretestTotal: z.number().int().nonnegative(),
  perceptionPosttestCorrect: z.number().int().nonnegative(),
  perceptionPosttestTotal: z.number().int().nonnegative(),
  perceptionTrainingCompleted: z.number().int().nonnegative(),
  availableVariantCount: z.number().int().nonnegative(),
  variabilityQualified: z.boolean(),
  shadowingStepIds: z.array(z.string().min(1)).max(10),
  listenedBack: z.boolean(),
  cueToSpeechStartMs: z.number().int().nonnegative().nullable(),
  interactionTurnIds: z.array(z.string().min(1)).max(10),
  optedOut: z.boolean()
}).strict()

const AttemptProcessEvidenceSchema = AttemptProcessEvidenceV4Schema.extend({
  listenBackChecklistCompleted: z.boolean()
}).strict()

const AttemptEvidenceV3Schema = z.object({
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

const AttemptEvidenceV4Schema = AttemptEvidenceV3Schema.extend({
  process: AttemptProcessEvidenceV4Schema.nullable().default(null)
}).strict()

const AttemptEvidenceSchema = AttemptEvidenceV3Schema.extend({
  process: AttemptProcessEvidenceSchema.nullable().default(null)
}).strict()

const LessonProgressV3Schema = z.object({
  status: z.enum(['not-started', 'in-progress', 'completed']),
  currentSectionId: z.string().nullable(),
  completedSectionIds: z.array(z.string()),
  activePhase: z.enum(['input', 'performance', 'retry', 'transfer']).nullable(),
  completedExerciseIds: z.array(z.string()),
  attemptCount: z.number().int().nonnegative(),
  recentAttempts: z.array(AttemptEvidenceV3Schema).max(50),
  transferCompleted: z.boolean(),
  reviewStage: z.number().int().nonnegative(),
  nextReviewAt: z.string().datetime().nullable(),
  lastActivityAt: z.string().datetime().nullable()
}).strict()

const LessonProgressV4Schema = LessonProgressV3Schema.extend({
  recentAttempts: z.array(AttemptEvidenceV4Schema).max(50)
}).strict()

export const LessonProgressSchema = LessonProgressV4Schema.extend({
  recentAttempts: z.array(AttemptEvidenceSchema).max(50),
  activeProcessEvidence: AttemptProcessEvidenceSchema.nullable()
}).strict()

const ProgressEnvelopeV3Schema = z.object({
  storageVersion: z.literal(3),
  lessonProgress: z.record(LessonProgressV3Schema),
  settings: z.object({ theme: z.enum(['dark', 'light']) }).strict()
}).strict()

const ProgressEnvelopeV4Schema = z.object({
  storageVersion: z.literal(4),
  lessonProgress: z.record(LessonProgressV4Schema),
  settings: z.object({ theme: z.enum(['dark', 'light']) }).strict()
}).strict()

export const ProgressEnvelopeSchema = z.object({
  storageVersion: z.literal(5),
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
      const legacyV4 = ProgressEnvelopeV4Schema.extend({ exportedAt: z.string().datetime() }).strict().safeParse(candidate)
      if (legacyV4.success) {
        const migrated: ProgressBackup = {
          storageVersion: 5,
          exportedAt: legacyV4.data.exportedAt,
          settings: legacyV4.data.settings,
          lessonProgress: Object.fromEntries(Object.entries(legacyV4.data.lessonProgress).map(([lessonId, progress]) => [
            lessonId,
            {
              ...progress,
              activeProcessEvidence: null,
              recentAttempts: progress.recentAttempts.map((attempt) => ({
                ...attempt,
                process: attempt.process
                  ? { ...attempt.process, listenBackChecklistCompleted: false }
                  : null
              }))
            }
          ]))
        }
        return { success: true, data: ProgressBackupSchema.parse(migrated) }
      }
      const legacyV3 = ProgressEnvelopeV3Schema.extend({ exportedAt: z.string().datetime() }).strict().safeParse(candidate)
      if (legacyV3.success) {
        const migrated: ProgressBackup = {
          storageVersion: 5,
          exportedAt: legacyV3.data.exportedAt,
          settings: legacyV3.data.settings,
          lessonProgress: Object.fromEntries(Object.entries(legacyV3.data.lessonProgress).map(([lessonId, progress]) => [
            lessonId,
            { ...progress, activeProcessEvidence: null, recentAttempts: progress.recentAttempts.map((attempt) => ({ ...attempt, process: null })) }
          ]))
        }
        return { success: true, data: ProgressBackupSchema.parse(migrated) }
      }
    }
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
