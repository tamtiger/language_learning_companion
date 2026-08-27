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
  hintCount = 0,
  preparationSeconds = 30
): AttemptEvidence {
  return {
    attemptId,
    lessonId: 'workplace-issue-update-b1',
    taskId: 'issue-update-task',
    capabilityId: 'workplace-communication',
    phase,
    attemptedAt: '2026-08-18T08:00:00.000Z',
    durationSeconds: 60,
    wordCount: 100,
    rubric,
    independence: {
      usedVietnamese: false,
      usedTranslation: false,
      usedModelAnswer: false,
      hintCount,
      preparationSeconds
    },
    completed: true
  }
}

describe('capability progress evidence', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('separates transfer attempts from qualifying transfers', () => {
    const recentAttempts = [
      evidence('retry', 'retry', { 'evidence-boundary': 'met', impact: 'met', action: 'met' }),
      evidence('transfer-gap', 'transfer', { 'evidence-boundary': 'met', impact: 'not-met', action: 'met' }, 0, 91),
      evidence('transfer-pass', 'transfer', { 'evidence-boundary': 'met', impact: 'met', action: 'met' }, 1),
      { ...evidence('wrong-task', 'transfer', { 'evidence-boundary': 'met', impact: 'met', action: 'met' }), taskId: 'wrong-task' }
    ]
    useAppStore.setState({
      lessonProgress: {
        'workplace-issue-update-b1': {
          ...createEmptyLessonProgress(),
          attemptCount: 75,
          recentAttempts
        }
      }
    })

    render(<ProgressPage />)

    const card = screen.getByRole('heading', { name: /giao tiếp công việc/i })
      .closest('article')
    if (!card) throw new Error('Capability card missing')
    const scope = within(card)
    expect(scope.getByText('Attempts').nextElementSibling?.textContent).toBe('75')
    expect(scope.getByText('Transfer gần đây').nextElementSibling?.textContent).toBe('3')
    expect(scope.getByText('Transfer đạt gần đây').nextElementSibling?.textContent).toBe('1')
    expect(scope.getByText(/còn tiêu chí rubric chưa đạt/i)).toBeTruthy()
    expect(scope.getByText(/không thuộc đúng task/i)).toBeTruthy()
    expect(scope.getByText(/vượt thời gian chuẩn bị/i)).toBeTruthy()
    expect(scope.getAllByText(/60s · 100 từ/i)).toHaveLength(3)
  })

  it('attributes transfers by the lesson capability and rejects a mismatched claim', () => {
    useAppStore.setState({
      lessonProgress: {
        'workplace-issue-update-b1': {
          ...createEmptyLessonProgress(),
          attemptCount: 1,
          recentAttempts: [{
            ...evidence('wrong-capability', 'transfer', {
              'evidence-boundary': 'met', impact: 'met', action: 'met'
            }),
            capabilityId: 'technical-reading'
          }]
        }
      }
    })

    render(<ProgressPage />)

    const actualCapabilityCard = screen.getByRole('heading', { name: /giao tiếp công việc/i })
      .closest('article')
    if (!actualCapabilityCard) throw new Error('Actual capability card missing')
    const actualScope = within(actualCapabilityCard)
    expect(actualScope.getByText('Transfer gần đây').nextElementSibling?.textContent).toBe('1')
    expect(actualScope.getByText('Transfer đạt gần đây').nextElementSibling?.textContent).toBe('0')
    expect(actualScope.getByText(/không thuộc đúng capability/i)).toBeTruthy()

    const fakeCapabilityCard = screen.getByRole('heading', { name: /đọc tài liệu kỹ thuật/i })
      .closest('article')
    if (!fakeCapabilityCard) throw new Error('Fake capability card missing')
    const fakeScope = within(fakeCapabilityCard)
    expect(fakeScope.getByText('Transfer gần đây').nextElementSibling?.textContent).toBe('0')
    expect(fakeScope.getByText('Transfer đạt gần đây').nextElementSibling?.textContent).toBe('0')
  })
})
