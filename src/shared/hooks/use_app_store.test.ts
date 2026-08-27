import { beforeEach, describe, expect, it } from 'vitest'
import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { createEmptyLessonProgress, type AttemptEvidence } from '../../domain/progress/progress'
import {
  createCapabilityBackup,
  parseCapabilityBackup,
  useAppStore,
  withPersistenceQuarantine,
  type PersistedAppState
} from './use_app_store'

let persistedValue: StorageValue<PersistedAppState | null> | null = null
let persistedWrites: StorageValue<PersistedAppState | null>[] = []
const testStorage: PersistStorage<PersistedAppState | null> = {
  getItem: () => persistedValue,
  setItem: (_name, value) => {
    persistedWrites.push(value)
    persistedValue = value
  },
  removeItem: () => { persistedValue = null }
}
const quarantinedTestStorage = withPersistenceQuarantine(testStorage)

function attempt(overrides: Partial<AttemptEvidence> = {}): AttemptEvidence {
  return {
    attemptId: 'attempt-1',
    lessonId: 'workplace-issue-update-b1',
    taskId: 'issue-update-task',
    capabilityId: 'workplace-communication',
    phase: 'performance',
    attemptedAt: '2026-08-18T08:00:00.000Z',
    durationSeconds: 75,
    wordCount: 48,
    rubric: { action: 'met' },
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount: 0,
      preparationSeconds: 22
    },
    completed: true,
    ...overrides
  }
}

