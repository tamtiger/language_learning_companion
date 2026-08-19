import { useEffect, useRef, useState } from 'react'
import { LocalMediaError, startLocalAudioRecording, type LocalAudioSession } from '../lesson-player/media_recorder'

export function SpokenResponse({ onReady }: { onReady: (ready: boolean) => void }) {
  const [status, setStatus] = useState('Sẵn sàng. Microphone chỉ được hỏi sau khi bạn bấm bắt đầu.')
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const session = useRef<LocalAudioSession | null>(null)
  const requestGeneration = useRef(0)

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])
  useEffect(() => () => {
    requestGeneration.current += 1
    session.current?.dispose()
  }, [])

  const start = async () => {
    const generation = requestGeneration.current + 1
    requestGeneration.current = generation
    session.current?.dispose()
    session.current = null
    setAudioUrl(null)
    setSeconds(0); setRunning(true); setStatus('Đang yêu cầu microphone…')
    try {
      const nextSession = await startLocalAudioRecording()
      if (requestGeneration.current !== generation) {
        nextSession.dispose()
        return
      }
      session.current = nextSession
      setStatus('Đang ghi âm cục bộ. Không có audio nào được upload.')
    } catch (error) {
      setStatus(error instanceof LocalMediaError && error.kind === 'denied' ? 'Microphone bị từ chối. Bạn vẫn có thể dùng timer-only.' : 'Ghi âm không khả dụng. Đã chuyển sang timer-only.')
    }
  }
  const finish = async () => {
    requestGeneration.current += 1
    setRunning(false)
    if (session.current) {
      try { setAudioUrl(await session.current.stop()); setStatus('Đã ghi xong. Audio chỉ ở phiên này.') } catch { setStatus('Không tạo được audio; attempt vẫn có thể hoàn tất bằng timer.') }
    } else setStatus('Đã hoàn tất bằng timer-only fallback.')
    onReady(true)
  }

  const finishTimerOnly = () => {
    requestGeneration.current += 1
    session.current?.dispose()
    session.current = null
    setAudioUrl(null)
    setRunning(false)
    setStatus('Đã hoàn tất bằng timer-only fallback.')
    onReady(true)
  }

  return <div className="rounded-xl border border-zinc-700 bg-zinc-950/60 p-4"><p aria-live="polite" className="text-sm text-zinc-300">{status}</p><p className="mt-2 font-mono text-2xl">{seconds}s</p><div className="mt-4 flex flex-wrap gap-2">{!running ? <button type="button" onClick={() => void start()} className="rounded-lg bg-red-600 px-4 py-2 font-bold">Bắt đầu ghi âm</button> : <button type="button" onClick={() => void finish()} className="rounded-lg bg-white px-4 py-2 font-bold text-zinc-950">Tôi đã nói xong</button>}<button type="button" onClick={finishTimerOnly} className="rounded-lg border border-zinc-700 px-4 py-2 font-semibold">Dùng timer-only</button></div>{audioUrl && <audio className="mt-4 w-full" controls src={audioUrl} aria-label="Bản ghi cục bộ của attempt" />}</div>
}
