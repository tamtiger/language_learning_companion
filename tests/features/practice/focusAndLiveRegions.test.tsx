import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CanonicalReadingLadderV1, LearningLoopV1 } from '@/content/schema'
import { PerceptionPractice } from '@/features/practice/PerceptionPractice'
import { ReadingLadderPractice } from '@/features/practice/ReadingLadderPractice'
import { SpokenResponse } from '@/features/practice/SpokenResponse'

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(async () => 'blob:test-audio'),
  dispose: vi.fn()
}))

vi.mock('@/features/lesson-player/mediaRecorder', () => ({
  LocalMediaError: class LocalMediaError extends Error { kind = 'error' },
  startLocalAudioRecording: mocks.start
}))

function perception(): LearningLoopV1['perception'] {
  const audio = { kind: 'speech-synthesis' as const, text: 'tests', locale: 'en-US', voiceHints: ['English'] }
  const item = (id: string) => ({
    id, audio, question: 'What did you hear?', options: ['test', 'tests'], correctAnswer: 'tests', feedback: 'Listen for final /s/.'
  })
  return {
    pretest: Array.from({ length: 4 }, (_, index) => item(`pre-${index}`)),
    training: Array.from({ length: 6 }, (_, index) => item(`train-${index}`)),
    posttest: Array.from({ length: 4 }, (_, index) => item(`post-${index}`))
  }
}

describe('SpokenResponse focus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.start.mockResolvedValue({ stop: mocks.stop, dispose: mocks.dispose })
  })

  it('moves focus to the finish button after starting and to retry after finishing', async () => {
    const user = userEvent.setup()
    render(<SpokenResponse onReady={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu timer-only/i }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /tôi đã nói xong/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tôi đã nói xong/i }).getAttribute('aria-disabled')).toBeNull()
    }, { timeout: 1_500 })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: /làm lại/i })))
  })

  it('keeps the finish button focusable with a reason before one second has passed', async () => {
    const user = userEvent.setup()
    render(<SpokenResponse onReady={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /bắt đầu ghi âm/i }))
    const finish = screen.getByRole('button', { name: /tôi đã nói xong/i })
    expect(finish.hasAttribute('disabled')).toBe(false)
    expect(finish.getAttribute('aria-disabled')).toBe('true')
    expect(document.activeElement).toBe(finish)
    expect(document.getElementById(finish.getAttribute('aria-describedby') as string)?.textContent).toMatch(/nói ít nhất/i)
  })

  it('does not steal focus when the learner is somewhere else', async () => {
    const user = userEvent.setup()
    render(<><button type="button">ở ngoài</button><SpokenResponse onReady={vi.fn()} /></>)

    await user.click(screen.getByRole('button', { name: /bắt đầu timer-only/i }))
    const outside = screen.getByRole('button', { name: 'ở ngoài' })
    outside.focus()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tôi đã nói xong/i }).getAttribute('aria-disabled')).toBeNull()
    }, { timeout: 1_500 })
    expect(document.activeElement).toBe(outside)
  })
})

describe('PerceptionPractice focus and live regions', () => {
  it('keeps focus on the chosen option and announces the result', async () => {
    const user = userEvent.setup()
    render(<PerceptionPractice perception={perception()} onComplete={vi.fn()} />)

    const choice = screen.getByRole('button', { name: 'tests' })
    await user.click(choice)

    expect(document.activeElement).toBe(choice)
    expect(choice.hasAttribute('disabled')).toBe(false)
    expect(choice.getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('status', { name: /kết quả câu nghe/i }).textContent).toMatch(/đúng/i)
  })

  it('reports the right answer when wrong and ignores a second choice', async () => {
    const user = userEvent.setup()
    render(<PerceptionPractice perception={perception()} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'test' }))
    await user.click(screen.getByRole('button', { name: 'tests' }))

    expect(screen.getByRole('status', { name: /kết quả câu nghe/i }).textContent).toMatch(/đáp án: tests/i)
  })

  it('explains why the next button is blocked, then lets Tab reach it after answering', async () => {
    const user = userEvent.setup()
    render(<PerceptionPractice perception={perception()} onComplete={vi.fn()} />)

    const next = screen.getByRole('button', { name: /câu tiếp/i })
    expect(next.hasAttribute('disabled')).toBe(false)
    expect(next.getAttribute('aria-disabled')).toBe('true')
    expect(document.getElementById(next.getAttribute('aria-describedby') as string)?.textContent).toMatch(/chọn một đáp án/i)

    await user.click(screen.getByRole('button', { name: 'tests' }))
    expect(next.getAttribute('aria-disabled')).toBeNull()
    next.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText(/2\/4/)).toBeTruthy()
  })
})

const ladder: CanonicalReadingLadderV1 = {
  version: 'v1',
  trainingSource: {
    id: 'ladder-source', type: 'source', title: 'Runbook', content: 'Run cachectl migrate.', headingLevel: 4
  } as unknown as CanonicalReadingLadderV1['trainingSource'],
  extractionItems: [
    { id: 'x1', question: 'Which command?', options: ['cachectl migrate', 'cachectl drop'], correctAnswer: 'cachectl migrate', feedback: 'It is the first command.' },
    { id: 'x2', question: 'Which flag?', options: ['--target v2', '--target v1'], correctAnswer: '--target v2', feedback: 'v2 is the goal.' },
    { id: 'x3', question: 'Which check?', options: ['MIGRATION_COMPLETE', 'MIGRATION_FAILED'], correctAnswer: 'MIGRATION_COMPLETE', feedback: 'It signals success.' }
  ],
  applicationPrompt: 'Explain the steps.',
  applicationChecklist: ['I named the command', 'I named the check']
} as unknown as CanonicalReadingLadderV1

describe('ReadingLadderPractice live regions', () => {
  it('announces extraction feedback and explains the blocked next step', async () => {
    const user = userEvent.setup()
    render(<ReadingLadderPractice lessonId="lesson" ladder={ladder} onComplete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /đã đọc một lần/i }))

    const next = screen.getByRole('button', { name: /sang explain\/apply/i })
    expect(next.hasAttribute('disabled')).toBe(false)
    expect(next.getAttribute('aria-disabled')).toBe('true')
    expect(document.getElementById(next.getAttribute('aria-describedby') as string)?.textContent).toMatch(/trả lời đúng/i)

    await user.click(screen.getByLabelText('cachectl drop'))
    const feedback = screen.getAllByRole('status')[0]
    expect(within(feedback).getByText(/chưa đúng/i)).toBeTruthy()
  })

  it('blocks completion with a reason until the draft and checklist are done', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ReadingLadderPractice lessonId="lesson" ladder={ladder} onComplete={onComplete} />)
    await user.click(screen.getByRole('button', { name: /đã đọc một lần/i }))
    await user.click(screen.getByLabelText('cachectl migrate'))
    await user.click(screen.getByLabelText('--target v2'))
    await user.click(screen.getByLabelText('MIGRATION_COMPLETE'))
    await user.click(screen.getByRole('button', { name: /sang explain\/apply/i }))

    const done = screen.getByRole('button', { name: /hoàn thành reading ladder/i })
    expect(done.getAttribute('aria-disabled')).toBe('true')
    await user.click(done)
    expect(onComplete).not.toHaveBeenCalled()

    await user.type(screen.getByRole('textbox'), 'First run the command.')
    await user.click(screen.getByLabelText('I named the command'))
    await user.click(screen.getByLabelText('I named the check'))
    expect(done.getAttribute('aria-disabled')).toBeNull()
    await user.click(done)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
