import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { Settings } from './Settings'

describe('Settings data safety flows', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

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

    expect((await screen.findByRole('status')).textContent).toMatch(/backup không hợp lệ/i)
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

    expect(await screen.findByText(/đã validate backup v4/i)).toBeTruthy()
    expect(useAppStore.getState().lessonProgress['old-progress']).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /xác nhận import/i }))

    expect(useAppStore.getState().lessonProgress).toEqual({})
    expect(useAppStore.getState().theme).toBe('light')
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
})
