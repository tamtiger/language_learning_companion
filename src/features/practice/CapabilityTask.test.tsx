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

function missionWithPracticeContexts() {
  const { lesson, task } = mission()
  const practiceContexts = {
    baseline: {
      title: 'Checkout incident brief',
      brief: 'Audience: platform handover team.',
      artifacts: [{ id: 'cold-alert', type: 'source' as const, title: 'Cold alert', format: 'code-snippet' as const, content: 'COLD_SIGNAL checkout_503=31%' }]
    },
    transfer: {
      title: 'Upload incident brief',
      brief: 'Audience: storage on-call.',
      artifacts: [{ id: 'transfer-alert', type: 'source' as const, title: 'Transfer alert', format: 'code-snippet' as const, content: 'TRANSFER_SIGNAL upload_failures=18%' }]
    },
    review: {
      title: 'Email queue brief',
      brief: 'Audience: messaging team.',
      artifacts: [{ id: 'review-alert', type: 'source' as const, title: 'Review alert', format: 'code-snippet' as const, content: 'REVIEW_SIGNAL queue_depth=4800' }]
    }
  }
  return {
    lesson,
    task: Object.assign({}, task, { practiceContexts }) as typeof task
  }
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

  it('shows cold-attempt artifacts before input while keeping instruction and model locked', () => {
    const { lesson, task } = missionWithPracticeContexts()
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/COLD_SIGNAL checkout_503=31%/i)).toBeTruthy()
    expect(screen.queryByText(/Incident notes/i)).toBeNull()
    expect(screen.queryByText(task.modelResponse)).toBeNull()
    expect(screen.queryByText(/TRANSFER_SIGNAL/i)).toBeNull()
  })

  it('shows only the unseen transfer artifacts when resuming transfer', () => {
    const { lesson, task } = missionWithPracticeContexts()
    useAppStore.getState().setActivePhase(lesson.lessonId, 'transfer')
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(/TRANSFER_SIGNAL upload_failures=18%/i)).toBeTruthy()
    expect(screen.queryByText(/COLD_SIGNAL/i)).toBeNull()
    expect(screen.queryByText(task.modelResponse)).toBeNull()
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
