import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyLessonProgress } from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { TodayPage } from './TodayPage'

describe('TodayPage job-first shortcuts', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

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
})
