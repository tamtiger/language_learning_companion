import { z } from 'zod'
import { CAPABILITY_IDS, STORY_COMPETENCIES } from '../../content/schema'

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
  capabilityId: z.enum(CAPABILITY_IDS),
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

const TransferReasonSchema = z.enum([
  'incomplete',
  'lesson-mismatch',
  'task-mismatch',
  'capability-mismatch',
  'rubric-mismatch',
  'rubric-not-rated',
  'rubric-gap',
  'used-vietnamese',
  'used-translation',
  'used-model-answer',
  'too-many-hints',
  'preparation-overtime',
  'too-short',
  'too-long',
  'overtime',
  'listen-back-missing',
  'interaction-incomplete'
])

const AttemptAssessmentSchema = z.object({
  qualifies: z.boolean(),
  reasons: z.array(TransferReasonSchema).max(20)
}).strict()

const AttemptEvidenceSchema = AttemptEvidenceV3Schema.extend({
  process: AttemptProcessEvidenceSchema.nullable().default(null),
  assessment: AttemptAssessmentSchema.optional(),
  contentRevision: z.string().min(1).max(64).optional()
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

const LearningLoopStateSchema = z.object({
  stage: z.enum(['perception', 'pronunciation-cue', 'guided-shadowing', 'ready-for-performance']),
  pronunciationStatus: z.enum(['pending', 'recommended', 'completed', 'not-needed', 'unavailable']),
  requiredShadowingStepIds: z.array(z.string().min(1)).max(10),
  completedShadowingSteps: z.array(z.string().min(1)).max(10),
  perception: z.object({
    pretestCorrect: z.number().int().nonnegative(),
    pretestTotal: z.number().int().nonnegative(),
    trainingCompleted: z.number().int().nonnegative(),
    posttestCorrect: z.number().int().nonnegative(),
    posttestTotal: z.number().int().nonnegative(),
    diagnosticMissedItemIds: z.array(z.string().min(1)).max(50),
    availableVariantCount: z.number().int().nonnegative(),
    variabilityQualified: z.boolean(),
    optedOut: z.boolean()
  }).strict().nullable()
}).strict()

const InputProgressSchema = z.object({
  loop: LearningLoopStateSchema.optional(),
  perception: z.object({
    phase: z.enum(['pretest', 'training', 'posttest']),
    index: z.number().int().nonnegative(),
    pretestCorrect: z.number().int().nonnegative(),
    posttestCorrect: z.number().int().nonnegative(),
    missedItemIds: z.array(z.string().min(1)).max(50)
  }).strict().optional(),
  shadowingIndex: z.number().int().nonnegative().optional(),
  ladder: z.object({
    stage: z.enum(['read', 'extract', 'apply']),
    answers: z.record(z.string().min(1))
  }).strict().optional()
}).strict()

/** Lesson progress as stored by version 5 (before contentRevision). */
const LessonProgressV5Schema = LessonProgressV4Schema.extend({
  recentAttempts: z.array(AttemptEvidenceSchema).max(50),
  activeProcessEvidence: AttemptProcessEvidenceSchema.nullable(),
  inputProgress: InputProgressSchema.optional()
}).strict()

export const LessonProgressSchema = LessonProgressV5Schema.extend({
  contentRevision: z.number().int().positive()
}).strict()

const StoryEntrySchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().trim().min(1).max(60),
  competencyIds: z.array(z.enum(STORY_COMPETENCIES)).min(1).max(4),
  createdAt: z.string().datetime(),
  lastPracticedAt: z.string().datetime().nullable()
}).strict()

const StoryBankSchema = z.array(StoryEntrySchema).max(30).superRefine((stories, context) => {
  if (new Set(stories.map((story) => story.id)).size !== stories.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Story ids must be unique' })
  }
})

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

const ProgressEnvelopeV5Schema = z.object({
  storageVersion: z.literal(5),
  lessonProgress: z.record(LessonProgressV5Schema),
  settings: z.object({ theme: z.enum(['dark', 'light']) }).strict()
}).strict()

const ProgressBackupV3Schema = ProgressEnvelopeV3Schema.extend({
  exportedAt: z.string().datetime()
}).strict()

const ProgressBackupV4Schema = ProgressEnvelopeV4Schema.extend({
  exportedAt: z.string().datetime()
}).strict()

const ProgressBackupV5Schema = ProgressEnvelopeV5Schema.extend({
  exportedAt: z.string().datetime()
}).strict()

export const CURRENT_STORAGE_VERSION = 6

export const ProgressEnvelopeSchema = z.object({
  storageVersion: z.literal(CURRENT_STORAGE_VERSION),
  lessonProgress: z.record(LessonProgressSchema),
  settings: z.object({ theme: z.enum(['dark', 'light']) }).strict(),
  storyBank: StoryBankSchema
}).strict()

export const ProgressBackupSchema = ProgressEnvelopeSchema.extend({
  exportedAt: z.string().datetime()
}).strict()

