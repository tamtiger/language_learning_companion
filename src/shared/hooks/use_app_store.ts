import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { z } from 'zod'
import { getBundledCatalog } from '../../content/catalog'
import type { CanonicalLesson } from '../../content/schema'
import {
  appendAttempt,
  applyReviewResult,
  createEmptyLessonProgress,
  scheduleTransferReview,
  type AttemptEvidence,
  type ProgressByLesson
} from '../../domain/progress/progress'
import {
  ProgressEnvelopeSchema,
  createBackup as createV2Backup,
  migrateLegacyState,
  parseBackup as parseV2Backup,
  type ProgressBackup as ProgressBackupV2,
  type ProgressEnvelope
} from '../../infrastructure/storage/progress_storage'

export const PerformanceProgressSchema = z.object({
  attemptCount: z.number().int().nonnegative(),
  lastAttemptAt: z.string().datetime().nullable(),
  latestRubric: z.record(z.boolean()),
  transferCompleted: z.boolean()
})
const PerformanceProgressRecordSchema = z.record(PerformanceProgressSchema)

export const ProgressBackupSchema = z.object({
  completedLessons: z.record(z.boolean()),
  incorrectAnswersLog: z.record(z.array(z.string())),
  performanceProgress: PerformanceProgressRecordSchema.optional().default({}),
  exportedAt: z.string().datetime().optional()
}).strict()

export type PerformanceProgress = z.infer<typeof PerformanceProgressSchema>
export type ProgressBackup = z.infer<typeof ProgressBackupSchema>

export interface ProgressBackupSource {
  completedLessons: Record<string, boolean>
  incorrectAnswersLog: Record<string, string[]>
  performanceProgress: Record<string, PerformanceProgress>
}

export function createProgressBackup(
  source: ProgressBackupSource,
  exportedAt = new Date().toISOString()
): ProgressBackup {
  return ProgressBackupSchema.parse({ ...source, exportedAt })
}

export type ProgressBackupParseResult =
  | { success: true; data: ProgressBackup }
  | { success: false; error: string }

