import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAppStore } from '@/shared/hooks/useAppStore'
import { Settings } from '@/features/settings/Settings'
import { LAST_EXPORT_KEY } from '@/infrastructure/storage/storageHealth'

describe('Settings data safety flows', () => {
  beforeEach(() => useAppStore.getState().resetProgress())
  afterEach(() => vi.unstubAllGlobals())

  it('rejects an invalid backup without replacing current progress', async () => {
    const user = userEvent.setup()
    useAppStore.getState().markLessonComplete('keep-me', true)
    render(<Settings />)

    const invalid = new File(
      [JSON.stringify({ storageVersion: 2, responseText: 'must never import' })],
      'invalid.json',
      { type: 'application/json' }
    )
    await user.upload(screen.getByLabelText(/chọn file import/i), invalid)

    await screen.findByText(/backup không hợp lệ/i)
    expect(screen.getByRole('status').textContent).toMatch(/backup không hợp lệ/i)
    expect(useAppStore.getState().lessonProgress['keep-me']?.status).toBe('completed')
  })

  it('migrates a valid v3 backup and only replaces state after confirmation', async () => {
    const user = userEvent.setup()
    useAppStore.getState().markLessonComplete('old-progress', true)
    render(<Settings />)

    const valid = new File([JSON.stringify({
      storageVersion: 3,
      lessonProgress: {},
      settings: { theme: 'light' },
      exportedAt: '2026-08-19T00:00:00.000Z'
    })], 'backup.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText(/chọn file import/i), valid)

    expect(await screen.findByText(/đã validate backup v6/i)).toBeTruthy()
    const confirmImport = screen.getByRole('button', { name: /xác nhận import/i })
    expect(document.activeElement).toBe(confirmImport)
    expect(useAppStore.getState().lessonProgress['old-progress']).toBeTruthy()
    await user.click(confirmImport)

    expect(useAppStore.getState().lessonProgress).toEqual({})
    expect(useAppStore.getState().theme).toBe('light')
    expect(document.activeElement).toBe(screen.getByRole('status'))
  })

  it('requires explicit confirmation before resetting progress', async () => {
    const user = userEvent.setup()
    useAppStore.getState().markLessonComplete('remove-me', true)
    render(<Settings />)

    await user.click(screen.getByRole('button', { name: /xóa progress/i }))
    expect(useAppStore.getState().lessonProgress['remove-me']).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /xác nhận xóa/i }))

    expect(useAppStore.getState().lessonProgress).toEqual({})
  })

  it('clears an old candidate immediately and ignores stale FileReader callbacks', async () => {
    class DeferredFileReader {
      static instances: DeferredFileReader[] = []
      result: string | ArrayBuffer | null = null
      onload: null | (() => void) = null
      onerror: null | (() => void) = null

      constructor() {
        DeferredFileReader.instances.push(this)
      }

      readAsText() {}
    }
    vi.stubGlobal('FileReader', DeferredFileReader)
    const user = userEvent.setup()
    render(<Settings />)
    const input = screen.getByLabelText(/chọn file import/i)

    await user.upload(input, new File(['first'], 'first.json', { type: 'application/json' }))
    const firstReader = DeferredFileReader.instances[0]
    firstReader.result = JSON.stringify({
      storageVersion: 6,
      lessonProgress: { first: createEmptyProgress() },
      settings: { theme: 'light' },
      storyBank: [],
      exportedAt: '2026-08-19T00:00:00.000Z'
    })
    await act(() => firstReader.onload?.())
    expect(screen.getByRole('button', { name: /xác nhận import/i })).toBeTruthy()

    await user.upload(input, new File(['second'], 'second.json', { type: 'application/json' }))
    expect(screen.queryByRole('button', { name: /xác nhận import/i })).toBeNull()
    expect(screen.getByRole('status').textContent).toMatch(/đang đọc/i)

    const secondReader = DeferredFileReader.instances[1]
    secondReader.result = JSON.stringify({
      storageVersion: 6,
      lessonProgress: { second: createEmptyProgress() },
      settings: { theme: 'dark' },
      storyBank: [],
      exportedAt: '2026-08-20T00:00:00.000Z'
    })
    await act(() => secondReader.onload?.())

    firstReader.result = JSON.stringify({
      storageVersion: 6,
      lessonProgress: { stale: createEmptyProgress() },
      settings: { theme: 'light' },
      storyBank: [],
      exportedAt: '2026-08-21T00:00:00.000Z'
    })
    await act(() => firstReader.onload?.())
    await user.click(screen.getByRole('button', { name: /xác nhận import/i }))

    expect(useAppStore.getState().lessonProgress).toEqual({ second: createEmptyProgress() })
    expect(useAppStore.getState().theme).toBe('dark')
  })

  it('keeps confirmation disabled after a file read error', async () => {
    class FailedFileReader {
      onload: null | (() => void) = null
      onerror: null | (() => void) = null
      readAsText() {
        queueMicrotask(() => this.onerror?.())
      }
    }
    vi.stubGlobal('FileReader', FailedFileReader)
    const user = userEvent.setup()
    render(<Settings />)

    await user.upload(
      screen.getByLabelText(/chọn file import/i),
      new File(['broken'], 'broken.json', { type: 'application/json' })
    )

    expect((await screen.findByRole('status')).textContent).toMatch(/không thể đọc/i)
    expect(screen.queryByRole('button', { name: /xác nhận import/i })).toBeNull()
  })

  it('shows a visible focus indicator when the hidden file input is focused', () => {
    render(<Settings />)
    const input = screen.getByLabelText(/chọn file import/i)
    const label = input.closest('label')

    expect(label?.className).toMatch(/focus-within:(outline|ring)/)
  })

  it('revokes the exported file URL only after the download has had time to start', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      const revoke = vi.spyOn(URL, 'revokeObjectURL')
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
      render(<Settings />)

      act(() => { screen.getByRole('button', { name: /tải backup metadata/i }).click() })

      expect(click).toHaveBeenCalledTimes(1)
      expect(revoke).not.toHaveBeenCalled()
      act(() => { vi.advanceTimersByTime(1_000) })
      expect(revoke).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })
  describe('data protection status', () => {
    function stubStorage(storage: object | undefined) {
      vi.stubGlobal('navigator', Object.assign(Object.create(window.navigator), { storage }))
    }

    beforeEach(() => window.localStorage.removeItem(LAST_EXPORT_KEY))
    afterEach(() => window.localStorage.removeItem(LAST_EXPORT_KEY))

    it('says the data is protected when the browser granted persistent storage', async () => {
      stubStorage({ persisted: async () => true, persist: vi.fn() })
      render(<Settings />)

      expect(await screen.findByText(/lưu trữ bền vững: đã được cấp/i)).toBeTruthy()
      expect(screen.queryByRole('button', { name: /yêu cầu lưu trữ bền vững/i })).toBeNull()
    })

    it('offers a request button when it is not granted and updates after the browser answers', async () => {
      const user = userEvent.setup()
      const persist = vi.fn().mockResolvedValue(true)
      stubStorage({ persisted: async () => false, persist })
      render(<Settings />)

      expect(await screen.findByText(/chưa được cấp/i)).toBeTruthy()
      await user.click(screen.getByRole('button', { name: /yêu cầu lưu trữ bền vững/i }))

      expect(persist).toHaveBeenCalledTimes(1)
      expect(await screen.findByText(/lưu trữ bền vững: đã được cấp/i)).toBeTruthy()
    })

    it('tells the learner when the browser cannot protect the data at all', async () => {
      stubStorage(undefined)
      render(<Settings />)

      expect(await screen.findByText(/không hỗ trợ/i)).toBeTruthy()
      expect(screen.getByText(/backup là cách duy nhất/i)).toBeTruthy()
    })

    it('shows that no backup was ever taken and records the time when one is exported', async () => {
      const user = userEvent.setup()
      stubStorage(undefined)
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
      render(<Settings />)

      expect(screen.getByText(/lần xuất cuối: chưa từng/i)).toBeTruthy()
      await user.click(screen.getByRole('button', { name: /tải backup metadata/i }))

      expect(window.localStorage.getItem(LAST_EXPORT_KEY)).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(screen.queryByText(/lần xuất cuối: chưa từng/i)).toBeNull()
      expect(screen.getByText(/lần xuất cuối:/i)).toBeTruthy()
    })
  })})

function createEmptyProgress() {
  return {
    status: 'not-started' as const,
    currentSectionId: null,
    completedSectionIds: [],
    activePhase: null,
    completedExerciseIds: [],
    attemptCount: 0,
    recentAttempts: [],
    activeProcessEvidence: null,
    transferCompleted: false,
    reviewStage: 0,
    nextReviewAt: null,
    lastActivityAt: null,
    contentRevision: 1
  }
}
