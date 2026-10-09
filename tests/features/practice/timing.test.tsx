import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { createEmptyLessonProgress, type DurableCapabilityPhase } from '@/domain/progress/progress'
import { CapabilityTask } from '@/features/practice/CapabilityTask'
import { SpokenResponse } from '@/features/practice/SpokenResponse'
import { useAppStore } from '@/shared/hooks/useAppStore'
import { rateAllMet } from '../../helpers/flow'

const recorder = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(async () => 'blob:test-audio'),
  dispose: vi.fn()
}))

vi.mock('@/features/lesson-player/mediaRecorder', () => ({
  LocalMediaError: class LocalMediaError extends Error { kind = 'denied' },
  startLocalAudioRecording: recorder.start
}))

function written(lessonId: string) {
  const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === lessonId)
  if (!lesson?.performanceTask || lesson.performanceTask.mode !== 'written') throw new Error('Written fixture missing')
  return { lesson, task: lesson.performanceTask }
}

function resumeAt(lessonId: string, activePhase: DurableCapabilityPhase) {
  useAppStore.setState({
    lessonProgress: { [lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase } }
  })
}

function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `word${index}`).join(' ')
}

function setupUser() {
  return userEvent.setup({ delay: null })
}

describe('written timing', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    useAppStore.getState().resetProgress()
  })
  afterEach(() => vi.useRealTimers())

  it('stops the clock when the draft is locked and keeps rubric time out of the duration', async () => {
    const user = setupUser()
    const { lesson, task } = written('workplace-issue-update-b1')
    resumeAt(lesson.lessonId, 'transfer')
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.queryByRole('group', { name: task.rubric[0].label })).toBeNull()
    await user.click(screen.getByRole('textbox'))
    await user.paste(words(80))
    act(() => { vi.advanceTimersByTime(30_000) })
    await user.click(screen.getByRole('button', { name: /chốt bản nháp/i }))

    expect(screen.getByRole('textbox').hasAttribute('readonly')).toBe(true)
    act(() => { vi.advanceTimersByTime(90_000) })
    await rateAllMet(user)
    await user.click(screen.getByRole('button', { name: /hoàn thành transfer/i }))

    const attempt = useAppStore.getState().lessonProgress[lesson.lessonId].recentAttempts[0]
    expect(attempt.durationSeconds).toBeGreaterThanOrEqual(30)
    expect(attempt.durationSeconds).toBeLessThan(40)
    expect(attempt.assessment?.reasons ?? []).not.toContain('overtime')
  })

  it('asks to lock the draft before rating and explains why', async () => {
    const user = setupUser()
    const { lesson, task } = written('workplace-issue-update-b1')
    resumeAt(lesson.lessonId, 'retry')
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.click(screen.getByRole('textbox'))
    await user.paste(words(80))
    const next = screen.getByRole('button', { name: /sang transfer/i })
    expect(next.getAttribute('aria-disabled')).toBe('true')
    expect(document.getElementById(next.getAttribute('aria-describedby') as string)?.textContent).toMatch(/chốt bản nháp/i)
  })

  it('shows a running clock against the limit and announces the limit once', async () => {
    const user = setupUser()
    const { lesson, task } = written('workplace-issue-update-b1')
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.type(screen.getByRole('textbox'), 'a')
    act(() => { vi.advanceTimersByTime(65_000) })
    const limit = task.outputContract.timeLimitSeconds
    const clock = screen.getByRole('timer')
    expect(clock.textContent).toMatch(/01:0[4-6]/)
    expect(clock.textContent).toContain(`${String(Math.floor(limit / 60)).padStart(2, '0')}:${String(limit % 60).padStart(2, '0')}`)

    expect(screen.queryByText(/đã tới giới hạn/i)).toBeNull()
    act(() => { vi.advanceTimersByTime(limit * 1000) })
    expect(screen.getAllByText(/đã tới giới hạn/i)).toHaveLength(1)
    expect(screen.getByText(/đã tới giới hạn/i).closest('[role="status"]')).toBeTruthy()
  })

  it('does not count time spent reading a read-once source as preparation', async () => {
    const user = setupUser()
    const { lesson, task } = written('technical-doc-action-b1')
    render(<CapabilityTask lesson={lesson} task={task} />)

    act(() => { vi.advanceTimersByTime(200_000) })
    await user.click(screen.getByRole('button', { name: /đã đọc một lần.*ẩn tài liệu/i }))
    act(() => { vi.advanceTimersByTime(4_000) })
    await user.click(screen.getByRole('textbox'))
    await user.paste('Prerequisite, command, success signal and rollback from memory.')
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))

    const attempt = useAppStore.getState().lessonProgress[lesson.lessonId].recentAttempts[0]
    expect(attempt.independence.preparationSeconds).toBeLessThan(10)
  })
})

describe('spoken timing', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.clearAllMocks()
  })
  afterEach(() => vi.useRealTimers())

  it('starts the duration when the microphone is ready, not when permission is requested', async () => {
    const user = setupUser()
    let grant: (() => void) | undefined
    recorder.start.mockImplementation(() => new Promise((resolve) => {
      grant = () => resolve({ stop: recorder.stop, dispose: recorder.dispose })
    }))
    const onReady = vi.fn()
    render(<SpokenResponse onReady={onReady} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu ghi âm/i }))
    act(() => { vi.advanceTimersByTime(5_000) })
    await act(async () => { grant?.() })
    act(() => { vi.advanceTimersByTime(3_000) })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await act(async () => {})

    expect(onReady).toHaveBeenCalledTimes(1)
    const duration = onReady.mock.calls[0][0].durationSeconds as number
    expect(duration).toBeGreaterThanOrEqual(3)
    expect(duration).toBeLessThanOrEqual(4)
  })

  it('starts the timer-only fallback from the moment permission is refused', async () => {
    const user = setupUser()
    let refuse: (() => void) | undefined
    recorder.start.mockImplementation(() => new Promise((_resolve, reject) => {
      refuse = () => reject(new Error('denied'))
    }))
    const onReady = vi.fn()
    render(<SpokenResponse onReady={onReady} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu ghi âm/i }))
    act(() => { vi.advanceTimersByTime(4_000) })
    await act(async () => { refuse?.() })
    act(() => { vi.advanceTimersByTime(2_000) })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await act(async () => {})

    const duration = onReady.mock.calls[0][0].durationSeconds as number
    expect(duration).toBeGreaterThanOrEqual(2)
    expect(duration).toBeLessThanOrEqual(3)
  })
})