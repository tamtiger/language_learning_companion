import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { playModelAudio, selectVoice, type ModelAudioStatus } from '@/features/practice/modelAudio'

class Utterance {
  lang = ''
  rate = 1
  voice: SpeechSynthesisVoice | null = null
  text: string
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null
  constructor(text: string) { this.text = text }
}

function voice(name: string, lang: string, localService: boolean): SpeechSynthesisVoice {
  return { name, lang, voiceURI: name, localService, default: false } as SpeechSynthesisVoice
}

interface FakeSynth extends EventTarget {
  voices: SpeechSynthesisVoice[]
  getVoices: () => SpeechSynthesisVoice[]
  speak: ReturnType<typeof vi.fn>
  cancel: ReturnType<typeof vi.fn>
}

function installSynth(voices: SpeechSynthesisVoice[]): FakeSynth {
  const synth = Object.assign(new EventTarget(), {
    voices,
    getVoices: () => synth.voices,
    speak: vi.fn(),
    cancel: vi.fn()
  }) as FakeSynth
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance)
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth })
  return synth
}

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value })
}

const source = { kind: 'speech-synthesis' as const, text: 'Deploy the fix.', locale: 'en-GB', voiceHints: ['English'] }

describe('selectVoice', () => {
  it('prefers a voice installed on the device over a network voice of the same quality', () => {
    const network = voice('English UK Network', 'en-GB', false)
    const local = voice('English UK Local', 'en-GB', true)
    expect(selectVoice([network, local], source)).toBe(local)
  })

  it('still prefers the requested locale to a local voice of another locale', () => {
    const network = voice('English UK Network', 'en-GB', false)
    const localUs = voice('English US Local', 'en-US', true)
    expect(selectVoice([localUs, network], source)).toBe(network)
  })

  it('returns null when there is no voice for the language', () => {
    expect(selectVoice([voice('Deutsch', 'de-DE', true)], source)).toBeNull()
  })
})

describe('playModelAudio status', () => {
  let statuses: ModelAudioStatus[]
  const onStatus = (status: ModelAudioStatus) => { statuses.push(status) }

  beforeEach(() => {
    statuses = []
    setOnline(true)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('speaks with the on-device voice and reports start and end from the engine', () => {
    const local = voice('English UK Local', 'en-GB', true)
    const synth = installSynth([voice('English UK Network', 'en-GB', false), local])

    playModelAudio(source, 1, onStatus)

    expect(synth.speak).toHaveBeenCalledOnce()
    const utterance = synth.speak.mock.calls[0][0] as Utterance
    expect(utterance.voice).toBe(local)
    expect(statuses.at(-1)?.state).not.toBe('playing')

    utterance.onstart?.()
    expect(statuses.at(-1)).toMatchObject({ state: 'playing', voice: { name: 'English UK Local', local: true } })
    utterance.onend?.()
    expect(statuses.at(-1)?.state).toBe('ended')
  })

  it('waits for voiceschanged when the voice list is still empty', () => {
    const synth = installSynth([])

    playModelAudio(source, 1, onStatus)

    expect(synth.speak).not.toHaveBeenCalled()
    expect(statuses.at(-1)?.state).toBe('loading-voices')

    const local = voice('English UK Local', 'en-GB', true)
    synth.voices = [local]
    synth.dispatchEvent(new Event('voiceschanged'))

    expect(synth.speak).toHaveBeenCalledOnce()
    expect((synth.speak.mock.calls[0][0] as Utterance).voice).toBe(local)
  })

  it('does not hang when voiceschanged never fires', () => {
    vi.useFakeTimers()
    const synth = installSynth([])

    playModelAudio(source, 1, onStatus)
    vi.advanceTimersByTime(1_499)
    expect(synth.speak).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)

    expect(synth.speak).toHaveBeenCalledOnce()
    expect((synth.speak.mock.calls[0][0] as Utterance).lang).toBe('en-GB')
  })

  it('reports an engine error but not a cancel caused by the learner', () => {
    const synth = installSynth([voice('English UK Local', 'en-GB', true)])
    const stop = playModelAudio(source, 1, onStatus)
    const utterance = synth.speak.mock.calls[0][0] as Utterance

    utterance.onerror?.({ error: 'synthesis-failed' })
    expect(statuses.at(-1)).toMatchObject({ state: 'error' })
    expect(statuses.at(-1)?.message).toMatch(/không phát được/i)

    statuses.length = 0
    stop()
    utterance.onerror?.({ error: 'interrupted' })
    expect(statuses).toEqual([])
    expect(synth.cancel).toHaveBeenCalled()
  })

  it('says so when only a network voice exists and the device is offline', () => {
    setOnline(false)
    const synth = installSynth([voice('English UK Network', 'en-GB', false)])

    playModelAudio(source, 1, onStatus)

    expect(synth.speak).not.toHaveBeenCalled()
    expect(statuses.at(-1)).toMatchObject({ state: 'unavailable' })
    expect(statuses.at(-1)?.message).toMatch(/mạng/i)
  })

  it('falls back to a local voice of the same language when offline', () => {
    setOnline(false)
    const localUs = voice('English US Local', 'en-US', true)
    const synth = installSynth([voice('English UK Network', 'en-GB', false), localUs])

    playModelAudio(source, 1, onStatus)

    expect((synth.speak.mock.calls[0][0] as Utterance).voice).toBe(localUs)
  })

  it('reports unavailable when the browser has no speech synthesis', () => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined })
    vi.stubGlobal('SpeechSynthesisUtterance', undefined)
    delete (window as { speechSynthesis?: unknown }).speechSynthesis

    playModelAudio(source, 1, onStatus)

    expect(statuses.at(-1)).toMatchObject({ state: 'unavailable' })
  })

  it('stops waiting for voices when stopped before they load', () => {
    const synth = installSynth([])
    const stop = playModelAudio(source, 1, onStatus)

    stop()
    synth.voices = [voice('English UK Local', 'en-GB', true)]
    synth.dispatchEvent(new Event('voiceschanged'))

    expect(synth.speak).not.toHaveBeenCalled()
  })
})

describe('playModelAudio bundled audio', () => {
  const bundled = { kind: 'bundled' as const, src: '/audio/a.mp3', provenance: 'recorded', transcript: 'Hello.', speakerId: 'spk' }
  let instance: { play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; onended: (() => void) | null; onerror: (() => void) | null; onplaying: (() => void) | null }

  beforeEach(() => {
    instance = { play: vi.fn(), pause: vi.fn(), onended: null, onerror: null, onplaying: null }
    vi.stubGlobal('Audio', vi.fn(() => instance))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reports an error when playback is refused', async () => {
    instance.play.mockRejectedValue(new Error('NotAllowedError'))
    const statuses: ModelAudioStatus[] = []

    playModelAudio(bundled, 1, (status) => statuses.push(status))
    await Promise.resolve()
    await Promise.resolve()

    expect(statuses.at(-1)).toMatchObject({ state: 'error' })
  })

  it('reports playing and ended from the media element', async () => {
    instance.play.mockResolvedValue(undefined)
    const statuses: ModelAudioStatus[] = []

    playModelAudio(bundled, 1, (status) => statuses.push(status))
    instance.onplaying?.()
    expect(statuses.at(-1)?.state).toBe('playing')
    instance.onended?.()
    expect(statuses.at(-1)?.state).toBe('ended')
  })
})
