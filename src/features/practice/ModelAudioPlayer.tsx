import { useEffect, useRef, useState } from 'react'
import type { ModelAudioSource } from '../../content/schema'
import { availableVoiceCount, MODEL_AUDIO_RATES, modelAudioTranscript, playModelAudio, type ModelAudioRate } from './modelAudio'

export function ModelAudioPlayer({ source, transcriptVisible = false }: {
  source: ModelAudioSource
  transcriptVisible?: boolean
}) {
  const [status, setStatus] = useState('Sẵn sàng phát mẫu.')
  const [rate, setRate] = useState<ModelAudioRate>(1)
  const stop = useRef<(() => void) | null>(null)
  useEffect(() => {
    setStatus('Sẵn sàng phát mẫu.')
    return () => {
      const stopPlayback = stop.current
      stop.current = null
      stopPlayback?.()
    }
  }, [source])
  const count = availableVoiceCount(source)
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => {
          stop.current?.()
          stop.current = playModelAudio(source, rate)
          setStatus('Đang phát mẫu. Bạn có thể phát lại.')
        }} className="rounded-lg border border-purple-400 px-3 py-2 font-semibold">
          Phát mẫu
        </button>
        <span className="text-xs text-zinc-400">
          {source.kind === 'speech-synthesis'
            ? `TTS tổng hợp trên thiết bị · ${count} voice khả dụng · requested locale ${source.locale}`
            : `Audio đóng gói · ${source.speakerId}`}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Tốc độ phát mẫu">
        <span className="text-xs font-semibold text-zinc-400">Tốc độ</span>
        {MODEL_AUDIO_RATES.map((option) => (
          <button key={option} type="button" aria-pressed={rate === option} onClick={() => setRate(option)}
            className="rounded-md border border-zinc-700 px-2 py-1 text-xs font-bold">
            {option}×
          </button>
        ))}
      </div>
      {source.kind === 'speech-synthesis' && (
        <p className="mt-2 text-xs text-zinc-400">
          Synthetic device voice: requested locale phụ thuộc voice có trên máy và không thay thế human accent sample.
        </p>
      )}
      <p aria-live="polite" className="mt-2 text-xs text-zinc-400">{status}</p>
      {transcriptVisible && (
        <p aria-label="Bản chép audio" className="mt-3 rounded-lg bg-zinc-900 p-3 leading-7">
          {modelAudioTranscript(source)}
        </p>
      )}
    </div>
  )
}
