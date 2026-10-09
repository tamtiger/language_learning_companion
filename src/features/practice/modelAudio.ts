import type { ModelAudioSource } from '../../content/schema'

export const MODEL_AUDIO_RATES = [0.85, 1, 1.15] as const
export type ModelAudioRate = typeof MODEL_AUDIO_RATES[number]

export type ModelAudioState = 'loading-voices' | 'playing' | 'ended' | 'error' | 'unavailable'

/** What the audio engine is really doing, in words a learner can act on. */
export interface ModelAudioStatus {
  state: ModelAudioState
  message: string
  voice?: { name: string; local: boolean }
}

/** How long to wait for the browser to load its voices before speaking with the locale alone. */
const VOICE_WAIT_MS = 1_500

export function modelAudioTranscript(source: ModelAudioSource): string {
  return source.kind === 'bundled' ? source.transcript : source.text
}

function speechSynthesisOrNull(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return null
  return window.speechSynthesis
}

export function availableVoiceCount(source: ModelAudioSource): number {
  if (source.kind === 'bundled') return 1
  const synth = speechSynthesisOrNull()
  if (!synth) return 0
  const voices = synth.getVoices().filter((voice) => voice.lang.startsWith(source.locale.split('-')[0]))
  return new Set(voices.map((voice) => voice.voiceURI)).size
}

type SpeechSource = Extract<ModelAudioSource, { kind: 'speech-synthesis' }>

/** Best voice for the source; within each match quality an on-device voice wins over a network one. */
export function selectVoice(voices: readonly SpeechSynthesisVoice[], source: SpeechSource): SpeechSynthesisVoice | null {
  const locale = source.locale.toLowerCase()
  const language = locale.split('-')[0]
  const matchesHint = (voice: SpeechSynthesisVoice) => source.voiceHints.some((hint) =>
    voice.name.toLowerCase().includes(hint.toLowerCase()))
  const sameLocale = (voice: SpeechSynthesisVoice) => voice.lang.toLowerCase() === locale
  const sameLanguage = (voice: SpeechSynthesisVoice) => voice.lang.toLowerCase().startsWith(`${language}-`)
  const tiers = [
    (voice: SpeechSynthesisVoice) => sameLocale(voice) && matchesHint(voice),
    sameLocale,
    (voice: SpeechSynthesisVoice) => sameLanguage(voice) && matchesHint(voice),
    sameLanguage
  ]
  for (const tier of tiers) {
    const matches = voices.filter(tier)
    if (matches.length > 0) return matches.find((voice) => voice.localService === true) ?? matches[0]
  }
  return null
}

function describeVoice(voice: SpeechSynthesisVoice | null): ModelAudioStatus['voice'] {
  return voice ? { name: voice.name, local: voice.localService !== false } : undefined
}

function playBundled(
  source: Extract<ModelAudioSource, { kind: 'bundled' }>,
  rate: ModelAudioRate,
  report: (status: ModelAudioStatus) => void
): () => void {
  const audio = new Audio(source.src)
  let stopped = false
  const fail = () => {
    if (!stopped) report({ state: 'error', message: 'Không phát được audio mẫu. Kiểm tra kết nối hoặc thử lại.' })
  }
  audio.playbackRate = rate
  audio.onplaying = () => { if (!stopped) report({ state: 'playing', message: 'Đang phát mẫu.' }) }
  audio.onended = () => { if (!stopped) report({ state: 'ended', message: 'Đã phát xong.' }) }
  audio.onerror = fail
  void Promise.resolve(audio.play()).catch(fail)
  return () => {
    stopped = true
    audio.pause()
    audio.src = ''
  }
}

/**
 * Plays a model audio source and reports what actually happens through `onStatus`.
 * Returns a function that stops playback (a stop requested by the caller is never reported as an error).
 */
export function playModelAudio(
  source: ModelAudioSource,
  rate: ModelAudioRate = 1,
  onStatus: (status: ModelAudioStatus) => void = () => undefined
): () => void {
  if (source.kind === 'bundled') return playBundled(source, rate, onStatus)

  const synth = speechSynthesisOrNull()
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
    onStatus({ state: 'unavailable', message: 'Trình duyệt này không có giọng đọc tại máy, nên không phát được audio mẫu.' })
    return () => undefined
  }

  let stopped = false
  let waitTimer: number | undefined
  let onVoicesChanged: (() => void) | null = null
  const stopWaiting = () => {
    if (waitTimer !== undefined) window.clearTimeout(waitTimer)
    waitTimer = undefined
    if (onVoicesChanged) synth.removeEventListener?.('voiceschanged', onVoicesChanged)
    onVoicesChanged = null
  }

  const speak = () => {
    stopWaiting()
    if (stopped) return
    const voices = synth.getVoices()
    let voice = selectVoice(voices, source)
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false
    if (offline && voice?.localService === false) {
      const language = source.locale.toLowerCase().split('-')[0]
      voice = voices.find((candidate) => candidate.localService === true && candidate.lang.toLowerCase().startsWith(language)) ?? null
      if (!voice) {
        onStatus({ state: 'unavailable', message: 'Giọng đọc phù hợp cần mạng và thiết bị đang offline. Hãy kết nối mạng hoặc cài thêm giọng tiếng Anh cho thiết bị.' })
        return
      }
    }

    const utterance = new SpeechSynthesisUtterance(source.text)
    utterance.lang = source.locale
    utterance.rate = rate
    utterance.voice = voice
    const detail = describeVoice(voice)
    utterance.onstart = () => {
      if (!stopped) onStatus({ state: 'playing', message: 'Đang phát mẫu.', ...(detail ? { voice: detail } : {}) })
    }
    utterance.onend = () => {
      if (!stopped) onStatus({ state: 'ended', message: 'Đã phát xong.', ...(detail ? { voice: detail } : {}) })
    }
    utterance.onerror = (event) => {
      if (stopped || event.error === 'canceled' || event.error === 'interrupted') return
      onStatus({ state: 'error', message: 'Không phát được audio mẫu bằng giọng đọc của thiết bị. Thử lại hoặc đổi tốc độ.', ...(detail ? { voice: detail } : {}) })
    }
    synth.speak(utterance)
  }

  if (synth.getVoices().length > 0) {
    speak()
  } else {
    onStatus({ state: 'loading-voices', message: 'Đang nạp giọng đọc của thiết bị…' })
    onVoicesChanged = speak
    synth.addEventListener?.('voiceschanged', onVoicesChanged)
    waitTimer = window.setTimeout(speak, VOICE_WAIT_MS)
  }

  return () => {
    stopped = true
    stopWaiting()
    synth.cancel()
  }
}
