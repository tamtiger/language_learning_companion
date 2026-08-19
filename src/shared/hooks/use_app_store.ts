import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { getBundledCatalog } from '../../content/catalog'
import type { CanonicalLesson } from '../../content/schema'
import {
  appendAttempt,
  applyReviewResult,
  createEmptyLessonProgress,
  scheduleTransferReview,
  type AttemptEvidence,
  type DurableCapabilityPhase,
  type ProgressByLesson
} from '../../domain/progress/progress'
import {
  createBackup,
  parseBackup,
  type ProgressBackup,
  type ProgressEnvelope
} from '../../infrastructure/storage/progress_storage'

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
  setTheme: (theme: 'dark' | 'light') => void
  setCefrLevel: (level: 'B1' | 'B2' | 'C1' | null) => void
  setActiveLessonId: (lessonId: string | null) => void
  setCurrentSection: (lessonId: string, sectionId: string | null) => void
  setActivePhase: (lessonId: string, phase: DurableCapabilityPhase | null) => void
  markExerciseCorrect: (lessonId: string, exerciseId: string) => void
  markLessonComplete: (lessonId: string, completed: boolean) => void
  recordCapabilityAttempt: (attempt: AttemptEvidence, reviewIntervals: number[]) => void
  restoreEnvelope: (envelope: ProgressEnvelope) => void
  restartLesson: (lessonId: string) => void
  resetProgress: () => void
}

export function createCapabilityBackup(
  source: Pick<AppState, 'theme' | 'lessonProgress'>,
  exportedAt = new Date().toISOString()
): ProgressBackup {
  return createBackup({
    storageVersion: 3,
    lessonProgress: source.lessonProgress,
    settings: { theme: source.theme }
  }, exportedAt)
}

export const parseCapabilityBackup = parseBackup

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      currentCefrLevel: null,
      activeLessonId: null,
      lessons: catalog.lessons,
      contentErrors: catalog.errors,
      lessonProgress: {},

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
      recordCapabilityAttempt: (attempt, reviewIntervals) => set((state) => {
        const current = state.lessonProgress[attempt.lessonId] ?? createEmptyLessonProgress()
        let next = appendAttempt(current, attempt)
        const nextPhase: DurableCapabilityPhase | null = attempt.phase === 'baseline'
          ? 'input'
          : attempt.phase === 'performance'
            ? 'retry'
            : attempt.phase === 'retry'
              ? 'transfer'
              : null
        next = { ...next, activePhase: nextPhase }
        if (attempt.phase === 'transfer') {
          next = {
            ...scheduleTransferReview(next, reviewIntervals, new Date(attempt.attemptedAt)),
            status: 'completed',
            activePhase: null
          }
        } else if (attempt.phase === 'review') {
          const passed = Object.values(attempt.rubric).every((rating) => rating === 'met')
          next = {
            ...applyReviewResult(next, passed, reviewIntervals, new Date(attempt.attemptedAt)),
            status: 'completed',
            activePhase: null
          }
        }
        return { lessonProgress: { ...state.lessonProgress, [attempt.lessonId]: next } }
      }),
      restoreEnvelope: (envelope) => set({
        theme: envelope.settings.theme,
        lessonProgress: envelope.lessonProgress,
        activeLessonId: null
      }),
      restartLesson: (lessonId) => set((state) => ({
        lessonProgress: {
          ...state.lessonProgress,
          [lessonId]: createEmptyLessonProgress()
        }
      })),
      resetProgress: () => set({
        currentCefrLevel: null,
        activeLessonId: null,
        lessonProgress: {}
      })
    }),
    {
      name: 'language-learning-companion-storage-v3',
      version: 3,
      storage: createJSONStorage(getSafeStorage),
      migrate: () => ({}),
      partialize: (state) => ({
        theme: state.theme,
        currentCefrLevel: state.currentCefrLevel,
        activeLessonId: state.activeLessonId,
        lessonProgress: state.lessonProgress
      })
    }
  )
)
