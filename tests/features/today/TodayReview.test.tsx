import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addLocalDays, createEmptyLessonProgress } from '@/domain/progress/progress'
import { useAppStore } from '@/shared/hooks/useAppStore'
import { TodayPage } from '@/features/today/TodayPage'

const LESSON_ID = 'meeting-disagree-and-recap-b2'

describe('Today review scheduling and repeat', () => {
  let originalTz: string | undefined

  beforeEach(() => {
    originalTz = process.env.TZ
    process.env.TZ = 'Asia/Ho_Chi_Minh'
    useAppStore.getState().resetProgress()
  })
  afterEach(() => {
    vi.useRealTimers()
    if (originalTz === undefined) delete process.env.TZ
    else process.env.TZ = originalTz
  })

  it('shows a review once local midnight passes without any interaction', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(new Date(2026, 7, 18, 23, 59, 30))
    useAppStore.setState({
      lessonProgress: {
        [LESSON_ID]: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          transferCompleted: true,
          nextReviewAt: addLocalDays(new Date(2026, 7, 18, 10, 0), 1)
        }
      }
    })

    render(<TodayPage onStartLesson={() => undefined} />)
    expect(screen.queryByRole('button', { name: 'Ôn lại ngay' })).toBeNull()

    act(() => { vi.advanceTimersByTime(90_000) })

    expect(screen.getByRole('button', { name: 'Ôn lại ngay' })).toBeTruthy()
  })

  it('keeps a due review next to an in-progress repeat and opens each with its own intent', async () => {
    const user = userEvent.setup()
    const onStartLesson = vi.fn()
    useAppStore.setState({
      lessonProgress: {
        [LESSON_ID]: {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input',
          reviewStage: 1,
          nextReviewAt: '2000-01-01T00:00:00.000Z'
        }
      }
    })

    render(<TodayPage onStartLesson={onStartLesson} />)

    await user.click(screen.getByRole('button', { name: 'Ôn lại ngay' }))
    expect(onStartLesson).toHaveBeenLastCalledWith(LESSON_ID, 'review')

    await user.click(screen.getByText(/bài khác trong lịch luyện/i))
    const resume = screen.getAllByRole('button').find((button) => /tiếp tục/i.test(button.textContent ?? '')
      && /disagree and recap/i.test(button.textContent ?? ''))
    if (!resume) throw new Error('Resume item missing')
    await user.click(resume)
    expect(onStartLesson).toHaveBeenLastCalledWith(LESSON_ID, 'continue')
  })

  it('asks for confirmation before repeating a completed mission and keeps the review schedule', async () => {
    const user = userEvent.setup()
    const onStartLesson = vi.fn()
    const lessons = useAppStore.getState().lessons
    useAppStore.setState({
      lessonProgress: Object.fromEntries(lessons.map((lesson) => [
        lesson.lessonId,
        {
          ...createEmptyLessonProgress(),
          status: 'completed' as const,
          transferCompleted: true,
          reviewStage: 2,
          completedExerciseIds: ['kept-until-confirmed'],
          nextReviewAt: '2099-01-01T00:00:00.000Z'
        }
      ]))
    })
    render(<TodayPage onStartLesson={onStartLesson} />)

    await user.click(screen.getByRole('button', { name: /luyện standup hoặc meeting/i }))

    const dialog = screen.getByRole('alertdialog', { name: /xác nhận luyện lại/i })
    expect(within(dialog).getByText(/xóa tiến độ vòng hiện tại/i)).toBeTruthy()
    expect(onStartLesson).not.toHaveBeenCalled()
    const before = Object.values(useAppStore.getState().lessonProgress)
    expect(before.every((progress) => progress.status === 'completed')).toBe(true)

    await user.click(within(dialog).getByRole('button', { name: /hủy/i }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(onStartLesson).not.toHaveBeenCalled()
    expect(Object.values(useAppStore.getState().lessonProgress).every((progress) => progress.status === 'completed')).toBe(true)

    await user.click(screen.getByRole('button', { name: /luyện standup hoặc meeting/i }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: /xác nhận luyện lại/i }))

    expect(onStartLesson).toHaveBeenCalledTimes(1)
    const [lessonId, entry] = onStartLesson.mock.calls[0] as [string, string]
    expect(entry).toBe('continue')
    expect(useAppStore.getState().lessonProgress[lessonId]).toMatchObject({
      status: 'in-progress',
      reviewStage: 2,
      completedExerciseIds: [],
      nextReviewAt: '2099-01-01T00:00:00.000Z'
    })
  })
})
