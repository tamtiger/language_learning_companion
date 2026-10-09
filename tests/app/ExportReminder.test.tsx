import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { ExportReminder } from '@/app/ExportReminder'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { LAST_EXPORT_KEY, setLastExportedAt } from '@/infrastructure/storage/storageHealth'
import { useAppStore } from '@/shared/hooks/useAppStore'

function withProgress() {
  useAppStore.setState({
    lessonProgress: { mission: { ...createEmptyLessonProgress(), status: 'in-progress', attemptCount: 2 } }
  })
}

describe('ExportReminder', () => {
  beforeEach(() => {
    useAppStore.getState().resetProgress()
    window.localStorage.removeItem(LAST_EXPORT_KEY)
  })
  afterEach(() => {
    window.localStorage.removeItem(LAST_EXPORT_KEY)
    vi.unstubAllGlobals()
  })

  it('stays hidden when there is no progress to lose', () => {
    render(<ExportReminder onOpenSettings={() => undefined} />)
    expect(screen.queryByTestId('export-reminder')).toBeNull()
  })

  it('asks for a first backup once there is progress', () => {
    withProgress()
    render(<ExportReminder onOpenSettings={() => undefined} />)

    const reminder = screen.getByTestId('export-reminder')
    expect(reminder.getAttribute('role')).toBe('status')
    expect(reminder.textContent).toMatch(/chưa từng/i)
  })

  it('stays hidden after a recent export and returns when it ages', () => {
    withProgress()
    setLastExportedAt(new Date().toISOString())
    const { unmount } = render(<ExportReminder onOpenSettings={() => undefined} />)
    expect(screen.queryByTestId('export-reminder')).toBeNull()
    unmount()

    setLastExportedAt(new Date(Date.now() - 10 * 86_400_000).toISOString())
    render(<ExportReminder onOpenSettings={() => undefined} />)
    expect(screen.getByTestId('export-reminder').textContent).toMatch(/10 ngày/)
  })

  it('opens Settings, can be put off, and disappears right after an export', async () => {
    const user = userEvent.setup()
    withProgress()
    const onOpenSettings = vi.fn()
    render(<ExportReminder onOpenSettings={onOpenSettings} />)

    await user.click(screen.getByRole('button', { name: /mở cài đặt/i }))
    expect(onOpenSettings).toHaveBeenCalledTimes(1)

    act(() => { setLastExportedAt(new Date().toISOString()) })
    expect(screen.queryByTestId('export-reminder')).toBeNull()
  })

  it('can be dismissed for the session', async () => {
    const user = userEvent.setup()
    withProgress()
    render(<ExportReminder onOpenSettings={() => undefined} />)

    await user.click(screen.getByRole('button', { name: /để sau/i }))
    expect(screen.queryByTestId('export-reminder')).toBeNull()
  })

  it('is shown by the app, which also asks the browser for persistent storage once', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('navigator', Object.assign(Object.create(window.navigator), {
      storage: { persisted: async () => false, persist }
    }))
    withProgress()
    render(<App />)

    expect(screen.getByTestId('export-reminder')).toBeTruthy()
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1))
  })
})
