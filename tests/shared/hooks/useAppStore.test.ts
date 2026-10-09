import { beforeEach, describe, expect, it } from 'vitest'
import type { PersistStorage, StorageValue } from 'zustand/middleware'
import { contractRevision } from '@/domain/progress/evidenceContract'
import {
  addLocalDays,
  createEmptyLessonProgress,
  type AttemptEvidence,
  type EvidenceContract
} from '@/domain/progress/progress'
import {
  createCapabilityBackup,
  handleStorageEvent,
  parseCapabilityBackup,
  selectStorage,
  useAppStore,
  withPersistenceQuarantine,
  type PersistedAppState
} from '@/shared/hooks/useAppStore'

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

const contract: EvidenceContract = {
  expectedLessonId: 'workplace-issue-update-b1',
  expectedTaskId: 'issue-update-task',
  expectedCapabilityId: 'workplace-communication',
  forbidVietnamese: true,
  forbidTranslation: true,
  forbidModelAnswer: true,
  maxHints: 0,
  maxPreparationSeconds: 60,
  requiredRubricIds: ['action'],
  timeLimitSeconds: 120,
  minWords: 20,
  maxWords: 120
}
const policy = { reviewIntervals: [1, 3, 7], contract }

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
    useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'transfer' }), policy)
    const progress = useAppStore.getState().lessonProgress['workplace-issue-update-b1']
    expect(progress.recentAttempts[0]).toMatchObject({ durationSeconds: 75, wordCount: 48 })
    expect(progress.activePhase).toBeNull()
    expect(progress.nextReviewAt).toBe(addLocalDays(new Date('2026-08-18T08:00:00.000Z'), 1))
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
    }), policy)

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

    useAppStore.setState({ currentCefrLevel: 'B1' })

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
    useAppStore.setState({ theme: 'light' })

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
    useAppStore.setState({ currentCefrLevel: 'B1' })

    expect(asyncWrites).toEqual([])
    expect(storedValue).toBe(futureValue)

    if (!resolveRead) throw new Error('Async hydration resolver was not created')
    resolveRead(futureValue)
    await hydration
    useAppStore.setState({ theme: 'light' })

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
    useAppStore.setState({ theme: 'light' })

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

    useAppStore.setState({ theme: 'light' })

    expect(asyncWrites).toHaveLength(1)
    expect(asyncWrites[0]).toMatchObject({ version: 5, state: { theme: 'light' } })
  })

  describe('assessed completion', () => {
    const lessonId = 'workplace-issue-update-b1'
    const read = () => useAppStore.getState().lessonProgress[lessonId]

    it('does not complete or schedule review after a transfer that misses the contract', () => {
      const assessment = useAppStore.getState().recordCapabilityAttempt(
        attempt({ phase: 'transfer', rubric: { action: 'not-met' } }), policy
      )

      expect(assessment).toEqual({ qualifies: false, reasons: ['rubric-gap'] })
      expect(read()).toMatchObject({
        status: 'in-progress',
        activePhase: 'transfer',
        transferCompleted: false,
        nextReviewAt: null,
        attemptCount: 1
      })
      expect(read().recentAttempts[0]).toMatchObject({ assessment, contentRevision: contractRevision(contract) })
    })

    it('completes and schedules review only after a qualifying transfer', () => {
      const assessment = useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'transfer' }), policy)

      expect(assessment).toEqual({ qualifies: true, reasons: [] })
      expect(read()).toMatchObject({ status: 'completed', transferCompleted: true, activePhase: null })
      expect(read().recentAttempts[0].assessment).toEqual({ qualifies: true, reasons: [] })
    })

    it('does not advance the review stage when the review used a model answer', () => {
      useAppStore.setState({
        lessonProgress: {
          [lessonId]: { ...createEmptyLessonProgress(), status: 'completed', reviewStage: 1, nextReviewAt: '2026-08-17T00:00:00.000Z' }
        }
      })
      const assessment = useAppStore.getState().recordCapabilityAttempt(attempt({
        phase: 'review',
        independence: { usedVietnamese: false, usedTranslation: false, usedModelAnswer: true, hintCount: 0, preparationSeconds: 10 }
      }), policy)

      expect(assessment?.reasons).toContain('used-model-answer')
      expect(read().reviewStage).toBe(1)
      expect(read().recentAttempts[0].assessment?.qualifies).toBe(false)
    })

    it('advances the review stage for a qualifying review and ignores empty rubrics', () => {
      useAppStore.setState({
        lessonProgress: {
          [lessonId]: { ...createEmptyLessonProgress(), status: 'completed', reviewStage: 0, nextReviewAt: '2026-08-17T00:00:00.000Z' }
        }
      })
      useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'review', rubric: {} }), policy)
      expect(read().reviewStage).toBe(0)

      useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'review', attemptId: 'attempt-2' }), policy)
      expect(read().reviewStage).toBe(1)
    })

    it('returns no assessment for attempts that are not transfer or review', () => {
      expect(useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'retry' }), policy)).toBeNull()
      expect(read().recentAttempts[0].assessment).toBeUndefined()
    })
  })

  describe('persistence status', () => {
    const throwingStorage: PersistStorage<PersistedAppState | null> = {
      getItem: () => null,
      setItem: () => { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') },
      removeItem: () => undefined
    }
    const futureValue = {
      version: 99,
      state: { theme: 'light', currentCefrLevel: 'C1', activeLessonId: 'future', lessonProgress: {} }
    } as unknown as StorageValue<PersistedAppState | null>

    it('starts ok', () => {
      expect(useAppStore.getState().persistence.status).toBe('ok')
    })

    it('survives a quota error without throwing and recovers on the next successful write', () => {
      useAppStore.persist.setOptions({ storage: withPersistenceQuarantine(throwingStorage) })

      expect(() => useAppStore.getState().recordCapabilityAttempt(attempt({ phase: 'transfer' }), policy)).not.toThrow()
      expect(useAppStore.getState().persistence.status).toBe('write-failed')
      expect(useAppStore.getState().lessonProgress['workplace-issue-update-b1'].status).toBe('completed')

      useAppStore.persist.setOptions({ storage: quarantinedTestStorage })
      useAppStore.setState({ theme: 'light' })
      expect(useAppStore.getState().persistence.status).toBe('ok')
    })

    it('reports quarantined after a rejected hydration and clears it on an explicit restore', async () => {
      persistedValue = futureValue
      await useAppStore.persist.rehydrate()
      expect(useAppStore.getState().persistence.status).toBe('quarantined')

      useAppStore.getState().restoreEnvelope({ storageVersion: 5, lessonProgress: {}, settings: { theme: 'light' } })
      expect(useAppStore.getState().persistence.status).toBe('ok')
    })

    it('falls back to memory when browser storage cannot be used', () => {
      const blocked = { get localStorage(): Storage { throw new DOMException('denied', 'SecurityError') } }
      expect(selectStorage(blocked as unknown as Window).memoryOnly).toBe(true)
      expect(selectStorage({ localStorage: window.localStorage } as unknown as Window).memoryOnly).toBe(false)
      expect(selectStorage(undefined).memoryOnly).toBe(true)
    })

    it('rehydrates when another tab changes the stored state', async () => {
      persistedValue = {
        version: 5,
        state: { theme: 'light', currentCefrLevel: null, activeLessonId: null, lessonProgress: {} }
      }
      await handleStorageEvent(new StorageEvent('storage', { key: 'language-learning-companion-storage-v3' }))

      expect(useAppStore.getState().theme).toBe('light')
    })

    it('ignores unrelated keys and never rehydrates over quarantined data', async () => {
      persistedValue = {
        version: 5,
        state: { theme: 'light', currentCefrLevel: null, activeLessonId: null, lessonProgress: {} }
      }
      await handleStorageEvent(new StorageEvent('storage', { key: 'something-else' }))
      expect(useAppStore.getState().theme).toBe('dark')

      persistedValue = futureValue
      await useAppStore.persist.rehydrate()
      persistedValue = {
        version: 5,
        state: { theme: 'light', currentCefrLevel: null, activeLessonId: null, lessonProgress: {} }
      }
      await handleStorageEvent(new StorageEvent('storage', { key: 'language-learning-companion-storage-v3' }))
      expect(useAppStore.getState().theme).toBe('dark')
      expect(useAppStore.getState().persistence.status).toBe('quarantined')
    })
  })

  describe('input progress', () => {
    const lessonId = 'workplace-issue-update-b1'
    const read = () => useAppStore.getState().lessonProgress[lessonId]

    it('saves, replaces and clears the resume point without touching other progress', () => {
      useAppStore.getState().markExerciseCorrect(lessonId, 'exercise-1')
      useAppStore.getState().setInputProgress(lessonId, { ladder: { stage: 'extract', answers: { x1: 'a' } } })
      expect(read().inputProgress).toEqual({ ladder: { stage: 'extract', answers: { x1: 'a' } } })
      expect(read().completedExerciseIds).toEqual(['exercise-1'])

      useAppStore.getState().setInputProgress(lessonId, { shadowingIndex: 2 })
      expect(read().inputProgress).toEqual({ shadowingIndex: 2 })

      useAppStore.getState().setInputProgress(lessonId, null)
      expect(read()).not.toHaveProperty('inputProgress')
      expect(read().completedExerciseIds).toEqual(['exercise-1'])
    })

    it('is dropped when the learner starts a repeat but keeps the review schedule', () => {
      useAppStore.setState({
        lessonProgress: {
          [lessonId]: { ...createEmptyLessonProgress(), status: 'completed', reviewStage: 2, nextReviewAt: '2099-01-01T00:00:00.000Z', inputProgress: { shadowingIndex: 1 } }
        }
      })
      useAppStore.getState().startLessonRepeat(lessonId)

      expect(read()).not.toHaveProperty('inputProgress')
      expect(read()).toMatchObject({ status: 'in-progress', reviewStage: 2, nextReviewAt: '2099-01-01T00:00:00.000Z' })
    })

    it('survives export and import as plain metadata', () => {
      useAppStore.getState().setInputProgress(lessonId, { perception: { phase: 'training', index: 1, pretestCorrect: 2, posttestCorrect: 0, missedItemIds: [] } })
      const backup = createCapabilityBackup(useAppStore.getState(), '2026-08-18T09:00:00.000Z')

      expect(parseCapabilityBackup(JSON.stringify(backup))).toEqual({ success: true, data: backup })
      expect(backup.lessonProgress[lessonId].inputProgress?.perception?.phase).toBe('training')
    })
  })})
