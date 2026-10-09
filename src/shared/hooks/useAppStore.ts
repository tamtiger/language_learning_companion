import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  type PersistStorage,
  type StateStorage
} from 'zustand/middleware'
import { z } from 'zod'
import { getBundledCatalog } from '../../content/catalog'
import type { CanonicalLesson } from '../../content/schema'
import { contractRevision } from '../../domain/progress/evidenceContract'
import {
  appendAttempt,
  applyReviewResult,
  applyTransferOutcome,
  assessReview,
  assessTransfer,
  createEmptyLessonProgress,
  type AttemptAssessment,
  type AttemptEvidence,
  type EvidenceContract,
  type AttemptProcessEvidence,
  type DurableCapabilityPhase,
  type ProgressByLesson
} from '../../domain/progress/progress'
import {
  createBackup,
  migrateProgressEnvelope,
  parseBackup,
  type ProgressBackup,
  type ProgressEnvelope
} from '../../infrastructure/storage/progressStorage'

const catalog = getBundledCatalog()
const memoryValues = new Map<string, string>()
const memoryStorage: StateStorage = {
  getItem: (name) => memoryValues.get(name) ?? null,
  setItem: (name, value) => { memoryValues.set(name, value) },
  removeItem: (name) => { memoryValues.delete(name) }
}

/** Picks browser storage, or an in-memory fallback (progress lost on close) when it is unavailable. */
export function selectStorage(
  win: Pick<Window, 'localStorage'> | undefined
): { storage: StateStorage; memoryOnly: boolean } {
  try {
    if (win?.localStorage) return { storage: win.localStorage, memoryOnly: false }
  } catch {
    // Access itself can throw (blocked site data); fall through to memory.
  }
  return { storage: memoryStorage, memoryOnly: true }
}

const storageSelection = selectStorage(typeof window === 'undefined' ? undefined : window)
const PERSIST_KEY = 'language-learning-companion-storage-v3'

export type PersistenceStatus = 'ok' | 'memory-only' | 'quarantined' | 'write-failed'

const baselinePersistenceStatus: PersistenceStatus = storageSelection.memoryOnly ? 'memory-only' : 'ok'
let storeReady = false
let deferredPersistenceStatus: PersistenceStatus | null = null
let suppressPersistWrite = false

function markPersistence(status: PersistenceStatus): void {
  if (!storeReady) {
    deferredPersistenceStatus = status
    return
  }
  if (useAppStore.getState().persistence.status === status) return
  // Status is not persisted, so it must not trigger a storage write.
  suppressPersistWrite = true
  try {
    useAppStore.setState({ persistence: { status } })
  } finally {
    suppressPersistWrite = false
  }
}

export interface AttemptPolicy {
  reviewIntervals: number[]
  contract: EvidenceContract
}

export interface AppState {
  theme: 'dark' | 'light'
  currentCefrLevel: 'B1' | 'B2' | 'C1' | null
  activeLessonId: string | null
  lessons: CanonicalLesson[]
  contentErrors: typeof catalog.errors
  lessonProgress: ProgressByLesson
  /** Whether progress is actually being saved; never persisted. */
  persistence: { status: PersistenceStatus }
  setTheme: (theme: 'dark' | 'light') => void
  setCefrLevel: (level: 'B1' | 'B2' | 'C1' | null) => void
  setActiveLessonId: (lessonId: string | null) => void
  setCurrentSection: (lessonId: string, sectionId: string | null) => void
  setActivePhase: (lessonId: string, phase: DurableCapabilityPhase | null) => void
  setActiveProcessEvidence: (lessonId: string, evidence: AttemptProcessEvidence | null) => void
  markExerciseCorrect: (lessonId: string, exerciseId: string) => void
  markLessonComplete: (lessonId: string, completed: boolean) => void
  /** Saves the attempt and returns the stored assessment (transfer and review only). */
  recordCapabilityAttempt: (attempt: AttemptEvidence, policy: AttemptPolicy) => AttemptAssessment | null
  restoreEnvelope: (envelope: ProgressEnvelope) => void
  restartLesson: (lessonId: string) => void
  startLessonRepeat: (lessonId: string) => void
  resetProgress: () => void
}

export type PersistedAppState = Pick<
  AppState,
  'theme' | 'currentCefrLevel' | 'activeLessonId' | 'lessonProgress'
>

let persistenceQuarantined = false
let persistenceRecoveryEpoch = 0
let activeHydrationRecoveryEpoch = 0
let migrationWriteAuthorized = false
const validatedMigrationStates = new WeakSet<object>()

function allowPersistenceRecovery(): void {
  persistenceRecoveryEpoch += 1
  migrationWriteAuthorized = false
  persistenceQuarantined = false
  markPersistence(baselinePersistenceStatus)
}

/**
 * Blocks automatic writes after hydration rejects stored data. Recovery actions
 * explicitly clear the quarantine before replacing that data with validated state.
 * A failing write (quota, blocked storage) is reported through `persistence.status`
 * instead of throwing out of the user action that triggered it.
 */
