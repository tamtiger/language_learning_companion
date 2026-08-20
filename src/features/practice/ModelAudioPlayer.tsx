import { useEffect, useRef, useState } from 'react'
import type { ModelAudioSource } from '../../content/schema'
import { availableVoiceCount, modelAudioTranscript, playModelAudio } from './model_audio'

export function ModelAudioPlayer({ source, transcriptVisible = false }: {
  source: ModelAudioSource
  transcriptVisible?: boolean
}) {
  const [status, setStatus] = useState('Sẵn sàng phát mẫu.')
  const stop = useRef<(() => void) | null>(null)
  useEffect(() => () => stop.current?.(), [])
  const count = availableVoiceCount(source)
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => {
          stop.current?.()
          stop.current = playModelAudio(source)
          setStatus('Đang phát mẫu. Bạn có thể phát lại.')
        }} className="rounded-lg border border-purple-400 px-3 py-2 font-semibold">
          Phát mẫu
        </button>
        <span className="text-xs text-zinc-400">
          {source.kind === 'speech-synthesis' ? `TTS thử nghiệm · ${count} voice khả dụng` : `Audio đóng gói · ${source.speakerId}`}
        </span>
      </div>
      <p aria-live="polite" className="mt-2 text-xs text-zinc-400">{status}</p>
      {transcriptVisible && (
        <p aria-label="Bản chép audio" className="mt-3 rounded-lg bg-zinc-900 p-3 leading-7">
          {modelAudioTranscript(source)}
        </p>
      )}
    </div>
  )
}