describe('v5 app store', () => {
  beforeEach(() => {
    persistedValue = null
    useAppStore.persist.setOptions({ storage: quarantinedTestStorage })
    useAppStore.getState().resetProgress()
    useAppStore.setState({
      theme: 'dark',
      currentCefrLevel: null,
      activeLessonId: null,
      lessonProgress: {}
    })
    persistedWrites = []
  })

  it('starts with only canonical progress state', () => {
    const state = useAppStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.lessonProgress).toEqual({})
    expect(state).not.toHaveProperty('completedLessons')
    expect(state).not.toHaveProperty('performanceProgress')
  })

  it('persists active phase and correct exercise ids', () => {
    const store = useAppStore.getState()
    store.setActivePhase('lesson-1', 'retry')
    store.markExerciseCorrect('lesson-1', 'exercise-1')
    store.markExerciseCorrect('lesson-1', 'exercise-1')

    expect(useAppStore.getState().lessonProgress['lesson-1']).toMatchObject({
      activePhase: 'retry',
      completedExerciseIds: ['exercise-1']
    })
  })

  it('keeps active learning-loop process metadata across backup without learner output', () => {
    const process = {
      perceptionPretestCorrect: 2,
      perceptionPretestTotal: 4,
      perceptionPosttestCorrect: 3,
      perceptionPosttestTotal: 4,
      perceptionTrainingCompleted: 6,
      availableVariantCount: 2,
      variabilityQualified: false,
      shadowingStepIds: ['listen', 'variation'],
      listenedBack: false,
      listenBackChecklistCompleted: false,
      cueToSpeechStartMs: null,
      interactionTurnIds: [],
      optedOut: false
    }

    useAppStore.getState().setActiveProcessEvidence('pilot', process)
    const backup = createCapabilityBackup(useAppStore.getState(), '2026-08-18T09:00:00.000Z')

    expect(backup.lessonProgress.pilot.activeProcessEvidence).toEqual(process)
    expect(JSON.stringify(backup)).not.toMatch(/audioUrl|responseText|transcript/i)
  })

  it('records measured attempts and clears phase after transfer', () => {
    useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'transfer' }), [1, 3, 7])
    const progress = useAppStore.getState().lessonProgress['workplace-issue-update-b1']
    expect(progress.recentAttempts[0]).toMatchObject({ durationSeconds: 75, wordCount: 48 })
    expect(progress.activePhase).toBeNull()
    expect(progress.nextReviewAt).toBe('2026-08-19T08:00:00.000Z')
    expect(JSON.stringify(progress)).not.toMatch(/responseText|audio|blob/i)
  })

  it('round-trips v5 backup and rejects v2 without replacing state', () => {
    useAppStore.setState({
      lessonProgress: { mission: { ...createEmptyLessonProgress(), activePhase: 'performance' } }
    })
    const backup = createCapabilityBackup(useAppStore.getState(), '2026-08-18T09:00:00.000Z')
    expect(backup.storageVersion).toBe(5)
    expect(parseCapabilityBackup(JSON.stringify(backup))).toEqual({ success: true, data: backup })
    expect(parseCapabilityBackup({ ...backup, storageVersion: 2 }).success).toBe(false)
    expect(useAppStore.getState().lessonProgress.mission.activePhase).toBe('performance')
  })

  it('restart clears lesson progress including completed exercises', () => {
    useAppStore.setState({
      lessonProgress: {
        lesson: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          completedExerciseIds: ['one', 'two']
        }
      }
    })
    useAppStore.getState().restartLesson('lesson')
    expect(useAppStore.getState().lessonProgress.lesson).toEqual(createEmptyLessonProgress())
  })

  it('starts a repeat cycle without deleting attempt history or review evidence', () => {
    const previousAttempt = attempt({ phase: 'transfer' })
    useAppStore.setState({
      lessonProgress: {
        [previousAttempt.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          currentSectionId: 'check',
          completedSectionIds: ['brief', 'check'],
          activePhase: null,
          completedExerciseIds: ['exercise-1'],
          attemptCount: 7,
          recentAttempts: [previousAttempt],
          activeProcessEvidence: {
            perceptionPretestCorrect: 1,
            perceptionPretestTotal: 2,
            perceptionPosttestCorrect: 2,
            perceptionPosttestTotal: 2,
            perceptionTrainingCompleted: 3,
            availableVariantCount: 2,
            variabilityQualified: true,
            shadowingStepIds: ['listen'],
            listenedBack: true,
            listenBackChecklistCompleted: true,
            cueToSpeechStartMs: 500,
            interactionTurnIds: ['turn-1'],
            optedOut: false
          },
          transferCompleted: true,
          reviewStage: 2,
          nextReviewAt: '2026-09-01T00:00:00.000Z'
        }
      }
    })

    useAppStore.getState().startLessonRepeat(previousAttempt.lessonId)

    expect(useAppStore.getState().lessonProgress[previousAttempt.lessonId]).toMatchObject({
      status: 'in-progress',
      currentSectionId: null,
      completedSectionIds: [],
      activePhase: null,
      completedExerciseIds: [],
      attemptCount: 7,
      recentAttempts: [previousAttempt],
      activeProcessEvidence: null,
      transferCompleted: false,
      reviewStage: 2,
      nextReviewAt: '2026-09-01T00:00:00.000Z'
    })
  })

  it('does not let a stale review save erase an active repeat cycle', () => {
    const process = {
      perceptionPretestCorrect: 1,
      perceptionPretestTotal: 2,
      perceptionPosttestCorrect: 2,
      perceptionPosttestTotal: 2,
      perceptionTrainingCompleted: 3,
      availableVariantCount: 2,
      variabilityQualified: true,
      shadowingStepIds: ['listen'],
      listenedBack: false,
      listenBackChecklistCompleted: false,
      cueToSpeechStartMs: null,
      interactionTurnIds: [],
      optedOut: false
    }
    const lessonId = 'workplace-issue-update-b1'
    useAppStore.setState({
      lessonProgress: {
        [lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input',
          activeProcessEvidence: process,
          nextReviewAt: '2026-08-17T00:00:00.000Z'
        }
      }
    })

    useAppStore.getState().recordCapabilityAttempt(attempt({
      phase: 'review',
      attemptedAt: '2026-08-18T08:00:00.000Z'
    }), [1, 3, 7])

    expect(useAppStore.getState().lessonProgress[lessonId]).toMatchObject({
      status: 'in-progress',
      activePhase: 'input',
      activeProcessEvidence: process,
      transferCompleted: false
    })
  })

  it('hydrates v4 process metadata through the canonical migration and can export it as v5', async () => {
    const legacyProgress = structuredClone(createEmptyLessonProgress()) as unknown as Record<string, unknown>
    delete legacyProgress.activeProcessEvidence
    const process = {
      perceptionPretestCorrect: 1,
      perceptionPretestTotal: 2,
      perceptionPosttestCorrect: 2,
      perceptionPosttestTotal: 2,
      perceptionTrainingCompleted: 3,
      availableVariantCount: 1,
      variabilityQualified: false,
      shadowingStepIds: ['listen'],
      listenedBack: true,
      cueToSpeechStartMs: 500,
      interactionTurnIds: [],
      optedOut: false
    }
    persistedValue = {
      version: 4,
      state: {
        theme: 'light',
        currentCefrLevel: 'B1',
        activeLessonId: 'mission',
        lessonProgress: {
          mission: {
            ...legacyProgress,
            attemptCount: 1,
            recentAttempts: [{ ...attempt({ lessonId: 'mission' }), process }]
          }
        }
      }
    } as unknown as StorageValue<PersistedAppState | null>

    await useAppStore.persist.rehydrate()

    const progress = useAppStore.getState().lessonProgress.mission
    expect(progress.activeProcessEvidence).toBeNull()
    expect(progress.recentAttempts[0].process?.listenBackChecklistCompleted).toBe(false)
    expect(() => createCapabilityBackup(useAppStore.getState(), '2026-08-18T09:00:00.000Z')).not.toThrow()
    expect(persistedWrites).toHaveLength(1)
    expect(persistedValue).toMatchObject({
      version: 5,
      state: {
        theme: 'light',
        currentCefrLevel: 'B1',
        activeLessonId: 'mission'
      }
    })
  })

  it('keeps current defaults when malformed v5 state is hydrated', async () => {
    persistedValue = {
      version: 5,
      state: {
        theme: 'light',
        currentCefrLevel: 'B2',
        activeLessonId: 'unsafe',
        lessonProgress: { unsafe: { status: 'completed' } },
        responseText: 'private learner output'
      }
    } as unknown as StorageValue<PersistedAppState | null>
    await useAppStore.persist.rehydrate()
    expect(useAppStore.getState()).toMatchObject({
      theme: 'dark',
      currentCefrLevel: null,
      activeLessonId: null,
      lessonProgress: {}
    })
  })

  it('does not overwrite unsupported future storage while failing hydration closed', async () => {
    const futureValue = {
      version: 99,
      state: {
        theme: 'light',
        currentCefrLevel: 'C1',
        activeLessonId: 'future',
        lessonProgress: {}
      }
    } as unknown as StorageValue<PersistedAppState | null>
    persistedValue = futureValue

    await useAppStore.persist.rehydrate()

    expect(useAppStore.getState()).toMatchObject({
      theme: 'dark',
      currentCefrLevel: null,
      activeLessonId: null,
      lessonProgress: {}
    })
    expect(persistedWrites).toEqual([])
    expect(persistedValue).toBe(futureValue)

    useAppStore.getState().setCefrLevel('B1')

    expect(useAppStore.getState().currentCefrLevel).toBe('B1')
    expect(persistedWrites).toEqual([])
    expect(persistedValue).toBe(futureValue)
  })

  it('allows a validated restore to replace quarantined future storage intentionally', async () => {
    const futureValue = {
      version: 99,
      state: {
        theme: 'light',
        currentCefrLevel: 'C1',
        activeLessonId: 'future',
        lessonProgress: {}
      }
    } as unknown as StorageValue<PersistedAppState | null>
    persistedValue = futureValue
    await useAppStore.persist.rehydrate()

    useAppStore.getState().restoreEnvelope({
      storageVersion: 5,
      lessonProgress: {},
      settings: { theme: 'light' }
    })

    expect(persistedWrites).toHaveLength(1)
    expect(persistedValue).not.toBe(futureValue)
    expect(persistedValue).toMatchObject({
      version: 5,
      state: { theme: 'light', activeLessonId: null, lessonProgress: {} }
    })
  })

  it('allows explicit reset to clear quarantine and resume ordinary persistence', async () => {
    persistedValue = {
      version: 99,
      state: {
        theme: 'light',
        currentCefrLevel: 'C1',
        activeLessonId: 'future',
        lessonProgress: {}
      }
    } as unknown as StorageValue<PersistedAppState | null>
    await useAppStore.persist.rehydrate()

    useAppStore.getState().resetProgress()
    useAppStore.getState().setTheme('light')

    expect(persistedWrites).toHaveLength(2)
    expect(persistedValue).toMatchObject({
      version: 5,
      state: {
        theme: 'light',
        currentCefrLevel: null,
        activeLessonId: null,
        lessonProgress: {}
      }
    })
  })

  it('blocks ordinary writes while async hydration is still inspecting stored data', async () => {
    const futureValue = {
      version: 99,
      state: {
        theme: 'light',
        currentCefrLevel: 'C1',
        activeLessonId: 'future',
        lessonProgress: {}
      }
    } as unknown as StorageValue<PersistedAppState | null>
    let storedValue = futureValue
    let resolveRead: ((value: StorageValue<PersistedAppState | null>) => void) | undefined
    const asyncWrites: StorageValue<PersistedAppState | null>[] = []
    const asyncStorage: PersistStorage<PersistedAppState | null> = {
      getItem: () => new Promise((resolve) => { resolveRead = resolve }),
      setItem: (_name, value) => {
        asyncWrites.push(value)
        storedValue = value
      },
      removeItem: () => undefined
    }
    useAppStore.persist.setOptions({ storage: withPersistenceQuarantine(asyncStorage) })

    const hydration = useAppStore.persist.rehydrate()
    useAppStore.getState().setCefrLevel('B1')

    expect(asyncWrites).toEqual([])
    expect(storedValue).toBe(futureValue)

    if (!resolveRead) throw new Error('Async hydration resolver was not created')
    resolveRead(futureValue)
    await hydration
    useAppStore.getState().setTheme('light')

    expect(asyncWrites).toEqual([])
    expect(storedValue).toBe(futureValue)
  })

  it('lets an explicit reset win over an older pending future hydration', async () => {
    const futureValue = {
      version: 99,
      state: {
        theme: 'light',
        currentCefrLevel: 'C1',
        activeLessonId: 'future',
        lessonProgress: {}
      }
    } as unknown as StorageValue<PersistedAppState | null>
    let resolveRead: ((value: StorageValue<PersistedAppState | null>) => void) | undefined
    const asyncWrites: StorageValue<PersistedAppState | null>[] = []
    const asyncStorage: PersistStorage<PersistedAppState | null> = {
      getItem: () => new Promise((resolve) => { resolveRead = resolve }),
      setItem: (_name, value) => { asyncWrites.push(value) },
      removeItem: () => undefined
    }
    useAppStore.persist.setOptions({ storage: withPersistenceQuarantine(asyncStorage) })

    const hydration = useAppStore.persist.rehydrate()
    useAppStore.getState().resetProgress()
    expect(asyncWrites).toHaveLength(1)

    if (!resolveRead) throw new Error('Async hydration resolver was not created')
    resolveRead(futureValue)
    await hydration
    useAppStore.getState().setTheme('light')

    expect(asyncWrites).toHaveLength(2)
    expect(asyncWrites[1]).toMatchObject({ version: 5, state: { theme: 'light' } })
  })

  it('ignores a stale async hydration failure after a newer valid hydration succeeds', async () => {
    const staleRequest: {
      resolve?: (value: StorageValue<PersistedAppState | null>) => void
    } = {}
    let readCount = 0
    const asyncWrites: StorageValue<PersistedAppState | null>[] = []
    const asyncStorage: PersistStorage<PersistedAppState | null> = {
      getItem: () => {
        readCount += 1
        if (readCount === 1) {
          return new Promise((resolve) => { staleRequest.resolve = resolve })
        }
        return {
          version: 5,
          state: {
            theme: 'dark',
            currentCefrLevel: null,
            activeLessonId: null,
            lessonProgress: {}
          }
        }
      },
      setItem: (_name, value) => { asyncWrites.push(value) },
      removeItem: () => undefined
    }
    useAppStore.persist.setOptions({ storage: withPersistenceQuarantine(asyncStorage) })

    const staleHydration = useAppStore.persist.rehydrate()
    await useAppStore.persist.rehydrate()
    const resolveStale = staleRequest.resolve
    if (!resolveStale) throw new Error('Stale hydration resolver was not created')
    resolveStale({
      version: 99,
      state: {
        theme: 'light',
        currentCefrLevel: 'C1',
        activeLessonId: 'future',
        lessonProgress: {}
      }
    })
    await staleHydration

    useAppStore.getState().setTheme('light')

    expect(asyncWrites).toHaveLength(1)
    expect(asyncWrites[0]).toMatchObject({ version: 5, state: { theme: 'light' } })
  })
})
