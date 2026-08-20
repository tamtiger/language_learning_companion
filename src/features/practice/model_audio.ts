import type { ModelAudioSource } from '../../content/schema'

export function modelAudioTranscript(source: ModelAudioSource): string {
  return source.kind === 'bundled' ? source.transcript : source.text
}
export function availableVoiceCount(source: ModelAudioSource): number {
  if (source.kind === 'bundled') return 1
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return 0
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith(source.locale.split('-')[0]))
  return new Set(voices.map((voice) => voice.voiceURI)).size
}

export function playModelAudio(source: ModelAudioSource): () => void {
  if (source.kind === 'bundled') {
    const audio = new Audio(source.src)
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
  const voices = window.speechSynthesis.getVoices()
  utterance.voice = voices.find((voice) => source.voiceHints.some((hint) => voice.name.includes(hint)))
    ?? voices.find((voice) => voice.lang === source.locale)
    ?? null
  window.speechSynthesis.speak(utterance)
  return () => window.speechSynthesis.cancel()
}
