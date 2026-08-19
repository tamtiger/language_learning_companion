import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SpokenResponse } from './SpokenResponse'

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(async () => 'blob:test-audio'),
  dispose: vi.fn()
}))

vi.mock('../lesson-player/media_recorder', () => ({
  LocalMediaError: class LocalMediaError extends Error { kind = 'error' },
  startLocalAudioRecording: mocks.start
}))

describe('SpokenResponse measured local capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.start.mockResolvedValue({ stop: mocks.stop, dispose: mocks.dispose })
  })

  it('requires an explicit timer start and positive elapsed time before finish', async () => {
    const user = userEvent.setup()
    const onReady = vi.fn()
    render(<SpokenResponse onReady={onReady} />)

    expect(screen.queryByRole('button', { name: /tôi đã nói xong/i })).toBeNull()
    await user.click(screen.getByRole('button', { name: /bắt đầu timer-only/i }))
    const finish = screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement
    expect(finish.disabled).toBe(true)
    expect(onReady).not.toHaveBeenCalled()

    await waitFor(() => expect(finish.disabled).toBe(false), { timeout: 1_500 })
    await user.click(finish)

    expect(mocks.start).not.toHaveBeenCalled()
    expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ kind: 'spoken', audioUrl: null }))
    expect(onReady.mock.calls[0][0].durationSeconds).toBeGreaterThan(0)
  })

  it('records locally, exposes playback snapshot and resets with cleanup', async () => {
    const user = userEvent.setup()
    const onReady = vi.fn()
    render(<SpokenResponse onReady={onReady} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu ghi âm/i }))
    await screen.findByText(/đang ghi âm cục bộ/i)
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement).disabled).toBe(false)
    }, { timeout: 1_500 })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))

    expect(screen.getByLabelText(/bản ghi cục bộ/i)).toBeTruthy()
    expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ audioUrl: 'blob:test-audio' }))
    await user.click(screen.getByRole('button', { name: /làm lại/i }))
    expect(mocks.dispose).toHaveBeenCalledOnce()
    expect(onReady).toHaveBeenLastCalledWith(null)
  })
})
