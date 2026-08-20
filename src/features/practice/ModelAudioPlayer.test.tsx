import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModelAudioPlayer } from './ModelAudioPlayer'

vi.mock('./model_audio', async () => {
  const actual = await vi.importActual<typeof import('./model_audio')>('./model_audio')
  return { ...actual, availableVoiceCount: () => 2, playModelAudio: vi.fn(() => () => undefined) }
})

describe('ModelAudioPlayer listening variation', () => {
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
})
