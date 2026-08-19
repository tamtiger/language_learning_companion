import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import {
  createEmptyLessonProgress,
  type AttemptEvidence
} from '../../domain/progress/progress'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { ProgressPage } from './ProgressPage'

function evidence(
  attemptId: string,
  phase: AttemptEvidence['phase'],
  rubric: AttemptEvidence['rubric'],
  hintCount = 0
): AttemptEvidence {
  return {
    attemptId,
    lessonId: 'workplace-issue-update-b1',
    taskId: 'task',
    capabilityId: 'workplace-communication',
    phase,
    attemptedAt: '2026-08-18T08:00:00.000Z',
    durationSeconds: 60,
    rubric,
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount,
      preparationSeconds: 30
    },
    completed: true
  }
}

describe('capability progress evidence', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('separates transfer attempts from qualifying transfers', () => {
    const recentAttempts = [
      evidence('retry', 'retry', { clarity: 'met' }),
      evidence('transfer-gap', 'transfer', { clarity: 'not-met' }),
      evidence('transfer-pass', 'transfer', { clarity: 'met' }, 1)
    ]
    useAppStore.setState({
      lessonProgress: {
        mission: {
          ...createEmptyLessonProgress(),
          attemptCount: recentAttempts.length,
          recentAttempts
        }
      }
    })

    render(<ProgressPage />)

    const card = screen.getByRole('heading', { name: /giao tiếp công việc/i })
      .closest('article')
    if (!card) throw new Error('Capability card missing')
    const scope = within(card)
    expect(scope.getByText('Attempts').nextElementSibling?.textContent).toBe('3')
    expect(scope.getByText('Transfer attempts').nextElementSibling?.textContent).toBe('2')
    expect(scope.getByText('Transfer đạt').nextElementSibling?.textContent).toBe('1')
    expect(screen.getByText(/transfer đạt = toàn bộ rubric đạt.*không vượt giới hạn/i)).toBeTruthy()
  })
})
