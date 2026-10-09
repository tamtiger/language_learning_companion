import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InteractionPractice } from '@/features/practice/InteractionPractice'

const recorderMocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(async () => 'blob:interaction-audio'),
  dispose: vi.fn()
}))

vi.mock('@/features/lesson-player/mediaRecorder', () => ({
  LocalMediaError: class LocalMediaError extends Error { kind = 'error' },
  startLocalAudioRecording: recorderMocks.start
}))

describe('InteractionPractice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    recorderMocks.start.mockResolvedValue({ stop: recorderMocks.stop, dispose: recorderMocks.dispose })
  })

  it('renders an interruption turn as a scripted interaction', () => {
    render(<InteractionPractice turns={[{
      id: 'interrupt-1', kind: 'interruption', prompt: 'What is the priority?', expectedFunction: 'answer briefly'
    }]} onComplete={vi.fn()} />)

    expect(screen.getByText(/interaction · interruption/i)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'What is the priority?' })).toBeTruthy()
  })

  it('requires a fresh response to a scripted repair turn', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<InteractionPractice turns={[{
      id: 'repair-1', kind: 'repair', prompt: 'Could you rephrase that?', expectedFunction: 'repair the explanation'
    }]} onComplete={onComplete} />)
    expect((screen.getByRole('button', { name: /hoàn thành interaction/i }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: /timer-only/i }))
    await waitFor(() => expect((screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement).disabled).toBe(false), { timeout: 1_500 })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await user.click(screen.getByRole('button', { name: /hoàn thành interaction/i }))
    expect(onComplete).toHaveBeenCalledWith(['repair-1'])
  })

  it('moves focus to the new prompt when advancing to another turn', async () => {
    const user = userEvent.setup()
    render(<InteractionPractice turns={[
      {
        id: 'clarify-1', kind: 'clarification', prompt: 'Which service failed?',
        expectedFunction: 'name the affected service'
      },
      {
        id: 'repair-2', kind: 'repair', prompt: 'Could you make the impact clearer?',
        expectedFunction: 'restate the impact'
      }
    ]} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /timer-only/i }))
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement).disabled).toBe(false)
    }, { timeout: 1_500 })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await user.click(screen.getByRole('button', { name: /lượt tiếp theo/i }))

    const nextPrompt = screen.getByRole('heading', { name: 'Could you make the impact clearer?' })
    expect(document.activeElement).toBe(nextPrompt)
  })

  it('releases a transferred recording snapshot when the interaction unmounts', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<InteractionPractice turns={[{
      id: 'follow-up-1', kind: 'follow-up', prompt: 'What happens next?', expectedFunction: 'describe the next action'
    }]} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu ghi âm/i }))
    await screen.findByText(/đang ghi âm cục bộ/i)
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement).disabled).toBe(false)
    }, { timeout: 1_500 })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await waitFor(() => {
      expect((screen.getByRole('button', { name: /hoàn thành interaction/i }) as HTMLButtonElement).disabled).toBe(false)
    })

    unmount()
    expect(recorderMocks.dispose).toHaveBeenCalledOnce()
  })
})