export function withPersistenceQuarantine(
  storage: PersistStorage<PersistedAppState | null>
): PersistStorage<PersistedAppState | null> {
  return {
    getItem: (name) => storage.getItem(name),
    setItem: (name, value) => {
      if (suppressPersistWrite) return undefined
      if (persistenceQuarantined) {
        if (!migrationWriteAuthorized) return undefined
        migrationWriteAuthorized = false
      }
      try {
        const result = storage.setItem(name, value)
        if (storeReady && useAppStore.getState().persistence.status === 'write-failed') {
          markPersistence(baselinePersistenceStatus)
        }
        return result
      } catch {
        markPersistence('write-failed')
        return undefined
      }
    },
    removeItem: (name) => storage.removeItem(name)
  }
}

/**
 * Applies progress written by another tab. Local-only fields such as the open lesson are kept,
 * and the applied state is not written back, so two tabs cannot ping-pong the same key.
 */
export async function handleStorageEvent(event: StorageEvent): Promise<void> {
  if (event.key !== PERSIST_KEY || persistenceQuarantined) return
  const storage = useAppStore.persist.getOptions().storage
  const stored = await storage?.getItem(PERSIST_KEY)
  if (!stored) return
  const external = migratePersistedAppState(stored.state, stored.version ?? 0)
  if (!external) return
  suppressPersistWrite = true
  try {
    useAppStore.setState({
      theme: external.theme,
      currentCefrLevel: external.currentCefrLevel,
      lessonProgress: external.lessonProgress
    })
  } finally {
    suppressPersistWrite = false
  }
}

function createAppPersistStorage(): PersistStorage<PersistedAppState | null> | undefined {
  const storage = createJSONStorage<PersistedAppState | null>(() => storageSelection.storage)
  return storage ? withPersistenceQuarantine(storage) : undefined
}

const PersistedAppStateMetadataSchema = z.object({
  theme: z.enum(['dark', 'light']),
  currentCefrLevel: z.enum(['B1', 'B2', 'C1']).nullable().default(null),
  activeLessonId: z.string().nullable().default(null),
  lessonProgress: z.record(z.unknown())
}).strict()

/** Returns null when persisted data is unsupported or cannot be validated safely. */
export function migratePersistedAppState(
  persisted: unknown,
  version: number
): PersistedAppState | null {
  if (version !== 3 && version !== 4 && version !== 5) return null
  const metadata = PersistedAppStateMetadataSchema.safeParse(persisted)
  if (!metadata.success) return null

  const migrated = migrateProgressEnvelope({
    storageVersion: version,
    lessonProgress: metadata.data.lessonProgress,
    settings: { theme: metadata.data.theme }
  })
  if (!migrated.success) return null

  return {
    theme: migrated.data.settings.theme,
    currentCefrLevel: metadata.data.currentCefrLevel,
    activeLessonId: metadata.data.activeLessonId,
    lessonProgress: migrated.data.lessonProgress
  }
}

export function createCapabilityBackup(
  source: Pick<AppState, 'theme' | 'lessonProgress'>,
  exportedAt = new Date().toISOString()
): ProgressBackup {
  const lessonProgress = Object.fromEntries(
    Object.entries(source.lessonProgress).map(([lessonId, progress]) => [
      lessonId,
      {
        ...progress,
        recentAttempts: progress.recentAttempts.map((attempt) => ({
          ...attempt,
          process: attempt.process ?? null
        }))
      }
    ])
  )
  return createBackup({
    storageVersion: 5,
    lessonProgress,
    settings: { theme: source.theme }
  }, exportedAt)
}

