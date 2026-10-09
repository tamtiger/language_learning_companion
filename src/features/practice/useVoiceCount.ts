import { useEffect, useState } from 'react'
import type { ModelAudioSource } from '../../content/schema'
import { availableVoiceCount } from './modelAudio'

/** Number of device voices for the source; updates when the browser finishes loading its voices. */
export function useVoiceCount(source: ModelAudioSource): number {
  const [count, setCount] = useState(() => availableVoiceCount(source))

  useEffect(() => {
    const refresh = () => setCount(availableVoiceCount(source))
    refresh()
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) return
    const synth = window.speechSynthesis
    synth.addEventListener?.('voiceschanged', refresh)
    return () => synth.removeEventListener?.('voiceschanged', refresh)
  }, [source])

  return count
}