export type ProgressEnvelope = z.infer<typeof ProgressEnvelopeSchema>
export type ProgressBackup = z.infer<typeof ProgressBackupSchema>
export type BackupParseResult =
  | { success: true; data: ProgressBackup }
  | { success: false; error: string }
export type EnvelopeMigrationResult =
  | { success: true; data: ProgressEnvelope }
  | { success: false; error: string }

function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
}

/** Version 6 adds a content revision to every lesson progress and an empty story bank. */
function migrateV5Envelope(legacy: z.infer<typeof ProgressEnvelopeV5Schema>): ProgressEnvelope {
  return ProgressEnvelopeSchema.parse({
    storageVersion: CURRENT_STORAGE_VERSION,
    settings: legacy.settings,
    storyBank: [],
    lessonProgress: Object.fromEntries(
      Object.entries(legacy.lessonProgress).map(([lessonId, progress]) => [lessonId, { ...progress, contentRevision: 1 }])
    )
  })
}

function migrateV4Envelope(legacy: z.infer<typeof ProgressEnvelopeV4Schema>): ProgressEnvelope {
  return migrateV5Envelope(ProgressEnvelopeV5Schema.parse({
    storageVersion: 5,
    settings: legacy.settings,
    lessonProgress: Object.fromEntries(
      Object.entries(legacy.lessonProgress).map(([lessonId, progress]) => [
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
      ])
    )
  }))
}

function migrateV3Envelope(legacy: z.infer<typeof ProgressEnvelopeV3Schema>): ProgressEnvelope {
  return migrateV5Envelope(ProgressEnvelopeV5Schema.parse({
    storageVersion: 5,
    settings: legacy.settings,
    lessonProgress: Object.fromEntries(
      Object.entries(legacy.lessonProgress).map(([lessonId, progress]) => [
        lessonId,
        {
          ...progress,
          activeProcessEvidence: null,
          recentAttempts: progress.recentAttempts.map((attempt) => ({ ...attempt, process: null }))
        }
      ])
    )
  }))
}

/**
 * Canonical, strict migration entry point for both backup files and Zustand state.
 * Unsupported, future, and malformed envelopes are rejected without partial recovery.
 */
export function migrateProgressEnvelope(input: unknown): EnvelopeMigrationResult {
  try {
    const versionResult = z.object({ storageVersion: z.number().int() }).passthrough().safeParse(input)
    if (!versionResult.success) {
      return { success: false, error: formatZodError(versionResult.error) }
    }

    if (versionResult.data.storageVersion === 6) {
      const result = ProgressEnvelopeSchema.safeParse(input)
      return result.success
        ? { success: true, data: result.data }
        : { success: false, error: formatZodError(result.error) }
    }
    if (versionResult.data.storageVersion === 5) {
      const result = ProgressEnvelopeV5Schema.safeParse(input)
      return result.success
        ? { success: true, data: migrateV5Envelope(result.data) }
        : { success: false, error: formatZodError(result.error) }
    }
    if (versionResult.data.storageVersion === 4) {
      const result = ProgressEnvelopeV4Schema.safeParse(input)
      return result.success
        ? { success: true, data: migrateV4Envelope(result.data) }
        : { success: false, error: formatZodError(result.error) }
    }
    if (versionResult.data.storageVersion === 3) {
      const result = ProgressEnvelopeV3Schema.safeParse(input)
      return result.success
        ? { success: true, data: migrateV3Envelope(result.data) }
        : { success: false, error: formatZodError(result.error) }
    }

    return {
      success: false,
      error: `storageVersion: Unsupported storage version ${versionResult.data.storageVersion}`
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

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
    const versionResult = z.object({ storageVersion: z.number().int() }).passthrough().safeParse(candidate)
    if (!versionResult.success) return { success: false, error: formatZodError(versionResult.error) }

    const backupResult = versionResult.data.storageVersion === CURRENT_STORAGE_VERSION
      ? ProgressBackupSchema.safeParse(candidate)
      : versionResult.data.storageVersion === 5
        ? ProgressBackupV5Schema.safeParse(candidate)
        : versionResult.data.storageVersion === 4
          ? ProgressBackupV4Schema.safeParse(candidate)
          : versionResult.data.storageVersion === 3
            ? ProgressBackupV3Schema.safeParse(candidate)
            : null
    if (!backupResult) {
      return {
        success: false,
        error: `storageVersion: Unsupported storage version ${versionResult.data.storageVersion}`
      }
    }
    if (!backupResult.success) {
      return { success: false, error: formatZodError(backupResult.error) }
    }

    const { exportedAt, ...envelope } = backupResult.data
    const migrated = migrateProgressEnvelope(envelope)
    if (!migrated.success) return migrated
    return {
      success: true,
      data: ProgressBackupSchema.parse({ ...migrated.data, exportedAt })
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}