export const parseCapabilityBackup = parseBackup

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedAppState | null>(
    (set) => ({
      theme: 'dark',
      currentCefrLevel: null,
      activeLessonId: null,
      lessons: catalog.lessons,
      contentErrors: catalog.errors,
      lessonProgress: {},
      persistence: { status: baselinePersistenceStatus },

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
      setActivePhase: (lessonId, activePhase) => set((state) => {
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        return {
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...current,
              status: current.status === 'completed' ? 'completed' : 'in-progress',
              activePhase,
              lastActivityAt: new Date().toISOString()
            }
          }
        }
      }),
      setActiveProcessEvidence: (lessonId, activeProcessEvidence) => set((state) => {
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        return {
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: { ...current, activeProcessEvidence, lastActivityAt: new Date().toISOString() }
          }
        }
      }),
      markExerciseCorrect: (lessonId, exerciseId) => set((state) => {
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        if (current.completedExerciseIds.includes(exerciseId)) return {}
        return {
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...current,
              status: 'in-progress',
              completedExerciseIds: [...current.completedExerciseIds, exerciseId],
              lastActivityAt: new Date().toISOString()
            }
          }
        }
      }),
      markLessonComplete: (lessonId, completed) => set((state) => {
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        return {
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...current,
              status: completed ? 'completed' : 'in-progress',
              activePhase: null,
              lastActivityAt: new Date().toISOString()
            }
          }
        }
      }),
      recordCapabilityAttempt: (rawAttempt, policy) => {
        let assessment: AttemptAssessment | null = null
        set((state) => {
          const current = state.lessonProgress[rawAttempt.lessonId] ?? createEmptyLessonProgress()
          const preserveActiveCycle = rawAttempt.phase === 'review' && current.status === 'in-progress'
          assessment = rawAttempt.phase === 'transfer'
            ? assessTransfer(rawAttempt, policy.contract)
            : rawAttempt.phase === 'review'
              ? assessReview(rawAttempt, policy.contract)
              : null
          const attempt: AttemptEvidence = assessment
            ? { ...rawAttempt, assessment, contentRevision: contractRevision(policy.contract) }
            : rawAttempt
          const attemptedAt = new Date(attempt.attemptedAt)
          let next = appendAttempt(current, attempt)
          const nextPhase: DurableCapabilityPhase | null = attempt.phase === 'baseline'
            ? 'input'
            : attempt.phase === 'performance'
              ? 'retry'
              : attempt.phase === 'retry'
                ? 'transfer'
                : null
          next = {
            ...next,
            activePhase: preserveActiveCycle ? current.activePhase : nextPhase,
            activeProcessEvidence: preserveActiveCycle
              ? current.activeProcessEvidence
              : nextPhase === null
                ? null
                : attempt.process ?? current.activeProcessEvidence
          }
          if (attempt.phase === 'transfer' && assessment) {
            next = applyTransferOutcome(next, assessment, policy.reviewIntervals, attemptedAt)
            if (!assessment.qualifies) next = { ...next, activeProcessEvidence: current.activeProcessEvidence }
          } else if (attempt.phase === 'review' && assessment) {
            next = {
              ...applyReviewResult(next, assessment.qualifies, policy.reviewIntervals, attemptedAt),
              status: preserveActiveCycle ? 'in-progress' : 'completed',
              activePhase: preserveActiveCycle ? current.activePhase : null
            }
          }
          return { lessonProgress: { ...state.lessonProgress, [attempt.lessonId]: next } }
        })
        return assessment
      },
      restoreEnvelope: (envelope) => {
        allowPersistenceRecovery()
        set({
          theme: envelope.settings.theme,
          lessonProgress: envelope.lessonProgress,
          activeLessonId: null
        })
      },
      restartLesson: (lessonId) => set((state) => ({
        lessonProgress: {
          ...state.lessonProgress,
          [lessonId]: createEmptyLessonProgress()
        }
      })),
      startLessonRepeat: (lessonId) => set((state) => {
        const current = state.lessonProgress[lessonId] ?? createEmptyLessonProgress()
        return {
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: {
              ...current,
              status: 'in-progress',
              currentSectionId: null,
              completedSectionIds: [],
              activePhase: null,
              completedExerciseIds: [],
              activeProcessEvidence: null,
              transferCompleted: false,
              lastActivityAt: new Date().toISOString()
            }
          }
        }
      }),
      resetProgress: () => {
        allowPersistenceRecovery()
        set({
          currentCefrLevel: null,
          activeLessonId: null,
          lessonProgress: {}
        })
      }
    }),
    {
      name: PERSIST_KEY,
      version: 5,
      storage: createAppPersistStorage(),
      onRehydrateStorage: () => {
        const recoveryEpoch = persistenceRecoveryEpoch
        activeHydrationRecoveryEpoch = recoveryEpoch
        migrationWriteAuthorized = false
        persistenceQuarantined = true
        return (_state, error) => {
          if (recoveryEpoch !== persistenceRecoveryEpoch) return
          migrationWriteAuthorized = false
          persistenceQuarantined = error !== undefined
          markPersistence(error !== undefined ? 'quarantined' : baselinePersistenceStatus)
        }
      },
      migrate: (persisted, version) => {
        const migrated = migratePersistedAppState(persisted, version)
        if (!migrated) throw new Error('Persisted app state is unsupported or invalid')
        validatedMigrationStates.add(migrated)
        return migrated
      },
      merge: (persisted, current) => {
        const migrated = typeof persisted === 'object'
          && persisted !== null
          && validatedMigrationStates.delete(persisted)
        if (activeHydrationRecoveryEpoch !== persistenceRecoveryEpoch) return current
        if (persisted === undefined) return current
        const validated = migratePersistedAppState(persisted, 5)
        if (!validated) throw new Error('Persisted app state is unsupported or invalid')
        migrationWriteAuthorized = migrated
        return { ...current, ...validated }
      },
      partialize: (state) => ({
        theme: state.theme,
        currentCefrLevel: state.currentCefrLevel,
        activeLessonId: state.activeLessonId,
        lessonProgress: state.lessonProgress
      })
    }
  )
)

storeReady = true
if (deferredPersistenceStatus) markPersistence(deferredPersistenceStatus)
