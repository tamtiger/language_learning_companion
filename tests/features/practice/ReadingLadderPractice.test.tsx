import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CanonicalReadingLadderV1 } from '@/content/schema'
import { ReadingLadderPractice } from '@/features/practice/ReadingLadderPractice'

const ladder: CanonicalReadingLadderV1 = {
  version: 'v1',
  trainingSource: { id: 'source', type: 'source', title: 'Worker docs', format: 'technical-doc', content: 'Set maxAttempts above one to enable retries.' },
  extractionItems: [
    { id: 'one', question: 'First?', options: ['A', 'B'], correctAnswer: 'A', feedback: 'Choose A.' },
    { id: 'two', question: 'Second?', options: ['C', 'D'], correctAnswer: 'C', feedback: 'Choose C.' },
    { id: 'three', question: 'Third?', options: ['E', 'F'], correctAnswer: 'E', feedback: 'Choose E.' }
  ],
  applicationPrompt: 'Explain the rule and a safe test.',
  applicationChecklist: ['Fact and hypothesis are separate.', 'Expected signal is explicit.']
}

describe('ReadingLadderPractice', () => {
  it('hides the source, requires correct extraction, then an application draft and checklist', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ReadingLadderPractice lessonId="worker-docs" ladder={ladder} onComplete={onComplete} />)

    expect(screen.getByText(/maxAttempts above one/i)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Worker docs', level: 4 })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /bắt đầu trích xuất/i }))
    expect(screen.queryByText(/maxAttempts above one/i)).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: /trích action/i }))
    await user.click(screen.getByLabelText('B'))
    expect(screen.getByText(/chưa đúng.*choose a/i)).toBeTruthy()
    expect((screen.getByRole('button', { name: /sang explain/i }) as HTMLButtonElement).disabled).toBe(true)
    for (const answer of ['A', 'C', 'E']) await user.click(screen.getByLabelText(answer))
    await user.click(screen.getByRole('button', { name: /sang explain/i }))
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: /explain và apply/i }))

    const finish = screen.getByRole('button', { name: /hoàn thành reading ladder/i }) as HTMLButtonElement
    expect(finish.disabled).toBe(true)
    await user.type(screen.getByRole('textbox'), 'The rule requires multiple attempts. I would test one failing staging job.')
    for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox)
    await user.click(finish)
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
