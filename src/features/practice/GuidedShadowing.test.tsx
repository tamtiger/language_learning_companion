import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LearningLoopV1 } from '../../content/schema'
import { GuidedShadowing } from './GuidedShadowing'

describe('GuidedShadowing', () => {
  it('fades from listening through delayed imitation to variation', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const steps: LearningLoopV1['shadowingSteps'] = ['listen', 'chunk-shadow', 'full-shadow', 'delayed-imitation', 'variation']
    const chunks: LearningLoopV1['chunks'] = Array.from({ length: 4 }, (_, index) => ({
      id: `chunk-${index}`, function: 'clarify', text: 'Let me clarify ___.', meaning: 'clarify', slots: ['detail'],
      modelAudio: { kind: 'speech-synthesis', text: 'Let me clarify.', locale: 'en-US', voiceHints: ['English'] }
    }))
    render(<GuidedShadowing chunks={chunks} steps={steps} onComplete={onComplete} />)
    expect(screen.getByText(/nghe để hiểu ý/i)).toBeTruthy()
    expect(screen.queryByText('Let me clarify ___.')).toBeNull()
    await user.click(screen.getByRole('button', { name: /hoàn thành bước/i }))
    expect(screen.getByText('Let me clarify ___.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /hoàn thành bước/i }))
    await user.click(screen.getByRole('button', { name: /hoàn thành bước/i }))
    expect(screen.getByText(/đợi 3 giây/i)).toBeTruthy()
    expect(screen.queryByText('Let me clarify ___.')).toBeNull()
    await user.click(screen.getByRole('button', { name: /hoàn thành bước/i }))
    expect(screen.getByText(/thay dữ kiện/i)).toBeTruthy()
    expect(screen.getByText('Let me clarify ___.')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /hoàn thành guided/i }))
    expect(onComplete).toHaveBeenCalledWith(steps)
  })
})
