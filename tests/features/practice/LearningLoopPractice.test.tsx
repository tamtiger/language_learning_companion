import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LearningLoopV1 } from '@/content/schema'
import { LearningLoopPractice, LearningLoopProgress } from '@/features/practice/LearningLoopPractice'
import { recordPerceptionMiss } from '@/features/practice/learningLoopDiagnostics'

vi.mock('@/features/practice/PerceptionPractice', () => ({
  PerceptionPractice: ({ onComplete }: { onComplete: (result: object) => void }) => (
    <div>
      <button type="button" onClick={() => onComplete({
        pretestCorrect: 1, pretestTotal: 1, trainingCompleted: 1,
        posttestCorrect: 1, posttestTotal: 1, diagnosticMissedItemIds: [],
        optedOut: false, availableVariantCount: 1, variabilityQualified: false
      })}>Hoàn tất không lỗi</button>
      <button type="button" onClick={() => onComplete({
        pretestCorrect: 0, pretestTotal: 1, trainingCompleted: 1,
        posttestCorrect: 0, posttestTotal: 1, diagnosticMissedItemIds: ['pre-1'],
        optedOut: false, availableVariantCount: 1, variabilityQualified: false
      })}>Hoàn tất có lỗi</button>
    </div>
  )
}))

vi.mock('@/features/practice/GuidedShadowing', () => ({
  GuidedShadowing: ({ steps, onComplete }: { steps: string[]; onComplete: (stepIds: string[]) => void }) => (
    <div>
      <button type="button" onClick={() => onComplete([...steps])}>Hoàn tất đúng Sentence chunks</button>
      <button type="button" onClick={() => onComplete(['unexpected-step'])}>Báo sai bước Sentence chunks</button>
    </div>
  )
}))

const audio = { kind: 'speech-synthesis' as const, text: 'Could you clarify?', locale: 'en-US', voiceHints: ['English'] }
const loop: LearningLoopV1 = {
  version: 'v1',
  perception: { pretest: [], training: [], posttest: [] },
  pronunciationCues: [{
    id: 'final-s', ipa: '/s/', articulatoryCue: 'Release final s.',
    meaningRisk: 'Changes count.', triggerItemIds: ['pre-1']
  }],
  chunks: [{ id: 'chunk-1', function: 'clarify', text: 'Could you clarify ___?', meaning: 'clarify', slots: ['detail'], modelAudio: audio }],
  shadowingSteps: ['listen'],
  interactionTurns: [{ id: 'turn-1', kind: 'clarification', prompt: 'What do you mean?', expectedFunction: 'Clarify' }],
  listenBackChecklist: ['Clear ending']
}

describe('diagnostic-only pronunciation cue selection', () => {
  it('keeps pre/post misses but does not promote a training mistake to a diagnostic target', () => {
    let misses: string[] = []
    misses = recordPerceptionMiss(misses, 'pretest', 'pre-final-s')
    misses = recordPerceptionMiss(misses, 'training', 'train-final-s')
    misses = recordPerceptionMiss(misses, 'posttest', 'post-stress')

    expect(misses).toEqual(['pre-final-s', 'post-stress'])
  })

  it('keeps the four-step journey visible and explains when pronunciation needs no extra practice', async () => {
    const user = userEvent.setup()
    render(<LearningLoopPractice loop={loop} onComplete={vi.fn()} />)

    expect(screen.getByRole('navigation', { name: /tiến trình luyện nói/i })).toBeTruthy()
    expect(screen.getByText('Nghe nhận diện').getAttribute('aria-current')).toBe('step')
    expect(screen.getByText('Luyện phát âm')).toBeTruthy()
    expect(screen.getByText('Sentence chunks')).toBeTruthy()
    expect(screen.getByText('Lượt nói chính')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /hoàn tất không lỗi/i }))

    const currentStep = screen.getByText('Sentence chunks')
    expect(currentStep.getAttribute('aria-current')).toBe('step')
    expect(document.activeElement).toBe(currentStep)
    expect(screen.getByText(/không cần luyện bổ sung/i)).toBeTruthy()
  })

  it('marks pronunciation as the current personalized step when a diagnostic cue is triggered', async () => {
    const user = userEvent.setup()
    render(<LearningLoopPractice loop={loop} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /hoàn tất có lỗi/i }))

    expect(screen.getByText('Luyện phát âm').getAttribute('aria-current')).toBe('step')
    expect(screen.getByText('Release final s.')).toBeTruthy()
  })

  it('fails closed when the shadowing component reports steps outside the configured sequence', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<LearningLoopPractice loop={loop} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: /hoàn tất không lỗi/i }))
    await user.click(screen.getByRole('button', { name: /báo sai bước sentence chunks/i }))

    expect(onComplete).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toMatch(/đúng thứ tự/i)
  })

  it('emits process evidence after the reducer accepts the configured shadowing sequence', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<LearningLoopPractice loop={loop} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: /hoàn tất không lỗi/i }))
    await user.click(screen.getByRole('button', { name: /hoàn tất đúng sentence chunks/i }))

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ shadowingStepIds: ['listen'], optedOut: false }),
      { pronunciationStatus: 'not-needed' }
    )
  })

  it('keeps pronunciation outcome visible when the main speaking attempt becomes ready', () => {
    render(<LearningLoopProgress stage="ready" pronunciationStatus="not-needed" />)

    expect(screen.getByText('Lượt nói chính').getAttribute('aria-current')).toBe('step')
    expect(screen.getByText(/không cần luyện bổ sung/i)).toBeTruthy()
  })
})
