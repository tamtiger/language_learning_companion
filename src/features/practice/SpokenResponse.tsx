import { useEffect, useRef, useState } from 'react'
import { GuardedButton } from '../../shared/components/GuardedButton'
import { useUnsavedWork } from '../../shared/hooks/useUnsavedWork'
import {
  LocalMediaError,
  startLocalAudioRecording,
  type LocalAudioSession
} from '../lesson-player/mediaRecorder'

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
  onStarted,
  onListenedBack
}: {
  onReady: (snapshot: SpokenAttemptSnapshot | null) => void
  onStarted?: () => void
  onListenedBack?: () => void
}) {
  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [status, setStatus] = useState('Sẵn sàng. Chọn ghi âm hoặc timer-only để bắt đầu.')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const session = useRef<LocalAudioSession | null>(null)
  const requestGeneration = useRef(0)
  const transferred = useRef(false)
  const startedAt = useRef<number | null>(null)
  const container = useRef<HTMLDivElement>(null)
  useUnsavedWork(captureState !== 'idle', 'bản ghi âm chưa lưu')
  const startButton = useRef<HTMLButtonElement>(null)
  const finishButton = useRef<HTMLButtonElement>(null)
  const retryButton = useRef<HTMLButtonElement>(null)

  // The button that had focus is replaced when the state changes; hand focus to its successor.
  useEffect(() => {
    const active = document.activeElement
    if (active !== document.body && !container.current?.contains(active)) return
    const next = captureState === 'running' ? finishButton : captureState === 'ready' ? retryButton : startButton
    next.current?.focus()
  }, [captureState])

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
      // The permission prompt is not speaking time: count from the moment the microphone is live.
      startedAt.current = Date.now()
      setSeconds(0)
      setStatus('Đang ghi âm cục bộ. Không có audio nào được upload.')
    } catch (error) {
      if (requestGeneration.current !== generation) return
      startedAt.current = Date.now()
      setSeconds(0)
      setStatus(error instanceof LocalMediaError && error.kind === 'denied'
        ? 'Microphone bị từ chối. Timer vẫn đang chạy.'
        : 'Ghi âm không khả dụng. Timer vẫn đang chạy.')
    }
  }

  const finish = async () => {
    if (captureState !== 'running' || seconds < 1) return
    const durationSeconds = Math.max(1, Math.ceil((Date.now() - (startedAt.current ?? Date.now())) / 1_000))
    const generation = requestGeneration.current + 1
    requestGeneration.current = generation
    const ownedSession = session.current
    setCaptureState('ready')
    let nextAudioUrl: string | null = null
    if (ownedSession) {
      try {
        nextAudioUrl = await ownedSession.stop()
        if (requestGeneration.current !== generation || session.current !== ownedSession) {
          ownedSession.dispose()
          return
        }
        setAudioUrl(nextAudioUrl)
        setStatus('Đã ghi xong. Audio chỉ ở phiên này.')
      } catch {
        if (requestGeneration.current !== generation || session.current !== ownedSession) return
        setStatus('Không tạo được audio; attempt dùng số đo timer.')
      }
    } else {
      setStatus('Đã hoàn tất bằng timer-only.')
    }

    if (requestGeneration.current !== generation) return
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
    <div ref={container} className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-4">
      <p aria-live="polite" className="text-sm text-zinc-300">{status}</p>
      <p className="mt-2 font-mono text-2xl">{seconds}s</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {captureState === 'idle' && (
          <>
            <button ref={startButton} type="button" onClick={() => void startRecording()} className="rounded-lg bg-red-700 px-4 py-2 font-bold text-white">
              Bắt đầu ghi âm
            </button>
            <button type="button" onClick={startTimerOnly} className="rounded-lg border border-zinc-700 px-4 py-2 font-semibold">
              Bắt đầu timer-only
            </button>
          </>
        )}
        {captureState === 'running' && (
          <GuardedButton ref={finishButton} disabledReason={seconds < 1 ? 'Hãy nói ít nhất một giây trước khi kết thúc.' : undefined} onClick={() => void finish()} className="rounded-lg bg-white px-4 py-2 font-bold text-zinc-950">
            Tôi đã nói xong
          </GuardedButton>
        )}
        {captureState === 'ready' && (
          <button ref={retryButton} type="button" onClick={resetCapture} className="rounded-lg border border-zinc-700 px-4 py-2 font-semibold">
            Làm lại
          </button>
        )}
      </div>
      {audioUrl && <audio className="mt-4 w-full" controls src={audioUrl} onEnded={onListenedBack} aria-label="Bản ghi cục bộ của attempt" />}
    </div>
  )
}
