import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelAudioPlayer } from './ModelAudioPlayer'

const mocks = vi.hoisted(() => ({ playModelAudio: vi.fn() }))

vi.mock('./model_audio', async () => {
  const actual = await vi.importActual<typeof import('./model_audio')>('./model_audio')
  return { ...actual, availableVoiceCount: () => 2, playModelAudio: mocks.playModelAudio }
})

describe('ModelAudioPlayer listening variation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.playModelAudio.mockImplementation(() => () => undefined)
  })

  it('offers three speeds and labels locale as a synthetic device request', async () => {
    const user = userEvent.setup()
    render(<ModelAudioPlayer source={{
      kind: 'speech-synthesis', text: 'Please recap the decision.', locale: 'en-AU', voiceHints: ['English Australia']
    }} />)

    expect(screen.getByRole('button', { name: '0.85×' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '1×' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '1.15×' })).toBeTruthy()
    expect(screen.getByText(/requested locale.*en-AU/i)).toBeTruthy()
    expect(screen.getByText(/synthetic.*không thay thế human accent sample/i)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: '1.15×' }))
    expect(screen.getByRole('button', { name: '1.15×' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('stops owned playback when the source changes and when the player unmounts', async () => {
    const user = userEvent.setup()
    const stopFirst = vi.fn()
    const stopSecond = vi.fn()
    mocks.playModelAudio.mockReturnValueOnce(stopFirst).mockReturnValueOnce(stopSecond)
    const firstSource = {
      kind: 'speech-synthesis' as const,
      text: 'First model.',
      locale: 'en-AU',
      voiceHints: ['English Australia']
    }
    const secondSource = { ...firstSource, text: 'Second model.' }
    const { rerender, unmount } = render(<ModelAudioPlayer source={firstSource} />)

    await user.click(screen.getByRole('button', { name: /phát mẫu/i }))
    rerender(<ModelAudioPlayer source={secondSource} />)
    expect(stopFirst).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: /phát mẫu/i }))
    unmount()
    expect(stopSecond).toHaveBeenCalledOnce()
  })
})
