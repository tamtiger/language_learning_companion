import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpokenResponse } from './SpokenResponse'

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(async () => 'blob:test-audio'),
  dispose: vi.fn()
}))

vi.mock('../lesson-player/media_recorder', () => ({
  LocalMediaError: class LocalMediaError extends Error {
    kind = 'error'
  },
  startLocalAudioRecording: mocks.start
}))

describe('SpokenResponse local-only fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.start.mockResolvedValue({ stop: mocks.stop, dispose: mocks.dispose })
  })

  it('completes timer-only without requesting microphone access', async () => {
    const user = userEvent.setup()
    const onReady = vi.fn()
    render(<SpokenResponse onReady={onReady} />)

    await user.click(screen.getByRole('button', { name: /dùng timer-only/i }))

    expect(mocks.start).not.toHaveBeenCalled()
    expect(onReady).toHaveBeenCalledWith(true)
  })

  it('disposes an active local recording when switching to timer-only', async () => {
    const user = userEvent.setup()
    render(<SpokenResponse onReady={() => undefined} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu ghi âm/i }))
    await screen.findByText(/đang ghi âm cục bộ/i)
    await user.click(screen.getByRole('button', { name: /dùng timer-only/i }))

    expect(mocks.dispose).toHaveBeenCalledOnce()
  })
})
