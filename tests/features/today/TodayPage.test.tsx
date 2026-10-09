import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createEmptyLessonProgress,
  type AttemptEvidence,
  type AttemptPhase
} from '@/domain/progress/progress'
import { useAppStore } from '@/shared/hooks/useAppStore'
import { TodayPage } from '@/features/today/TodayPage'

describe('TodayPage job-first shortcuts', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  function createAttempt(phase: AttemptPhase): AttemptEvidence {
    return {
      attemptId: `attempt-${phase}`,
      lessonId: 'meeting-disagree-and-recap-b2',
      taskId: 'meeting-disagree-and-recap-task',
      capabilityId: 'international-meetings',
      phase,
      attemptedAt: '2026-08-21T00:00:00.000Z',
      durationSeconds: 60,
      wordCount: null,
      rubric: { clarity: 'met' },
      independence: {
        usedVietnamese: false,
        usedTranslation: false,
        usedModelAnswer: false,
        hintCount: 0,
        preparationSeconds: 15
      },
      completed: true
    }
  }

  it('frames the recommendation as a three-stage daily mission', () => {
    render(<TodayPage onStartLesson={() => undefined} />)

    expect(screen.getByRole('heading', { name: /nhiệm vụ hôm nay/i })).toBeTruthy()
    expect(screen.getByText('Thử sức')).toBeTruthy()
    expect(screen.getByText('Luyện & sửa')).toBeTruthy()
    expect(screen.getByText('Vận dụng mới')).toBeTruthy()
    expect(screen.getByText(/mở lịch ôn đúng lúc/i)).toBeTruthy()

    const progress = screen.getByRole('progressbar', { name: /tiến trình nhiệm vụ/i })
    expect(progress.getAttribute('value')).toBe('0')
    expect(progress.getAttribute('max')).toBe('3')
  })

  it('derives mission progress from the durable current phase', () => {
    useAppStore.setState({
      lessonProgress: {
        'meeting-disagree-and-recap-b2': {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'transfer',
          attemptCount: 2,
          recentAttempts: []
        }
      }
    })

    render(<TodayPage onStartLesson={() => undefined} />)

    const progress = screen.getByRole('progressbar', { name: /tiến trình nhiệm vụ/i })
    expect(progress.getAttribute('value')).toBe('2')
    expect(screen.getByText('2/3 chặng')).toBeTruthy()
    expect(screen.getByText('Tiếp theo: Vận dụng mới')).toBeTruthy()
  })

  it('uses a single evidence-linked checkpoint for a due review', () => {
    useAppStore.setState({
      lessonProgress: {
        'meeting-disagree-and-recap-b2': {
          ...createEmptyLessonProgress(),
          status: 'completed',
          transferCompleted: true,
          attemptCount: 3,
          recentAttempts: [
            createAttempt('baseline'),
            createAttempt('retry'),
            createAttempt('transfer')
          ],
          nextReviewAt: '2000-01-01T00:00:00.000Z'
        }
      }
    })

    render(<TodayPage onStartLesson={() => undefined} />)

    const progress = screen.getByRole('progressbar', { name: /tiến trình nhiệm vụ/i })
    expect(progress.getAttribute('value')).toBe('0')
    expect(progress.getAttribute('max')).toBe('1')
    expect(screen.getByText('0/1 chặng')).toBeTruthy()
    expect(screen.getByText('Tiếp theo: Ôn lại')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ôn lại ngay' })).toBeTruthy()
  })

  it('shows all six work intents and exposes spoken support before opening a lesson', () => {
    render(<TodayPage onStartLesson={() => undefined} />)

    const workIntentList = screen.getByRole('list', { name: /việc bạn cần luyện/i })
    expect(within(workIntentList).getAllByRole('button')).toHaveLength(6)

    const meeting = within(workIntentList).getByRole('button', { name: /luyện standup hoặc meeting/i })
    expect(within(meeting).getByText('Daily Standup: Cập nhật tiến độ rõ ràng')).toBeTruthy()
    expect(within(meeting).getByText('Sentence chunks')).toBeTruthy()
    expect(within(meeting).getByText('Luyện phát âm')).toBeTruthy()

    const reading = within(workIntentList).getByRole('button', { name: /đọc docs hoặc logs/i })
    expect(within(reading).getByText('Viết đầu ra công việc')).toBeTruthy()
  })

  it('opens Daily Standup directly from the meeting intent on first run', async () => {
    const user = userEvent.setup()
    const onStartLesson = vi.fn()
    render(<TodayPage onStartLesson={onStartLesson} />)

    await user.click(screen.getByRole('button', { name: /luyện standup hoặc meeting/i }))

    expect(onStartLesson).toHaveBeenCalledWith('daily-standup-b1')
  })

  it('prefers an in-progress lesson within the selected work intent', async () => {
    const user = userEvent.setup()
    const onStartLesson = vi.fn()
    useAppStore.setState({
      lessonProgress: {
        'meeting-disagree-and-recap-b2': {
          ...createEmptyLessonProgress(),
          status: 'in-progress',
          activePhase: 'input'
        }
      }
    })
    render(<TodayPage onStartLesson={onStartLesson} />)

    const meeting = screen.getByRole('button', { name: /luyện standup hoặc meeting/i })
    expect(within(meeting).getByText('Tiếp tục')).toBeTruthy()
    expect(within(meeting).getByText('Disagree and recap in an international meeting')).toBeTruthy()
    await user.click(meeting)

    expect(onStartLesson).toHaveBeenCalledWith('meeting-disagree-and-recap-b2')
  })

  it('starts a history-preserving repeat cycle from a completed work intent', async () => {
    const user = userEvent.setup()
    const onStartLesson = vi.fn()
    const lessons = useAppStore.getState().lessons
    const repeatedLesson = lessons.find((lesson) =>
      lesson.performanceTask && lesson.capabilities.includes('international-meetings')
    )
    if (!repeatedLesson) throw new Error('Repeat fixture missing')
    const previousAttempts = (['baseline', 'retry', 'transfer'] as const).map((phase) => ({
      ...createAttempt(phase),
      lessonId: repeatedLesson.lessonId,
      taskId: repeatedLesson.performanceTask?.id ?? 'missing-task'
    }))
    useAppStore.setState({
      lessonProgress: Object.fromEntries(lessons.map((lesson) => [
        lesson.lessonId,
        {
          ...createEmptyLessonProgress(),
          status: 'completed',
          attemptCount: lesson.lessonId === repeatedLesson.lessonId ? 4 : 1,
          recentAttempts: lesson.lessonId === repeatedLesson.lessonId ? previousAttempts : [],
          transferCompleted: true,
          nextReviewAt: '2099-01-01T00:00:00.000Z'
        }
      ]))
    })
    render(<TodayPage onStartLesson={onStartLesson} />)

    const meeting = screen.getByRole('button', { name: /luyện standup hoặc meeting/i })
    expect(within(meeting).getByText('Luyện lại')).toBeTruthy()
    await user.click(meeting)

    expect(onStartLesson).toHaveBeenCalledWith(repeatedLesson.lessonId)
    expect(useAppStore.getState().lessonProgress[repeatedLesson.lessonId]).toMatchObject({
      status: 'in-progress',
      attemptCount: 4,
      recentAttempts: previousAttempts,
      transferCompleted: false,
      nextReviewAt: '2099-01-01T00:00:00.000Z'
    })
    const missionProgress = screen.getByRole('progressbar', { name: /tiến trình nhiệm vụ/i })
    expect(missionProgress.getAttribute('value')).toBe('0')
    expect(screen.getByText('0/3 chặng')).toBeTruthy()
    expect(screen.getByText('Tiếp theo: Thử sức')).toBeTruthy()
  })
})
