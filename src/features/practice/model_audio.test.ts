import { afterEach, describe, expect, it, vi } from 'vitest'
import { playModelAudio } from './model_audio'

describe('playModelAudio playback rate', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('passes the selected rate to browser speech synthesis', () => {
    const speak = vi.fn()
    class Utterance {
      lang = ''
      rate = 1
      voice: SpeechSynthesisVoice | null = null
      text: string
      constructor(text: string) { this.text = text }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { getVoices: () => [], speak, cancel: vi.fn() }
    })

    const source = { kind: 'speech-synthesis' as const, text: 'Deploy the fix.', locale: 'en-GB', voiceHints: ['English UK'] }
    ;(playModelAudio as (value: typeof source, rate: number) => () => void)(source, 0.85)

    expect(speak).toHaveBeenCalledOnce()
    expect(speak.mock.calls[0][0]).toMatchObject({ text: 'Deploy the fix.', lang: 'en-GB', rate: 0.85 })
  })

  it('prefers a voice from the requested locale over a generic voice hint', () => {
    const speak = vi.fn()
    class Utterance {
      lang = ''
      rate = 1
      voice: SpeechSynthesisVoice | null = null
      text: string
      constructor(text: string) { this.text = text }
    }
    const usVoice = { name: 'English US', lang: 'en-US', voiceURI: 'us' } as SpeechSynthesisVoice
    const auVoice = { name: 'English Australia', lang: 'en-AU', voiceURI: 'au' } as SpeechSynthesisVoice
    vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { getVoices: () => [usVoice, auVoice], speak, cancel: vi.fn() }
    })

    const source = { kind: 'speech-synthesis' as const, text: 'Review the change.', locale: 'en-AU', voiceHints: ['English'] }
    playModelAudio(source)

    expect(speak.mock.calls[0][0].voice).toBe(auVoice)
  })
})
