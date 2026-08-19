import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getBundledCatalog } from '../../content/catalog'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { createEmptyLessonProgress, type DurableCapabilityPhase } from '../../domain/progress/progress'
import { CapabilityTask } from './CapabilityTask'

function mission() {
  const lesson = getBundledCatalog().lessons.find(
    (item) => item.lessonId === 'workplace-issue-update-b1'
  )
  if (!lesson?.performanceTask) throw new Error('Mission fixture missing')
  return { lesson, task: lesson.performanceTask }
}

describe('CapabilityTask session evidence', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('shows the learner written output during self-feedback without persisting it', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission()
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.type(screen.getByRole('textbox'), 'Baseline output.')
    await user.click(screen.getByRole('button', { name: /lưu baseline/i }))
    await user.click(screen.getByRole('button', { name: /bắt đầu lượt chính/i }))
    await user.type(screen.getByRole('textbox'), 'My unique measured incident update.')
    await user.click(screen.getByRole('button', { name: /đối chiếu rubric/i }))

    expect(screen.getByText('My unique measured incident update.')).toBeTruthy()
    expect(JSON.stringify(useAppStore.getState().lessonProgress)).not.toContain('My unique measured')
  })

  it('resumes the durable performance phase instead of inferring retry from attempts', () => {
    const { lesson, task } = mission()
    useAppStore.getState().setActivePhase(lesson.lessonId, 'performance')
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/written capability task · performance/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /đối chiếu rubric/i })).toBeTruthy()
  })

  it.each([
    ['input', /capability task · input/i],
    ['retry', /capability task · retry/i],
    ['transfer', /capability task · transfer/i]
  ] as const)('resumes the durable %s checkpoint', (activePhase, label) => {
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase: activePhase as DurableCapabilityPhase }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)
    expect(screen.getByText(label)).toBeTruthy()
  })

  it('gives a due review precedence over a stored phase', () => {
    const { lesson, task } = mission()
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: {
          ...createEmptyLessonProgress(),
          status: 'completed',
          activePhase: 'transfer',
          nextReviewAt: '2020-01-01T00:00:00.000Z'
        }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)
    expect(screen.getByText(/capability task · review/i)).toBeTruthy()
  })
})
