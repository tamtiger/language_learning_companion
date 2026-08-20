import type { ModelAudioSource } from '../../content/schema'

export const MODEL_AUDIO_RATES = [0.85, 1, 1.15] as const
export type ModelAudioRate = typeof MODEL_AUDIO_RATES[number]

export function modelAudioTranscript(source: ModelAudioSource): string {
  return source.kind === 'bundled' ? source.transcript : source.text
}
export function availableVoiceCount(source: ModelAudioSource): number {
  if (source.kind === 'bundled') return 1
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return 0
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith(source.locale.split('-')[0]))
  return new Set(voices.map((voice) => voice.voiceURI)).size
}

export function playModelAudio(source: ModelAudioSource, rate: ModelAudioRate = 1): () => void {
  if (source.kind === 'bundled') {
    const audio = new Audio(source.src)
    audio.playbackRate = rate
    void audio.play()
    return () => {
      audio.pause()
      audio.src = ''
    }
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    return () => undefined
  }
  const utterance = new SpeechSynthesisUtterance(source.text)
  utterance.lang = source.locale
  utterance.rate = rate
  const voices = window.speechSynthesis.getVoices()
  const locale = source.locale.toLowerCase()
  const language = locale.split('-')[0]
  const matchesHint = (voice: SpeechSynthesisVoice) => source.voiceHints.some((hint) =>
    voice.name.toLowerCase().includes(hint.toLowerCase()))
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === locale && matchesHint(voice))
    ?? voices.find((voice) => voice.lang.toLowerCase() === locale)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(`${language}-`) && matchesHint(voice))
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(`${language}-`))
    ?? null
  window.speechSynthesis.speak(utterance)
  return () => window.speechSynthesis.cancel()
}
