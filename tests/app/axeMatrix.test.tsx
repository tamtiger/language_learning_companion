import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it } from 'vitest'
import { CatalogPage } from '@/features/catalog/CatalogPage'
import { ProgressPage } from '@/features/progress/ProgressPage'
import { Settings } from '@/features/settings/Settings'
import { TodayPage } from '@/features/today/TodayPage'
import { createEmptyLessonProgress, type AttemptEvidence } from '@/domain/progress/progress'
import { useAppStore } from '@/shared/hooks/useAppStore'

import { expectNoViolations } from '../helpers/axe'

function attempt(phase: AttemptEvidence['phase'], qualifies: boolean): AttemptEvidence {
  return {
    attemptId: `${phase}-${qualifies}`,
    lessonId: 'workplace-issue-update-b1',
    taskId: 'issue-update-task',
    capabilityId: 'workplace-communication',
    phase,
    attemptedAt: '2026-08-18T08:00:00.000Z',
    durationSeconds: 60,
    wordCount: 90,
    rubric: { action: 'met' },
    independence: { usedVietnamese: false, usedTranslation: false, usedModelAnswer: false, hintCount: 0, preparationSeconds: 10 },
    assessment: qualifies ? { qualifies: true, reasons: [] } : { qualifies: false, reasons: ['too-short', 'rubric-gap'] },
    completed: true
  }
}

describe('axe: app screens in their main states', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('Today on first run', async () => {
    const { container } = render(<TodayPage onStartLesson={() => undefined} />)
    await expectNoViolations(container, 'today first run')
  })

  it('Today with a due review and a repeat confirmation', async () => {
    const user = userEvent.setup()
    const lessons = useAppStore.getState().lessons
    useAppStore.setState({
      lessonProgress: Object.fromEntries(lessons.map((lesson, index) => [
        lesson.lessonId,
        index === 0
          ? { ...createEmptyLessonProgress(), status: 'completed' as const, transferCompleted: true, nextReviewAt: '2000-01-01T00:00:00.000Z' }
          : { ...createEmptyLessonProgress(), status: 'completed' as const, transferCompleted: true, nextReviewAt: '2099-01-01T00:00:00.000Z' }
      ]))
    })
    const { container } = render(<TodayPage onStartLesson={() => undefined} />)
    await expectNoViolations(container, 'today review')

    await user.click(screen.getAllByRole('button', { name: /luyện/i }).find((button) => /standup|meeting|phỏng vấn|công việc/i.test(button.textContent ?? '')) as HTMLElement)
    await expectNoViolations(container, 'today repeat confirmation')
  })

  it('Catalog with and without a filter', async () => {
    const user = userEvent.setup()
    const { container } = render(<CatalogPage onStartLesson={() => undefined} />)
    await expectNoViolations(container, 'catalog')

    await user.selectOptions(within(container).getAllByRole('combobox')[0], 'international-meetings')
    await expectNoViolations(container, 'catalog filtered')
  })

  it('Progress with no attempts and with passed and missed transfers', async () => {
    const { container, unmount } = render(<ProgressPage />)
    await expectNoViolations(container, 'progress empty')
    unmount()

    useAppStore.setState({
      lessonProgress: {
        'workplace-issue-update-b1': {
          ...createEmptyLessonProgress(),
          attemptCount: 2,
          recentAttempts: [attempt('transfer', true), attempt('transfer', false), { ...attempt('transfer', true), attemptId: 'legacy', assessment: undefined }]
        }
      }
    })
    const second = render(<ProgressPage />)
    await expectNoViolations(second.container, 'progress with attempts')
  })

  it('Settings by default, with a pending import and with the reset confirmation', async () => {
    const user = userEvent.setup()
    const { container } = render(<Settings />)
    await expectNoViolations(container, 'settings')

    const valid = new File([JSON.stringify({
      storageVersion: 5, lessonProgress: {}, settings: { theme: 'dark' }, exportedAt: '2026-08-19T00:00:00.000Z'
    })], 'backup.json', { type: 'application/json' })
    await user.upload(screen.getByLabelText(/chọn file import/i), valid)
    await screen.findByRole('button', { name: /xác nhận import/i })
    await expectNoViolations(container, 'settings pending import')

    await user.click(screen.getByRole('button', { name: /xóa progress/i }))
    await expectNoViolations(container, 'settings reset confirmation')
  })
})
