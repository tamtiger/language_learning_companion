import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { LearningLoopV1 } from '@/content/schema'
import { InteractionPractice } from '@/features/practice/InteractionPractice'
import { PerceptionPractice } from '@/features/practice/PerceptionPractice'

vi.mock('@/features/lesson-player/mediaRecorder', () => ({
  LocalMediaError: class LocalMediaError extends Error { kind = 'error' },
  startLocalAudioRecording: vi.fn()
}))

const KINDS: Array<LearningLoopV1['interactionTurns'][number]['kind']> = [
  'follow-up', 'clarification', 'misunderstanding', 'interruption', 'repair', 'recap'
]

describe('learner-facing labels do not expose internal names', () => {
  it.each(KINDS)('shows a Vietnamese label for the %s interaction turn', (kind) => {
    const { container } = render(<InteractionPractice turns={[{
      id: 't1', kind, prompt: 'What is the priority?', expectedFunction: 'answer briefly'
    }]} onComplete={vi.fn()} />)

    expect(screen.getByText(/^tương tác · /i)).toBeTruthy()
    const label = container.querySelector('p')?.textContent ?? ''
    expect(label).not.toContain(kind)
  })

  it('names the perception phases in Vietnamese', () => {
    const audio = { kind: 'speech-synthesis' as const, text: 'tests', locale: 'en-US', voiceHints: ['English'] }
    const item = (id: string) => ({ id, audio, question: 'Q?', options: ['a', 'b'], correctAnswer: 'a' })
    const perception = {
      pretest: [item('p1')],
      training: [item('t1')],
      posttest: [item('q1')]
    } as unknown as LearningLoopV1['perception']
    const { container } = render(<PerceptionPractice perception={perception} onComplete={vi.fn()} />)

    const label = container.querySelector('p')?.textContent ?? ''
    expect(label).toMatch(/nghe thử đầu/i)
    expect(label).not.toMatch(/pretest|training|posttest/i)
  })
})
