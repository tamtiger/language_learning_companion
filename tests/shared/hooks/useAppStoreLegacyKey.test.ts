import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { useAppStore } from '@/shared/hooks/useAppStore'

const CURRENT_KEY = 'language-learning-companion-storage-v6'
const LEGACY_KEY = 'language-learning-companion-storage-v3'

describe('storage key rename', () => {
  beforeEach(() => {
    useAppStore.getState().resetProgress()
    localStorage.clear()
  })
  afterEach(() => localStorage.clear())

  it('loads progress that was saved under the version 3 key', async () => {
    const progress = { ...createEmptyLessonProgress(), status: 'in-progress' as const, attemptCount: 2 }
    localStorage.setItem(LEGACY_KEY, JSON.stringify({
      version: 6,
      state: {
        theme: 'light', currentCefrLevel: null, activeLessonId: null,
        lessonProgress: { 'workplace-ask-for-help-a2': progress }, storyBank: []
      }
    }))

    await useAppStore.persist.rehydrate()

    expect(useAppStore.getState().theme).toBe('light')
    expect(useAppStore.getState().lessonProgress['workplace-ask-for-help-a2']?.attemptCount).toBe(2)
  })

  it('writes the new key on the next save and then drops the old key', async () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify({
      version: 6,
      state: { theme: 'light', currentCefrLevel: null, activeLessonId: null, lessonProgress: {}, storyBank: [] }
    }))
    await useAppStore.persist.rehydrate()

    useAppStore.setState({ theme: 'dark' })

    expect(JSON.parse(localStorage.getItem(CURRENT_KEY) ?? '{}').state.theme).toBe('dark')
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull()
  })
})
