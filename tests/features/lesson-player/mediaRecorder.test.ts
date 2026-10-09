import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  classifyMediaError,
  getMediaSupport,
  startLocalAudioRecording
} from '@/features/lesson-player/mediaRecorder'

describe('local media fallback', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reports unsupported when getUserMedia, MediaRecorder or secure context is absent', () => {
    expect(getMediaSupport({ hasGetUserMedia: false, hasMediaRecorder: true, isSecureContext: true })).toBe('unsupported')
    expect(getMediaSupport({ hasGetUserMedia: true, hasMediaRecorder: false, isSecureContext: true })).toBe('unsupported')
    expect(getMediaSupport({ hasGetUserMedia: true, hasMediaRecorder: true, isSecureContext: false })).toBe('unsupported')
  })

  it('reports supported only when every browser prerequisite exists', () => {
    expect(getMediaSupport({ hasGetUserMedia: true, hasMediaRecorder: true, isSecureContext: true })).toBe('supported')
  })

  it('maps microphone permission errors to denied and other failures to error', () => {
    expect(classifyMediaError(new DOMException('Denied', 'NotAllowedError'))).toBe('denied')
    expect(classifyMediaError(new DOMException('Blocked', 'SecurityError'))).toBe('denied')
    expect(classifyMediaError(new Error('Device unavailable'))).toBe('error')
  })

  it('stops every track and revokes the local Blob URL on dispose', async () => {
    const stopTrack = vi.fn()
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local-attempt')
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)

    class FakeMediaRecorder {
      state: RecordingState = 'inactive'
      mimeType = 'audio/webm'
      private listeners = new Map<string, Array<(event: { data: Blob }) => void>>()

      addEventListener(type: string, listener: (event: { data: Blob }) => void) {
        const listeners = this.listeners.get(type) ?? []
        this.listeners.set(type, [...listeners, listener])
      }

      start() {
        this.state = 'recording'
      }

      stop() {
        this.state = 'inactive'
        this.listeners.get('dataavailable')?.forEach((listener) => listener({ data: new Blob(['audio']) }))
        this.listeners.get('stop')?.forEach((listener) => listener({ data: new Blob() }))
      }
    }

    vi.stubGlobal('window', { isSecureContext: true })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }]
        })
      }
    })
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder)

    const session = await startLocalAudioRecording()
    const audioUrl = await session.stop()
    session.dispose()

    expect(audioUrl).toBe('blob:local-attempt')
    expect(stopTrack).toHaveBeenCalled()
    expect(createObjectUrl).toHaveBeenCalledOnce()
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:local-attempt')
  })

  it('fails into timer fallback when the microphone request never settles', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('window', { isSecureContext: true })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockReturnValue(new Promise(() => undefined))
      }
    })
    vi.stubGlobal('MediaRecorder', class FakeMediaRecorder {})
    let settled = false

    void startLocalAudioRecording().then(
      () => { settled = true },
      () => { settled = true }
    )
    await vi.advanceTimersByTimeAsync(10_000)

    expect(settled).toBe(true)
  })

  it('stops the stream when MediaRecorder.start throws', async () => {
    const stopTrack = vi.fn()
    vi.stubGlobal('window', { isSecureContext: true })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }]
        })
      }
    })
    vi.stubGlobal('MediaRecorder', class StartFailureRecorder {
      state: RecordingState = 'inactive'
      mimeType = 'audio/webm'
      addEventListener() {}
      start() { throw new DOMException('Cannot start', 'NotSupportedError') }
    })

    await expect(startLocalAudioRecording()).rejects.toBeInstanceOf(Error)
    expect(stopTrack).toHaveBeenCalledOnce()
  })

  it('stops the stream and rejects when MediaRecorder.stop throws', async () => {
    const stopTrack = vi.fn()
    vi.stubGlobal('window', { isSecureContext: true })
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }]
        })
      }
    })
    vi.stubGlobal('MediaRecorder', class StopFailureRecorder {
      state: RecordingState = 'inactive'
      mimeType = 'audio/webm'
      addEventListener() {}
      start() { this.state = 'recording' }
      stop() { throw new DOMException('Cannot stop', 'InvalidStateError') }
    })

    const session = await startLocalAudioRecording()

    await expect(session.stop()).rejects.toMatchObject({ kind: 'error' })
    expect(stopTrack).toHaveBeenCalledOnce()
  })
})
