import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelAudioPlayer } from '@/features/practice/ModelAudioPlayer'

const mocks = vi.hoisted(() => ({ playModelAudio: vi.fn(), voiceCount: vi.fn(() => 2) }))

vi.mock('@/features/practice/modelAudio', async () => {
  const actual = await vi.importActual<typeof import('@/features/practice/modelAudio')>('@/features/practice/modelAudio')
  return { ...actual, availableVoiceCount: () => mocks.voiceCount(), playModelAudio: mocks.playModelAudio }
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

  it('shows the engine status instead of claiming playback on click', async () => {
    const user = userEvent.setup()
    let report: ((status: { state: string; message: string; voice?: { name: string; local: boolean } }) => void) | undefined
    mocks.playModelAudio.mockImplementation((_source, _rate, onStatus) => {
      report = onStatus
      return () => undefined
    })
    render(<ModelAudioPlayer source={{
      kind: 'speech-synthesis', text: 'Please recap.', locale: 'en-GB', voiceHints: ['English']
    }} />)

    await user.click(screen.getByRole('button', { name: /phát mẫu/i }))
    expect(screen.queryByText(/đang phát mẫu/i)).toBeNull()

    act(() => report?.({ state: 'loading-voices', message: 'Đang nạp giọng đọc của thiết bị…' }))
    expect(screen.getByText(/đang nạp giọng đọc/i)).toBeTruthy()

    act(() => report?.({ state: 'playing', message: 'Đang phát mẫu.', voice: { name: 'English UK Local', local: true } }))
    expect(screen.getByText('Đang phát mẫu.')).toBeTruthy()
    expect(screen.getByText(/English UK Local.*tại máy/i)).toBeTruthy()

    act(() => report?.({ state: 'error', message: 'Không phát được audio mẫu.', voice: { name: 'English UK Network', local: false } }))
    expect(screen.getByText('Không phát được audio mẫu.')).toBeTruthy()
    expect(screen.getByText(/English UK Network.*cần mạng/i)).toBeTruthy()
  })

  it('updates the voice count when the browser finishes loading voices', () => {
    const synth = Object.assign(new EventTarget(), { getVoices: () => [], speak: vi.fn(), cancel: vi.fn() })
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth })
    let count = 0
    mocks.voiceCount.mockImplementation(() => count)
    render(<ModelAudioPlayer source={{
      kind: 'speech-synthesis', text: 'Please recap.', locale: 'en-GB', voiceHints: ['English']
    }} />)
    expect(screen.getByText(/0 voice khả dụng/i)).toBeTruthy()

    count = 3
    act(() => { synth.dispatchEvent(new Event('voiceschanged')) })
    expect(screen.getByText(/3 voice khả dụng/i)).toBeTruthy()
  })})
