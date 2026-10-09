import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/app/App'
import { useAppStore, withPersistenceQuarantine, type PersistenceStatus } from '@/shared/hooks/useAppStore'

function setStatus(status: PersistenceStatus) {
  act(() => { useAppStore.setState({ persistence: { status } }) })
}

describe('persistence banner', () => {
  beforeEach(() => {
    useAppStore.getState().resetProgress()
  })

  it('stays out of the way while progress is being saved', () => {
    render(<App />)
    expect(screen.queryByTestId('persistence-banner')).toBeNull()
  })

  it('warns that progress only lives in memory and points to backup', () => {
    render(<App />)
    setStatus('memory-only')

    const banner = screen.getByTestId('persistence-banner')
    expect(banner.getAttribute('role')).toBe('status')
    expect(banner.textContent).toMatch(/đóng tab/i)
    expect(banner.textContent).toMatch(/backup/i)
  })

  it('reports a failed write with a status role', () => {
    render(<App />)
    const original = useAppStore.persist.getOptions().storage
    useAppStore.persist.setOptions({
      storage: withPersistenceQuarantine({
        getItem: () => null,
        setItem: () => { throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') },
        removeItem: () => undefined
      })
    })
    act(() => { useAppStore.setState({ theme: 'light' }) })
    useAppStore.persist.setOptions({ storage: original })

    const banner = screen.getByTestId('persistence-banner')
    expect(banner.getAttribute('role')).toBe('status')
    expect(banner.textContent).toMatch(/không ghi được/i)
  })

  it('raises an alert for quarantined data and opens Settings from the banner', async () => {
    const user = userEvent.setup()
    render(<App />)
    setStatus('quarantined')

    const banner = screen.getByTestId('persistence-banner')
    expect(banner.getAttribute('role')).toBe('alert')
    expect(banner.textContent).toMatch(/không ghi đè/i)

    await user.click(screen.getByRole('button', { name: /mở cài đặt/i }))
    expect(await screen.findByRole('heading', { name: /cài đặt và dữ liệu local/i })).toBeTruthy()
  })

  it('applies progress saved by another tab through the storage event', async () => {
    render(<App />)
    const key = 'language-learning-companion-storage-v3'
    window.localStorage.setItem(key, JSON.stringify({
      version: 5,
      state: { theme: 'light', currentCefrLevel: null, activeLessonId: null, lessonProgress: {} }
    }))

    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key }))
    })

    expect(useAppStore.getState().theme).toBe('light')
    window.localStorage.removeItem(key)
  })
})