export function parseProgressBackup(input: unknown): ProgressBackupParseResult {
  try {
    const candidate: unknown = typeof input === 'string' ? JSON.parse(input) : input
    const result = ProgressBackupSchema.safeParse(candidate)
    if (!result.success) {
      return { success: false, error: result.error.errors.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n') }
    }
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export function migratePersistedAppState(persistedState: unknown): Record<string, unknown> {
  const previous = typeof persistedState === 'object' && persistedState !== null && !Array.isArray(persistedState)
    ? persistedState as Record<string, unknown>
    : {}
  const existingEnvelope = ProgressEnvelopeSchema.safeParse({
    storageVersion: 2,
    lessonProgress: previous.lessonProgress,
    settings: { theme: previous.theme ?? 'dark' }
  })
  const envelope = existingEnvelope.success ? existingEnvelope.data : migrateLegacyState(previous)
  const performanceProgress = PerformanceProgressRecordSchema.safeParse(previous.performanceProgress)

  return {
    ...previous,
    theme: envelope.settings.theme,
    lessonProgress: envelope.lessonProgress,
    completedLessons: typeof previous.completedLessons === 'object' && previous.completedLessons !== null
      ? previous.completedLessons
      : {},
    incorrectAnswersLog: typeof previous.incorrectAnswersLog === 'object' && previous.incorrectAnswersLog !== null
      ? previous.incorrectAnswersLog
      : {},
    performanceProgress: performanceProgress.success ? performanceProgress.data : {}
  }
}

const catalog = getBundledCatalog()

const memoryValues = new Map<string, string>()
const memoryStorage: StateStorage = {
  getItem: (name) => memoryValues.get(name) ?? null,
  setItem: (name, value) => { memoryValues.set(name, value) },
  removeItem: (name) => { memoryValues.delete(name) }
}

function getSafeStorage(): StateStorage {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : memoryStorage
  } catch {
    return memoryStorage
  }
}

export interface AppState {
  theme: 'dark' | 'light'
  currentCefrLevel: 'B1' | 'B2' | 'C1' | null
  activeLessonId: string | null
  lessons: CanonicalLesson[]
  contentErrors: typeof catalog.errors
  lessonProgress: ProgressByLesson

  // Compatibility projections kept during the v1/v2 migration window.
  completedLessons: Record<string, boolean>
  incorrectAnswersLog: Record<string, string[]>
  performanceProgress: Record<string, PerformanceProgress>

  setTheme: (theme: 'dark' | 'light') => void
  setCefrLevel: (level: 'B1' | 'B2' | 'C1' | null) => void
  setActiveLessonId: (lessonId: string | null) => void
  setCurrentSection: (lessonId: string, sectionId: string | null) => void
  markLessonComplete: (lessonId: string, completed: boolean) => void
  logIncorrectAnswer: (lessonId: string, exerciseId: string) => void
  recordCapabilityAttempt: (attempt: AttemptEvidence, reviewIntervals: number[]) => void
  recordPerformanceAttempt: (input: {
    lessonId: string
    rubricAnswers: Record<string, boolean>
    isTransfer: boolean
    attemptedAt: string
  }) => void
  restoreProgress: (backup: ProgressBackup) => void
  restoreEnvelope: (envelope: ProgressEnvelope) => void
  resetProgress: () => void
}

function toLegacyPerformance(attempt: AttemptEvidence, current?: PerformanceProgress): PerformanceProgress {
  return PerformanceProgressSchema.parse({
    attemptCount: (current?.attemptCount ?? 0) + 1,
    lastAttemptAt: attempt.attemptedAt,
    latestRubric: Object.fromEntries(
      Object.entries(attempt.rubric).map(([id, value]) => [id, value === 'met'])
    ),
    transferCompleted: (current?.transferCompleted ?? false) || attempt.phase === 'transfer'
  })
}

export function createCapabilityBackup(source: Pick<AppState, 'theme' | 'lessonProgress'>): ProgressBackupV2 {
  return createV2Backup({
    storageVersion: 2,
    lessonProgress: source.lessonProgress,
    settings: { theme: source.theme }
  })
}

export const parseCapabilityBackup = parseV2Backup

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      currentCefrLevel: null,
      activeLessonId: null,
      lessons: catalog.lessons,
      contentErrors: catalog.errors,
      lessonProgress: {},
      completedLessons: {},
      incorrectAnswersLog: {},
      performanceProgress: {},

      setTheme: (theme) => set({ theme }),
      setCefrLevel: (currentCefrLevel) => set({ currentCefrLevel, activeLessonId: null }),
      setActiveLessonId: (activeLessonId) => set({ activeLessonId }),
      setCurrentSection: (lessonId, currentSectionId) => set((state) => {
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        return {
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...current,
              status: current.status === 'completed' ? 'completed' : 'in-progress',
              currentSectionId,
              lastActivityAt: new Date().toISOString()
            }
          }
        }
      }),
      markLessonComplete: (lessonId, completed) => set((state) => {
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        return {
          completedLessons: { ...state.completedLessons, [lessonId]: completed },
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: { ...current, status: completed ? 'completed' : 'in-progress' }
          }
        }
      }),
      logIncorrectAnswer: (lessonId, exerciseId) => set((state) => {
        const existing = state.incorrectAnswersLog[lessonId] ?? []
        if (existing.includes(exerciseId)) return {}
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        const legacyImport = current.legacyImport ?? {}
        return {
          incorrectAnswersLog: { ...state.incorrectAnswersLog, [lessonId]: [...existing, exerciseId] },
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...current,
              legacyImport: {
                ...legacyImport,
                incorrectExerciseIds: [...(legacyImport.incorrectExerciseIds ?? []), exerciseId]
              }
            }
          }
        }
      }),
      recordCapabilityAttempt: (attempt, reviewIntervals) => set((state) => {
        const current = state.lessonProgress[attempt.lessonId] ?? createEmptyLessonProgress()
        let next = appendAttempt(current, attempt)
        if (attempt.phase === 'transfer') {
          next = scheduleTransferReview(next, reviewIntervals, new Date(attempt.attemptedAt))
          next = { ...next, status: 'completed' }
        } else if (attempt.phase === 'review') {
          const passed = Object.values(attempt.rubric).every((rating) => rating === 'met')
          next = {
            ...applyReviewResult(next, passed, reviewIntervals, new Date(attempt.attemptedAt)),
            status: 'completed'
          }
        }
        return {
          lessonProgress: { ...state.lessonProgress, [attempt.lessonId]: next },
          completedLessons: attempt.phase === 'transfer'
            ? { ...state.completedLessons, [attempt.lessonId]: true }
            : state.completedLessons,
          performanceProgress: {
            ...state.performanceProgress,
            [attempt.lessonId]: toLegacyPerformance(attempt, state.performanceProgress[attempt.lessonId])
          }
        }
      }),
      recordPerformanceAttempt: ({ lessonId, rubricAnswers, isTransfer, attemptedAt }) => set((state) => {
        const lesson = state.lessons.find((item) => item.lessonId === lessonId)
        const attempt: AttemptEvidence = {
          attemptId: `${lessonId}-${attemptedAt}-${state.lessonProgress[lessonId]?.attemptCount ?? 0}`,
          lessonId,
          taskId: lesson?.performanceTask?.id ?? `${lessonId}-legacy-task`,
          capabilityId: lesson?.capabilities[0] ?? 'workplace-communication',
          phase: isTransfer ? 'transfer' : 'performance',
          attemptedAt,
          durationSeconds: 0,
          rubric: Object.fromEntries(Object.entries(rubricAnswers).map(([id, met]) => [id, met ? 'met' : 'not-met'])),
          independence: {
            usedVietnamese: false,
            usedTranslation: false,
            usedModelAnswer: false,
            hintCount: 0,
            preparationSeconds: lesson?.performanceTask?.independenceContract.preparationSeconds ?? 0
          },
          completed: true
        }
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        let next = appendAttempt(current, attempt)
        if (isTransfer) next = { ...scheduleTransferReview(next, lesson?.reviewPolicy.intervalDays ?? [1, 3, 7], new Date(attemptedAt)), status: 'completed' }
        return {
          lessonProgress: { ...state.lessonProgress, [lessonId]: next },
          completedLessons: isTransfer ? { ...state.completedLessons, [lessonId]: true } : state.completedLessons,
          performanceProgress: {
            ...state.performanceProgress,
            [lessonId]: toLegacyPerformance(attempt, state.performanceProgress[lessonId])
          }
        }
      }),
      restoreProgress: (backup) => {
        const envelope = migrateLegacyState(backup)
        set({
          lessonProgress: envelope.lessonProgress,
          completedLessons: backup.completedLessons,
          incorrectAnswersLog: backup.incorrectAnswersLog,
          performanceProgress: backup.performanceProgress
        })
      },
      restoreEnvelope: (envelope) => set({
        theme: envelope.settings.theme,
        lessonProgress: envelope.lessonProgress,
        completedLessons: Object.fromEntries(
          Object.entries(envelope.lessonProgress).map(([id, progress]) => [id, progress.status === 'completed'])
        )
      }),
      resetProgress: () => set({
        currentCefrLevel: null,
        activeLessonId: null,
        lessonProgress: {},
        completedLessons: {},
        incorrectAnswersLog: {},
        performanceProgress: {}
      })
    }),
    {
      name: 'language-learning-companion-storage',
      version: 2,
      storage: createJSONStorage(getSafeStorage),
      migrate: (persistedState) => migratePersistedAppState(persistedState),
      partialize: (state) => ({
        theme: state.theme,
        currentCefrLevel: state.currentCefrLevel,
        activeLessonId: state.activeLessonId,
        lessonProgress: state.lessonProgress,
        completedLessons: state.completedLessons,
        incorrectAnswersLog: state.incorrectAnswersLog,
        performanceProgress: state.performanceProgress
      })
    }
  )
)
