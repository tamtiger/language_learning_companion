import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LearningLoopV1 } from '@/content/schema'
import { PerceptionPractice } from '@/features/practice/PerceptionPractice'

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
  it('moves focus to the phase heading when the internal phase changes', async () => {
    const user = userEvent.setup()
    render(<PerceptionPractice perception={perception()} onComplete={vi.fn()} />)

    const answerCurrentItem = async (nextButtonName: RegExp) => {
      await user.click(screen.getByRole('button', { name: 'tests' }))
      await user.click(screen.getByRole('button', { name: nextButtonName }))
    }

    for (let index = 0; index < 3; index += 1) {
      await answerCurrentItem(/câu tiếp/i)
    }
    await answerCurrentItem(/sang phần tiếp theo/i)

    const heading = screen.getByRole('heading', { name: /nghe trước khi nói/i })
    expect(screen.getByText(/perception · training/i)).toBeTruthy()
    expect(document.activeElement).toBe(heading)

    for (let index = 0; index < 5; index += 1) {
      await answerCurrentItem(/câu tiếp/i)
    }
    await answerCurrentItem(/sang phần tiếp theo/i)

    expect(screen.getByText(/perception · posttest/i)).toBeTruthy()
    expect(document.activeElement).toBe(heading)
  })

  it('keeps the transcript hidden until an answer and supports an honest opt-out', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PerceptionPractice perception={perception()} onComplete={onComplete} />)
    expect(screen.queryByLabelText('Bản chép audio')).toBeNull()
    expect(screen.getByText(/TTS tổng hợp trên thiết bị/i)).toBeTruthy()
    expect(screen.getByText(/0 voice khả dụng/i)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'test' }))
    expect(screen.getByLabelText('Bản chép audio').textContent).toBe('tests')
    await user.click(screen.getByRole('button', { name: /bỏ qua/i }))
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({
      optedOut: true,
      trainingCompleted: 0,
      variabilityQualified: false
    }))
  })

  it('counts answered training items when opting out', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PerceptionPractice perception={perception()} onComplete={onComplete} />)

    for (let index = 0; index < 4; index += 1) {
      await user.click(screen.getByRole('button', { name: 'tests' }))
      await user.click(screen.getByRole('button', { name: index === 3 ? /sang phần tiếp theo/i : /câu tiếp/i }))
    }
    await user.click(screen.getByRole('button', { name: 'tests' }))
    await user.click(screen.getByRole('button', { name: /bỏ qua/i }))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ trainingCompleted: 1 }))
  })

  it('retains the full training count when opting out during posttest', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PerceptionPractice perception={perception()} onComplete={onComplete} />)

    for (let index = 0; index < 10; index += 1) {
      await user.click(screen.getByRole('button', { name: 'tests' }))
      await user.click(screen.getByRole('button', { name: index === 3 || index === 9 ? /sang phần tiếp theo/i : /câu tiếp/i }))
    }
    await user.click(screen.getByRole('button', { name: /bỏ qua/i }))

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ trainingCompleted: 6 }))
  })
})
