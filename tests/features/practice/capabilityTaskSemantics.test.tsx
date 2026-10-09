import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { createEmptyLessonProgress, type DurableCapabilityPhase } from '@/domain/progress/progress'
import { CapabilityTask } from '@/features/practice/CapabilityTask'
import { useAppStore } from '@/shared/hooks/useAppStore'

import { isBlocked } from '../../helpers/aria'

function mission(lessonId: string) {
  const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === lessonId)
  if (!lesson?.performanceTask) throw new Error(`Mission fixture missing: ${lessonId}`)
  return { lesson, task: lesson.performanceTask }
}

function resumeAt(lessonId: string, activePhase: DurableCapabilityPhase) {
  useAppStore.setState({
    lessonProgress: {
      [lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase }
    }
  })
}

function reasonOf(button: HTMLElement): string {
  return document.getElementById(button.getAttribute('aria-describedby') ?? '')?.textContent ?? ''
}

describe('CapabilityTask semantics', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it.each([
    ['baseline', null, /baseline/i],
    ['retry', 'retry', /retry/i],
    ['transfer', 'transfer', /transfer/i]
  ] as const)('names the %s phase in the task heading', (_name, activePhase, pattern) => {
    const { lesson, task } = mission('workplace-issue-update-b1')
    if (activePhase) resumeAt(lesson.lessonId, activePhase)
    render(<CapabilityTask lesson={lesson} task={task} />)

    const heading = screen.getByRole('heading', { level: 2, name: pattern })
    expect(heading.textContent).toContain(task.title)
  })

  it('names the review phase in the task heading', () => {
    const { lesson, task } = mission('workplace-issue-update-b1')
    useAppStore.setState({
      lessonProgress: {
        [lesson.lessonId]: { ...createEmptyLessonProgress(), status: 'completed', transferCompleted: true, nextReviewAt: '2020-01-01T00:00:00.000Z' }
      }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByRole('heading', { level: 2, name: /review/i })).toBeTruthy()
  })

  it('tags English prompts and the draft as English and Vietnamese prompts as Vietnamese', () => {
    const english = mission('workplace-issue-update-b1')
    const { unmount } = render(<CapabilityTask lesson={english.lesson} task={english.task} />)
    expect(screen.getByText(english.task.baselinePrompt).getAttribute('lang')).toBe('en')
    expect(screen.getByRole('textbox').getAttribute('lang')).toBe('en')
    unmount()

    const vietnamese = mission('workplace-clarification-request-b1')
    render(<CapabilityTask lesson={vietnamese.lesson} task={vietnamese.task} />)
    expect(screen.getByText(vietnamese.task.baselinePrompt).getAttribute('lang')).toBe('vi')
  })

  it('groups each rubric criterion under its own name', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission('workplace-issue-update-b1')
    resumeAt(lesson.lessonId, 'transfer')
    render(<CapabilityTask lesson={lesson} task={task} />)
    await user.type(screen.getByRole('textbox'), 'A draft to lock.')
    await user.click(screen.getByRole('button', { name: /chốt bản nháp/i }))

    for (const criterion of task.rubric) {
      const group = screen.getByRole('group', { name: criterion.label })
      expect(within(group).getByRole('button', { name: 'Đạt' })).toBeTruthy()
      expect(within(group).getByRole('button', { name: 'Chưa đạt' })).toBeTruthy()
    }
  })

  it('explains why the baseline cannot be saved yet and unblocks after writing', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission('workplace-issue-update-b1')
    render(<CapabilityTask lesson={lesson} task={task} />)

    const save = screen.getByRole('button', { name: /lưu baseline/i })
    expect(save.hasAttribute('disabled')).toBe(false)
    expect(isBlocked(save)).toBe(true)
    expect(reasonOf(save)).toMatch(/viết|nháp/i)

    await user.type(screen.getByRole('textbox'), 'A first attempt in English.')
    expect(isBlocked(save)).toBe(false)
  })

  it('explains why the main attempt is blocked before auto-checks are complete', () => {
    const { lesson, task } = mission('workplace-issue-update-b1')
    resumeAt(lesson.lessonId, 'input')
    render(<CapabilityTask lesson={lesson} task={task} />)

    const start = screen.getByRole('button', { name: /bắt đầu lượt chính/i })
    expect(isBlocked(start)).toBe(true)
    expect(reasonOf(start)).toMatch(/auto-check/i)
  })

  it('says what is missing for self-feedback and retry steps', async () => {
    const user = userEvent.setup()
    const { lesson, task } = mission('workplace-issue-update-b1')
    resumeAt(lesson.lessonId, 'retry')
    render(<CapabilityTask lesson={lesson} task={task} />)

    const next = screen.getByRole('button', { name: /sang transfer/i })
    expect(reasonOf(next)).toMatch(/viết|nháp/i)

    await user.type(screen.getByRole('textbox'), 'Retry text in English.')
    expect(reasonOf(screen.getByRole('button', { name: /sang transfer/i }))).toMatch(/chấm|rubric/i)
  })
})
