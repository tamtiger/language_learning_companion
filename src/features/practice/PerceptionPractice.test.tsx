import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LearningLoopV1 } from '../../content/schema'
import { PerceptionPractice } from './PerceptionPractice'

function perception(): LearningLoopV1['perception'] {
  const audio = { kind: 'speech-synthesis' as const, text: 'tests', locale: 'en-US', voiceHints: ['English'] }
  const item = (id: string, feedback?: string) => ({
    id, audio, question: 'What did you hear?', options: ['test', 'tests'], correctAnswer: 'tests', ...(feedback ? { feedback } : {})
  })
  return {
    pretest: Array.from({ length: 4 }, (_, index) => item(`pre-${index}`)),
    training: Array.from({ length: 6 }, (_, index) => item(`train-${index}`, 'Listen for final /s/.')),
    posttest: Array.from({ length: 4 }, (_, index) => item(`post-${index}`))
  }
}

describe('PerceptionPractice', () => {
  it('keeps the transcript hidden until an answer and supports an honest opt-out', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PerceptionPractice perception={perception()} onComplete={onComplete} />)
    expect(screen.queryByLabelText('Bản chép audio')).toBeNull()
    expect(screen.getByText(/TTS thử nghiệm/i)).toBeTruthy()
    expect(screen.getByText(/0 voice khả dụng/i)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'test' }))
    expect(screen.getByLabelText('Bản chép audio').textContent).toBe('tests')
    await user.click(screen.getByRole('button', { name: /bỏ qua/i }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ optedOut: true, variabilityQualified: false }))
  })
})
