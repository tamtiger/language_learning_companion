export type MediaSupport = 'supported' | 'unsupported'
export type MediaFailureKind = 'unsupported' | 'denied' | 'error'

export interface MediaPrerequisites {
  hasGetUserMedia: boolean
  hasMediaRecorder: boolean
  isSecureContext: boolean
}

export function getMediaSupport(prerequisites: MediaPrerequisites): MediaSupport {
  return prerequisites.hasGetUserMedia
    && prerequisites.hasMediaRecorder
    && prerequisites.isSecureContext
    ? 'supported'
    : 'unsupported'
}

export function getBrowserMediaSupport(): MediaSupport {
  return getMediaSupport({
    hasGetUserMedia: typeof navigator !== 'undefined'
      && typeof navigator.mediaDevices?.getUserMedia === 'function',
    hasMediaRecorder: typeof globalThis.MediaRecorder !== 'undefined',
    isSecureContext: typeof window !== 'undefined' && window.isSecureContext
  })
}

export function classifyMediaError(error: unknown): Exclude<MediaFailureKind, 'unsupported'> {
  if (error instanceof DOMException
    && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) {
    return 'denied'
  }

  return 'error'
}

export class LocalMediaError extends Error {
  readonly kind: MediaFailureKind

  constructor(kind: MediaFailureKind, message: string, cause?: unknown) {
    super(message, { cause })
    this.name = 'LocalMediaError'
    this.kind = kind
  }
}

export interface LocalAudioSession {
  stop: () => Promise<string>
  dispose: () => void
}

const MEDIA_REQUEST_TIMEOUT_MS = 10_000

function stopTracks(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop())
}

export async function startLocalAudioRecording(): Promise<LocalAudioSession> {
  if (getBrowserMediaSupport() === 'unsupported') {
    throw new LocalMediaError(
      'unsupported',
      'Trình duyệt hoặc ngữ cảnh hiện tại không hỗ trợ ghi âm an toàn.'
    )
  }

  let stream: MediaStream
  const streamRequest = navigator.mediaDevices.getUserMedia({ audio: true })
  let requestTimedOut = false
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    stream = await Promise.race([
      streamRequest,
      new Promise<never>((_resolve, reject) => {
        timeoutId = setTimeout(() => {
          requestTimedOut = true
          reject(new LocalMediaError(
            'error',
            'Yêu cầu microphone không phản hồi. Đã chuyển sang timer fallback.'
          ))
        }, MEDIA_REQUEST_TIMEOUT_MS)
      })
    ])
  } catch (error) {
    if (requestTimedOut) {
      void streamRequest.then(stopTracks, () => undefined)
    }
    if (error instanceof LocalMediaError) {
      throw error
    }
    throw new LocalMediaError(
      classifyMediaError(error),
      'Không thể truy cập microphone.',
      error
    )
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
  }

  let recorder: MediaRecorder
  try {
    recorder = new MediaRecorder(stream)
  } catch (error) {
    stopTracks(stream)
    throw new LocalMediaError('error', 'Không thể khởi tạo bộ ghi âm.', error)
  }

  const chunks: BlobPart[] = []
  let audioUrl: string | null = null
  let settled = false
  let disposed = false
  let resolveStopped: ((url: string) => void) | null = null
  let rejectStopped: ((reason: Error) => void) | null = null

  const stopped = new Promise<string>((resolve, reject) => {
    resolveStopped = resolve
    rejectStopped = reject
  })

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data)
    }
  })

  recorder.addEventListener('stop', () => {
    stopTracks(stream)
    if (settled || disposed) return

    settled = true
    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
    audioUrl = URL.createObjectURL(blob)
    resolveStopped?.(audioUrl)
  })

  recorder.addEventListener('error', () => {
    stopTracks(stream)
    if (settled || disposed) return

    settled = true
    rejectStopped?.(new LocalMediaError('error', 'Ghi âm bị gián đoạn.'))
  })

  try {
    recorder.start()
  } catch (error) {
    settled = true
    stopTracks(stream)
    throw new LocalMediaError('error', 'Không thể bắt đầu ghi âm.', error)
  }

  return {
    stop: () => {
      if (recorder.state !== 'inactive') {
        try {
          recorder.stop()
        } catch (error) {
          stopTracks(stream)
          if (!settled) {
            settled = true
            rejectStopped?.(new LocalMediaError('error', 'Không thể dừng ghi âm.', error))
          }
        }
      }
      return stopped
    },
    dispose: () => {
      disposed = true
      try {
        if (recorder.state !== 'inactive') {
          recorder.stop()
        }
      } catch {
        // Cleanup vẫn phải tiếp tục nếu browser recorder đã ở trạng thái lỗi.
      } finally {
        stopTracks(stream)
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
          audioUrl = null
        }
      }
    }
  }
}
