import { useEffect, useRef, useState } from 'react'
import {
  LocalMediaError,
  startLocalAudioRecording,
  type LocalAudioSession
} from '../lesson-player/media_recorder'

export interface SpokenAttemptSnapshot {
  kind: 'spoken'
  durationSeconds: number
  wordCount: null
  audioUrl: string | null
  release?: () => void
}

type CaptureState = 'idle' | 'running' | 'ready'

export function SpokenResponse({
  onReady,
  onStarted
}: {
  onReady: (snapshot: SpokenAttemptSnapshot | null) => void
  onStarted?: () => void
}) {
  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [status, setStatus] = useState('Sẵn sàng. Chọn ghi âm hoặc timer-only để bắt đầu.')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const session = useRef<LocalAudioSession | null>(null)
  const requestGeneration = useRef(0)
  const transferred = useRef(false)
  const startedAt = useRef<number | null>(null)

  useEffect(() => {
    if (captureState !== 'running') return
    const timer = window.setInterval(() => {
      setSeconds(Math.max(0, Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1_000)))
    }, 250)
    return () => window.clearInterval(timer)
  }, [captureState])

  useEffect(() => () => {
    requestGeneration.current += 1
    if (!transferred.current) session.current?.dispose()
  }, [])

  const resetCapture = () => {
    requestGeneration.current += 1
    session.current?.dispose()
    session.current = null
    transferred.current = false
    setAudioUrl(null)
    setSeconds(0)
    startedAt.current = null
    setCaptureState('idle')
    setStatus('Sẵn sàng. Chọn ghi âm hoặc timer-only để bắt đầu.')
    onReady(null)
  }

  const startTimerOnly = () => {
    requestGeneration.current += 1
    session.current?.dispose()
    session.current = null
    transferred.current = false
    setAudioUrl(null)
    setSeconds(0)
    startedAt.current = Date.now()
    setCaptureState('running')
    setStatus('Timer-only đang chạy. Hãy bắt đầu nói.')
    onStarted?.()
  }

  const startRecording = async () => {
    const generation = requestGeneration.current + 1
    requestGeneration.current = generation
    session.current?.dispose()
    session.current = null
    transferred.current = false
    setAudioUrl(null)
    setSeconds(0)
    startedAt.current = Date.now()
    setCaptureState('running')
    setStatus('Đang yêu cầu microphone…')
    onStarted?.()
    try {
      const nextSession = await startLocalAudioRecording()
      if (requestGeneration.current !== generation) {
        nextSession.dispose()
        return
      }
      session.current = nextSession
      setStatus('Đang ghi âm cục bộ. Không có audio nào được upload.')
    } catch (error) {
      setStatus(error instanceof LocalMediaError && error.kind === 'denied'
        ? 'Microphone bị từ chối. Timer vẫn đang chạy.'
        : 'Ghi âm không khả dụng. Timer vẫn đang chạy.')
    }
  }

  const finish = async () => {
    if (captureState !== 'running' || seconds < 1) return
    const durationSeconds = Math.max(1, Math.ceil((Date.now() - (startedAt.current ?? Date.now())) / 1_000))
    requestGeneration.current += 1
    setCaptureState('ready')
    let nextAudioUrl: string | null = null
    if (session.current) {
      try {
        nextAudioUrl = await session.current.stop()
        setAudioUrl(nextAudioUrl)
        setStatus('Đã ghi xong. Audio chỉ ở phiên này.')
      } catch {
        setStatus('Không tạo được audio; attempt dùng số đo timer.')
      }
    } else {
      setStatus('Đã hoàn tất bằng timer-only.')
    }

    const ownedSession = session.current
    transferred.current = Boolean(ownedSession)
    onReady({
      kind: 'spoken',
      durationSeconds,
      wordCount: null,
      audioUrl: nextAudioUrl,
      ...(ownedSession ? { release: () => ownedSession.dispose() } : {})
    })
  }

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-4">
      <p aria-live="polite" className="text-sm text-zinc-300">{status}</p>
      <p className="mt-2 font-mono text-2xl">{seconds}s</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {captureState === 'idle' && (
          <>
            <button type="button" onClick={() => void startRecording()} className="rounded-lg bg-red-600 px-4 py-2 font-bold">
              Bắt đầu ghi âm
            </button>
            <button type="button" onClick={startTimerOnly} className="rounded-lg border border-zinc-700 px-4 py-2 font-semibold">
              Bắt đầu timer-only
            </button>
          </>
        )}
        {captureState === 'running' && (
          <button type="button" disabled={seconds < 1} onClick={() => void finish()} className="rounded-lg bg-white px-4 py-2 font-bold text-zinc-950 disabled:opacity-40">
            Tôi đã nói xong
          </button>
        )}
        {captureState === 'ready' && (
          <button type="button" onClick={resetCapture} className="rounded-lg border border-zinc-700 px-4 py-2 font-semibold">
            Làm lại
          </button>
        )}
      </div>
      {audioUrl && <audio className="mt-4 w-full" controls src={audioUrl} aria-label="Bản ghi cục bộ của attempt" />}
    </div>
  )
}
